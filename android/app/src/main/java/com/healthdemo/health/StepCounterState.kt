package com.healthdemo.health

import android.content.Context

class StepCounterState(context: Context) {
  private val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  data class StepDelta(val steps: Long, val minutes: Double)

  fun handleCounterValue(counter: Float, eventUtcMs: Long): StepDelta? {
    val lastCounter = prefs.getFloat(KEY_LAST_COUNTER, -1f)
    val lastEventMs = prefs.getLong(KEY_LAST_EVENT_MS, 0L)

    if (lastCounter < 0f || lastEventMs == 0L) {
      saveBaseline(counter, eventUtcMs)
      return null
    }

    val delta = counter - lastCounter
    if (delta < 0f) {
      saveBaseline(counter, eventUtcMs)
      return null
    }

    val minutes = ((eventUtcMs - lastEventMs).coerceAtLeast(0L)) / 60000.0
    saveBaseline(counter, eventUtcMs)

    if (delta <= 0f || minutes <= 0.0) {
      return null
    }

    return StepDelta(delta.toLong(), minutes)
  }

  private fun saveBaseline(counter: Float, eventUtcMs: Long) {
    prefs.edit()
      .putFloat(KEY_LAST_COUNTER, counter)
      .putLong(KEY_LAST_EVENT_MS, eventUtcMs)
      .apply()
  }

  companion object {
    private const val PREFS_NAME = "health_step_state"
    private const val KEY_LAST_COUNTER = "lastCounter"
    private const val KEY_LAST_EVENT_MS = "lastEventMs"
  }
}
