package com.healthdemo.health

import java.time.Instant
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset

object BangkokTime {
  private val bangkokOffset = ZoneOffset.ofHours(7)

  fun nowLocalDate(): LocalDate {
    return Instant.now().atOffset(bangkokOffset).toLocalDate()
  }

  fun toLocalDate(utcMillis: Long): LocalDate {
    return Instant.ofEpochMilli(utcMillis).atOffset(bangkokOffset).toLocalDate()
  }

  fun toLocalHour(utcMillis: Long): Int {
    return Instant.ofEpochMilli(utcMillis).atOffset(bangkokOffset).hour
  }

  fun toDateLocalString(utcMillis: Long): String {
    val date = toLocalDate(utcMillis)
    return date.toString()
  }

  fun getHourRangeUtc(utcMillis: Long): HourRange {
    val local = Instant.ofEpochMilli(utcMillis).atOffset(bangkokOffset)
    val startLocal = local.withMinute(0).withSecond(0).withNano(0)
    val endLocal = startLocal.plusHours(1).minusNanos(1)

    val startUtc = startLocal.withOffsetSameInstant(ZoneOffset.UTC).toInstant()
    val endUtc = endLocal.withOffsetSameInstant(ZoneOffset.UTC).toInstant()

    return HourRange(
      dateLocal = startLocal.toLocalDate().toString(),
      hourLocal = startLocal.hour,
      startTimeUtc = startUtc.toString(),
      endTimeUtc = endUtc.toString(),
    )
  }

  fun getHourlyRangesForDate(date: LocalDate): List<HourRange> {
    val startOfDay = date.atStartOfDay().atOffset(bangkokOffset)
    val ranges = mutableListOf<HourRange>()
    for (hour in 0..23) {
      val startLocal = startOfDay.plusHours(hour.toLong())
      val endLocal = startLocal.plusHours(1).minusNanos(1)
      val startUtc = startLocal.withOffsetSameInstant(ZoneOffset.UTC).toInstant()
      val endUtc = endLocal.withOffsetSameInstant(ZoneOffset.UTC).toInstant()
      ranges.add(
        HourRange(
          dateLocal = startLocal.toLocalDate().toString(),
          hourLocal = startLocal.hour,
          startTimeUtc = startUtc.toString(),
          endTimeUtc = endUtc.toString(),
        ),
      )
    }
    return ranges
  }

  data class HourRange(
    val dateLocal: String,
    val hourLocal: Int,
    val startTimeUtc: String,
    val endTimeUtc: String,
  )
}
