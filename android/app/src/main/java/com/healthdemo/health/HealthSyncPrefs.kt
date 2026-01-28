package com.healthdemo.health

import android.content.Context

class HealthSyncPrefs(context: Context) {
  private val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun getLastSyncUtcMs(): Long = prefs.getLong(KEY_LAST_SYNC_MS, 0L)

  fun setLastSyncUtcMs(value: Long) {
    prefs.edit().putLong(KEY_LAST_SYNC_MS, value).apply()
  }

  fun getStatus(): String = prefs.getString(KEY_STATUS, STATUS_IDLE) ?: STATUS_IDLE

  fun getLastErrorMessage(): String? = prefs.getString(KEY_LAST_ERROR, null)

  fun setStatus(status: String, errorMessage: String? = null) {
    prefs.edit()
      .putString(KEY_STATUS, status)
      .putString(KEY_LAST_ERROR, errorMessage)
      .apply()
  }

  companion object {
    private const val PREFS_NAME = "health_sync"
    private const val KEY_LAST_SYNC_MS = "lastSyncMs"
    private const val KEY_STATUS = "syncStatus"
    private const val KEY_LAST_ERROR = "lastError"

    const val STATUS_IDLE = "IDLE"
    const val STATUS_SYNCING = "SYNCING"
    const val STATUS_ERROR = "ERROR"
  }
}
