package com.healthdemo.health

import android.content.Context

class HealthSyncPrefs(context: Context) {
  private val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun getLastWriteUtcMs(): Long = prefs.getLong(KEY_LAST_WRITE_MS, 0L)

  fun setLastWriteUtcMs(value: Long) {
    prefs.edit().putLong(KEY_LAST_WRITE_MS, value).apply()
  }

  companion object {
    private const val PREFS_NAME = "health_sync"
    private const val KEY_LAST_WRITE_MS = "lastWriteMs"
  }
}
