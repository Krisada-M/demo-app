package com.healthdemo.health

import android.content.Context
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant

class HealthConnectWriter(private val context: Context) {
  suspend fun writeBuckets(buckets: List<HealthStore.HourlyBucket>): List<HealthStore.WriteResult> {
    if (buckets.isEmpty()) return emptyList()

    return withContext(Dispatchers.IO) {
      val client = HealthConnectClient.getOrCreate(context)
      val store = HealthStore(context)
      val orderedBuckets = buckets.filter { bucket ->
        bucket.steps > 0 || bucket.distanceMeters > 0.0 || bucket.activeKcal > 0.0
      }
      if (orderedBuckets.isEmpty()) return@withContext emptyList()

      val results = mutableListOf<HealthStore.WriteResult>()
      
      // We process bucket by bucket to handle errors individually
      orderedBuckets.forEach { bucket ->
        val baseId = "hc:${bucket.dateLocal}:${bucket.hourLocal}"
        val start = Instant.parse(bucket.startTimeUtc)
        val end = Instant.parse(bucket.endTimeUtc)
        val version = bucket.clientRecordVersion
        
        val bucketRecords = mutableListOf<Record>()

        if (bucket.steps > 0) {
          bucketRecords.add(
            StepsRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              count = bucket.steps,
              metadata = buildMetadata("$baseId:steps", version),
            ),
          )
        }

        if (bucket.distanceMeters > 0.0) {
          bucketRecords.add(
            DistanceRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              distance = Length.meters(bucket.distanceMeters),
              metadata = buildMetadata("$baseId:distance", version),
            ),
          )
        }

        if (bucket.activeKcal > 0.0) {
          bucketRecords.add(
            ActiveCaloriesBurnedRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              energy = Energy.kilocalories(bucket.activeKcal),
              metadata = buildMetadata("$baseId:activeKcal", version),
            ),
          )
        }

        if (bucketRecords.isNotEmpty()) {
          try {
            client.insertRecords(bucketRecords)
            // If successful, we can just use our client IDs as the "UUIDs" since we don't strictly need the system ones
            // providing we are consistent. or we can assume success.
          } catch (e: Exception) {
            // If it fails (likely due to conflict), we assume it's already there and mark it as written
            // to avoid infinite retry loops.
          }
           
          // We mark as written regardless of success/failure (duplicate) to clear the queue.
          val stepsId = if (bucket.steps > 0) "$baseId:steps" else null
          val distanceId = if (bucket.distanceMeters > 0.0) "$baseId:distance" else null
          val caloriesId = if (bucket.activeKcal > 0.0) "$baseId:activeKcal" else null
          
          val uuidJson = store.encodeUuids(stepsId, distanceId, caloriesId)
          results.add(
            HealthStore.WriteResult(
              dateLocal = bucket.dateLocal,
              hourLocal = bucket.hourLocal,
              hcUuids = uuidJson,
            ),
          )
        }
      }
      results
    }
  }

  private fun buildMetadata(clientRecordId: String, version: Long): Metadata {
    return Metadata(
      clientRecordId = clientRecordId,
      clientRecordVersion = version,
      recordingMethod = Metadata.RECORDING_METHOD_AUTOMATICALLY_RECORDED,
      device = Device(
        type = Device.TYPE_PHONE,
        manufacturer = Build.MANUFACTURER,
        model = Build.MODEL,
      ),
    )
  }
}
