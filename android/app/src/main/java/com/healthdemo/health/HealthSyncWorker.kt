package com.healthdemo.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class HealthSyncWorker(
  appContext: Context,
  params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
  override suspend fun doWork(): Result {
    val prefs = HealthSyncPrefs(applicationContext)
    prefs.setStatus(HealthSyncPrefs.STATUS_SYNCING)

    val now = System.currentTimeMillis()
    if (now - prefs.getLastSyncUtcMs() < MIN_SYNC_INTERVAL_MS) {
      prefs.setStatus(HealthSyncPrefs.STATUS_IDLE)
      return Result.success()
    }

    val sdkStatus = HealthConnectClient.getSdkStatus(applicationContext)
    if (sdkStatus != HealthConnectClient.SDK_AVAILABLE) {
      prefs.setStatus(HealthSyncPrefs.STATUS_ERROR, "Health Connect unavailable")
      return Result.retry()
    }

    val client = HealthConnectClient.getOrCreate(applicationContext)
    val reader = HealthConnectReader(client)
    val granted = client.permissionController.getGrantedPermissions()
    val required = reader.requiredPermissions()
    if (!granted.containsAll(required)) {
      val trackingPrefs = applicationContext.getSharedPreferences("health_tracking", Context.MODE_PRIVATE)
      trackingPrefs.edit().putBoolean("tracking_enabled", false).apply()
      HealthSyncScheduler.cancel(applicationContext)
      prefs.setStatus(HealthSyncPrefs.STATUS_ERROR, "Health permissions revoked")
      return Result.success()
    }

    return try {
      val store = HealthStore(applicationContext)
      val writer = HealthConnectWriter(applicationContext)
      
      // STEP 1: Write pending buckets to Health Connect first
      val pending = store.getPendingBuckets(100)
      if (pending.isNotEmpty()) {
        val writeResults = writer.writeBuckets(pending)
        store.markWritten(writeResults)
      }
      
      // STEP 2: Read from Health Connect to sync external data
      val today = BangkokTime.nowLocalDate()
      val dates = listOf(today, today.minusDays(1))
      dates.forEach { date ->
        val ranges = BangkokTime.getHourlyRangesForDate(date)
        val totalsByHour = reader.readHourlyTotals(date)
        ranges.forEach { range ->
          val totals = totalsByHour[range.hourLocal]
          val existing = store.getBucket(range.dateLocal, range.hourLocal)
          
          // Only overwrite if not pending (to preserve local measurements)
          if (existing?.hcStatus != "PENDING") {
            store.upsertBucketSnapshot(
              dateLocal = range.dateLocal,
              hourLocal = range.hourLocal,
              startTimeUtc = range.startTimeUtc,
              endTimeUtc = range.endTimeUtc,
              steps = totals?.steps ?: 0L,
              distanceMeters = totals?.distanceMeters ?: 0.0,
              activeKcal = totals?.activeKcal ?: 0.0,
              source = "HC_SYNC",
            )
          }
        }
      }
      prefs.setLastSyncUtcMs(now)
      prefs.setStatus(HealthSyncPrefs.STATUS_IDLE)
      Result.success()
    } catch (error: Exception) {
      prefs.setStatus(HealthSyncPrefs.STATUS_ERROR, "Health sync failed: ${error.message}")
      Result.retry()
    }
  }

  companion object {
    private const val MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000L
  }
}
