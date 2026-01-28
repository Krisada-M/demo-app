package com.healthdemo.health

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class HealthDbHelper(context: Context) : SQLiteOpenHelper(
  context,
  DATABASE_NAME,
  null,
  DATABASE_VERSION,
) {
  override fun onCreate(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS $TABLE_HOURLY_BUCKETS (
        date_local TEXT NOT NULL,
        hour_local INTEGER NOT NULL,
        start_time_utc TEXT NOT NULL,
        end_time_utc TEXT NOT NULL,
        steps INTEGER NOT NULL,
        distance_meters REAL NOT NULL,
        active_kcal REAL NOT NULL,
        source TEXT NOT NULL,
        updated_at_utc TEXT NOT NULL,
        hc_status TEXT NOT NULL,
        client_record_version INTEGER NOT NULL,
        hc_uuids TEXT,
        PRIMARY KEY (date_local, hour_local)
      )
      """.trimIndent(),
    )
  }

  override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    db.execSQL("DROP TABLE IF EXISTS $TABLE_HOURLY_BUCKETS")
    onCreate(db)
  }

  companion object {
    private const val DATABASE_NAME = "health_tracking.db"
    private const val DATABASE_VERSION = 1
    const val TABLE_HOURLY_BUCKETS = "hourly_buckets"
  }
}
