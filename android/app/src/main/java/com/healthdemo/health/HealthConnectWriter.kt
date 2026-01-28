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
      val records = mutableListOf<Record>()
      val recordSpecs = mutableListOf<RecordSpec>()
      val store = HealthStore(context)
      val orderedBuckets = buckets.filter { bucket ->
        bucket.steps > 0 || bucket.distanceMeters > 0.0 || bucket.activeKcal > 0.0
      }
      if (orderedBuckets.isEmpty()) return@withContext emptyList()

      orderedBuckets.forEach { bucket ->
        val baseId = "hc:${bucket.dateLocal}:${bucket.hourLocal}"
        val start = Instant.parse(bucket.startTimeUtc)
        val end = Instant.parse(bucket.endTimeUtc)
        val version = bucket.clientRecordVersion

        if (bucket.steps > 0) {
          records.add(
            StepsRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              count = bucket.steps,
              metadata = buildMetadata("$baseId:steps", version),
            ),
          )
          recordSpecs.add(RecordSpec(bucket, "steps"))
        }

        if (bucket.distanceMeters > 0.0) {
          records.add(
            DistanceRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              distance = Length.meters(bucket.distanceMeters),
              metadata = buildMetadata("$baseId:distance", version),
            ),
          )
          recordSpecs.add(RecordSpec(bucket, "distance"))
        }

        if (bucket.activeKcal > 0.0) {
          records.add(
            ActiveCaloriesBurnedRecord(
              startTime = start,
              endTime = end,
              startZoneOffset = null,
              endZoneOffset = null,
              energy = Energy.kilocalories(bucket.activeKcal),
              metadata = buildMetadata("$baseId:activeKcal", version),
            ),
          )
          recordSpecs.add(RecordSpec(bucket, "activeCalories"))
        }
      }

      if (records.isEmpty()) return@withContext emptyList()

      val response = client.insertRecords(records)
      val ids = response.recordIdsList

      val idsByBucket = mutableMapOf<String, MutableMap<String, String?>>()
      recordSpecs.forEachIndexed { index, spec ->
        val key = "${spec.bucket.dateLocal}:${spec.bucket.hourLocal}"
        val map = idsByBucket.getOrPut(key) { mutableMapOf() }
        map[spec.type] = ids.getOrNull(index)
      }

      val results = mutableListOf<HealthStore.WriteResult>()
      orderedBuckets.forEach { bucket ->
        val key = "${bucket.dateLocal}:${bucket.hourLocal}"
        val map = idsByBucket[key]
        val stepsId = map?.get("steps")
        val distanceId = map?.get("distance")
        val caloriesId = map?.get("activeCalories")
        val uuidJson = store.encodeUuids(stepsId, distanceId, caloriesId)
        results.add(
          HealthStore.WriteResult(
            dateLocal = bucket.dateLocal,
            hourLocal = bucket.hourLocal,
            hcUuids = uuidJson,
          ),
        )
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

  private data class RecordSpec(
    val bucket: HealthStore.HourlyBucket,
    val type: String,
  )
}
