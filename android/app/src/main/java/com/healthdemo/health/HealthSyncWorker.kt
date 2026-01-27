package com.healthdemo.health

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class HealthSyncWorker(
  appContext: Context,
  params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
  override suspend fun doWork(): Result {
    val prefs = HealthSyncPrefs(applicationContext)
    val now = System.currentTimeMillis()
    if (now - prefs.getLastWriteUtcMs() < MIN_WRITE_INTERVAL_MS) {
      return Result.success()
    }

    val store = HealthStore(applicationContext)
    val pending = store.getPendingBuckets(MAX_BUCKETS_PER_SYNC)
    if (pending.isEmpty()) {
      prefs.setLastWriteUtcMs(now)
      return Result.success()
    }

    val (nonEmpty, empty) = pending.partition { bucket ->
      bucket.steps > 0 || bucket.distanceMeters > 0.0 || bucket.activeKcal > 0.0
    }

    val emptyResults = empty.map {
      HealthStore.WriteResult(
        dateLocal = it.dateLocal,
        hourLocal = it.hourLocal,
        hcUuids = store.encodeUuids(null, null, null),
      )
    }

    return try {
      if (nonEmpty.isNotEmpty()) {
        val writer = HealthConnectWriter(applicationContext)
        val results = writer.writeBuckets(nonEmpty)
        store.markWritten(results + emptyResults)
      } else {
        store.markWritten(emptyResults)
      }
      prefs.setLastWriteUtcMs(now)
      Result.success()
    } catch (error: Exception) {
      Result.retry()
    }
  }

  companion object {
    private const val MIN_WRITE_INTERVAL_MS = 5 * 60 * 1000L
    private const val MAX_BUCKETS_PER_SYNC = 48
  }
}
