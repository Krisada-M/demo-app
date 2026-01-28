package com.healthdemo.health

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import org.json.JSONObject
import java.time.Instant

class HealthStore(context: Context) {
  private val dbHelper = HealthDbHelper(context.applicationContext)

  data class HourlyBucket(
    val dateLocal: String,
    val hourLocal: Int,
    val startTimeUtc: String,
    val endTimeUtc: String,
    val steps: Long,
    val distanceMeters: Double,
    val activeKcal: Double,
    val source: String,
    val updatedAtUtc: String,
    val hcStatus: String,
    val clientRecordVersion: Long,
    val hcUuids: String?,
  )

  fun upsertBucketDelta(
    dateLocal: String,
    hourLocal: Int,
    startTimeUtc: String,
    endTimeUtc: String,
    deltaSteps: Long,
    deltaDistance: Double,
    deltaKcal: Double,
    source: String,
  ) {
    val db = dbHelper.writableDatabase
    db.beginTransaction()
    try {
      val existing = getBucket(dateLocal, hourLocal)
      val newSteps = (existing?.steps ?: 0L) + deltaSteps
      val newDistance = (existing?.distanceMeters ?: 0.0) + deltaDistance
      val newKcal = (existing?.activeKcal ?: 0.0) + deltaKcal
      val newVersion = (existing?.clientRecordVersion ?: 0L) + 1L

      val values = ContentValues().apply {
        put("date_local", dateLocal)
        put("hour_local", hourLocal)
        put("start_time_utc", startTimeUtc)
        put("end_time_utc", endTimeUtc)
        put("steps", newSteps)
        put("distance_meters", newDistance)
        put("active_kcal", newKcal)
        put("source", source)
        put("updated_at_utc", Instant.now().toString())
        put("hc_status", "PENDING")
        put("client_record_version", newVersion)
        put("hc_uuids", existing?.hcUuids)
      }

      db.insertWithOnConflict(
        HealthDbHelper.TABLE_HOURLY_BUCKETS,
        null,
        values,
        android.database.sqlite.SQLiteDatabase.CONFLICT_REPLACE,
      )
      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  fun upsertBucketSnapshot(
    dateLocal: String,
    hourLocal: Int,
    startTimeUtc: String,
    endTimeUtc: String,
    steps: Long,
    distanceMeters: Double,
    activeKcal: Double,
    source: String,
  ) {
    val db = dbHelper.writableDatabase
    db.beginTransaction()
    try {
      val existing = getBucket(dateLocal, hourLocal)
      val version = existing?.clientRecordVersion ?: 0L
      val values = ContentValues().apply {
        put("date_local", dateLocal)
        put("hour_local", hourLocal)
        put("start_time_utc", startTimeUtc)
        put("end_time_utc", endTimeUtc)
        put("steps", steps)
        put("distance_meters", distanceMeters)
        put("active_kcal", activeKcal)
        put("source", source)
        put("updated_at_utc", Instant.now().toString())
        put("hc_status", "SYNCED")
        put("client_record_version", version)
        put("hc_uuids", existing?.hcUuids)
      }

      db.insertWithOnConflict(
        HealthDbHelper.TABLE_HOURLY_BUCKETS,
        null,
        values,
        android.database.sqlite.SQLiteDatabase.CONFLICT_REPLACE,
      )
      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  fun getBucketsForDate(dateLocal: String): List<HourlyBucket> {
    val db = dbHelper.readableDatabase
    val cursor = db.query(
      HealthDbHelper.TABLE_HOURLY_BUCKETS,
      null,
      "date_local = ?",
      arrayOf(dateLocal),
      null,
      null,
      "hour_local ASC",
    )
    return cursor.use { readBuckets(it) }
  }

  fun getDailyTotalsForDate(dateLocal: String): HourlyBucket? {
    val db = dbHelper.readableDatabase
    val cursor = db.rawQuery(
      """
        SELECT date_local, -1 AS hour_local, '' AS start_time_utc, '' AS end_time_utc,
               SUM(steps) AS steps,
               SUM(distance_meters) AS distance_meters,
               SUM(active_kcal) AS active_kcal,
               'AGG' AS source,
               MAX(updated_at_utc) AS updated_at_utc,
               'AGG' AS hc_status,
               MAX(client_record_version) AS client_record_version,
               NULL AS hc_uuids
        FROM ${HealthDbHelper.TABLE_HOURLY_BUCKETS}
        WHERE date_local = ?
      """.trimIndent(),
      arrayOf(dateLocal),
    )
    return cursor.use {
      if (!it.moveToFirst()) return@use null
      val stepsIndex = it.getColumnIndexOrThrow("steps")
      if (it.isNull(stepsIndex)) return@use null
      readBucket(it)
    }
  }

  fun getPendingBuckets(limit: Int): List<HourlyBucket> {
    val db = dbHelper.readableDatabase
    val cursor = db.query(
      HealthDbHelper.TABLE_HOURLY_BUCKETS,
      null,
      "hc_status = ?",
      arrayOf("PENDING"),
      null,
      null,
      "updated_at_utc ASC",
      limit.toString(),
    )
    return cursor.use { readBuckets(it) }
  }

  fun markWritten(results: List<WriteResult>) {
    if (results.isEmpty()) return
    val db = dbHelper.writableDatabase
    db.beginTransaction()
    try {
      results.forEach { result ->
        val values = ContentValues().apply {
          put("hc_status", "WRITTEN")
          put("hc_uuids", result.hcUuids)
          put("updated_at_utc", Instant.now().toString())
        }
        db.update(
          HealthDbHelper.TABLE_HOURLY_BUCKETS,
          values,
          "date_local = ? AND hour_local = ?",
          arrayOf(result.dateLocal, result.hourLocal.toString()),
        )
      }
      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  fun encodeUuids(stepsId: String?, distanceId: String?, caloriesId: String?): String {
    return JSONObject()
      .put("steps", stepsId)
      .put("distance", distanceId)
      .put("activeCalories", caloriesId)
      .toString()
  }

  data class WriteResult(
    val dateLocal: String,
    val hourLocal: Int,
    val hcUuids: String,
  )

  private fun getBucket(dateLocal: String, hourLocal: Int): HourlyBucket? {
    val db = dbHelper.readableDatabase
    val cursor = db.query(
      HealthDbHelper.TABLE_HOURLY_BUCKETS,
      null,
      "date_local = ? AND hour_local = ?",
      arrayOf(dateLocal, hourLocal.toString()),
      null,
      null,
      null,
      "1",
    )
    return cursor.use {
      if (it.moveToFirst()) readBucket(it) else null
    }
  }

  private fun readBuckets(cursor: Cursor): List<HourlyBucket> {
    val buckets = mutableListOf<HourlyBucket>()
    while (cursor.moveToNext()) {
      buckets.add(readBucket(cursor))
    }
    return buckets
  }

  private fun readBucket(cursor: Cursor): HourlyBucket {
    return HourlyBucket(
      dateLocal = cursor.getString(cursor.getColumnIndexOrThrow("date_local")),
      hourLocal = cursor.getInt(cursor.getColumnIndexOrThrow("hour_local")),
      startTimeUtc = cursor.getString(cursor.getColumnIndexOrThrow("start_time_utc")),
      endTimeUtc = cursor.getString(cursor.getColumnIndexOrThrow("end_time_utc")),
      steps = cursor.getLong(cursor.getColumnIndexOrThrow("steps")),
      distanceMeters = cursor.getDouble(cursor.getColumnIndexOrThrow("distance_meters")),
      activeKcal = cursor.getDouble(cursor.getColumnIndexOrThrow("active_kcal")),
      source = cursor.getString(cursor.getColumnIndexOrThrow("source")),
      updatedAtUtc = cursor.getString(cursor.getColumnIndexOrThrow("updated_at_utc")),
      hcStatus = cursor.getString(cursor.getColumnIndexOrThrow("hc_status")),
      clientRecordVersion = cursor.getLong(cursor.getColumnIndexOrThrow("client_record_version")),
      hcUuids = cursor.getString(cursor.getColumnIndexOrThrow("hc_uuids")),
    )
  }
}
