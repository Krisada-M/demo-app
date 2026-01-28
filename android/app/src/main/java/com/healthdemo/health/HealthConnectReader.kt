package com.healthdemo.health

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
import java.time.LocalDate

class HealthConnectReader(private val client: HealthConnectClient) {
  suspend fun readHourlyTotals(date: LocalDate): Map<Int, HourlyTotals> {
    val ranges = BangkokTime.getHourlyRangesForDate(date)
    val totals = mutableMapOf<Int, HourlyTotals>()

    ranges.forEach { range ->
      val start = Instant.parse(range.startTimeUtc)
      val end = Instant.parse(range.endTimeUtc)
      try {
        // VERIFY IN DOCS: aggregate fields and units for Health Connect API versions.
        val result = client.aggregate(
          AggregateRequest(
            metrics = setOf(
              StepsRecord.COUNT_TOTAL,
              DistanceRecord.DISTANCE_TOTAL,
              ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
            ),
            timeRangeFilter = TimeRangeFilter.between(start, end),
          ),
        )
        val steps = result[StepsRecord.COUNT_TOTAL] ?: 0L
        val distance = result[DistanceRecord.DISTANCE_TOTAL]?.inMeters ?: 0.0
        val activeKcal = result[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories
          ?: 0.0
        totals[range.hourLocal] = HourlyTotals(steps, distance, activeKcal)
      } catch (_: Exception) {
        val fallback = readRecordsFallback(start, end)
        totals[range.hourLocal] = fallback
      }
    }

    return totals
  }

  fun requiredPermissions(): Set<String> {
    return setOf(
      HealthPermission.getReadPermission(StepsRecord::class),
      HealthPermission.getReadPermission(DistanceRecord::class),
      HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
    )
  }

  private suspend fun readRecordsFallback(start: Instant, end: Instant): HourlyTotals {
    // VERIFY IN DOCS: record time attribution when summing across buckets.
    val stepsResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end),
      ),
    )
    val distanceResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = DistanceRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end),
      ),
    )
    val caloriesResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = ActiveCaloriesBurnedRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end),
      ),
    )

    val steps = stepsResponse.records.sumOf { it.count }
    val distance = distanceResponse.records.sumOf { it.distance.inMeters }
    val activeKcal = caloriesResponse.records.sumOf { it.energy.inKilocalories }

    return HourlyTotals(steps, distance, activeKcal)
  }

  data class HourlyTotals(
    val steps: Long,
    val distanceMeters: Double,
    val activeKcal: Double,
  )
}
