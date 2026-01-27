package com.healthdemo.health

import android.content.Context

class UserProfileStore(context: Context) {
  private val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun setWeightKg(weightKg: Double?) {
    prefs.edit().apply {
      if (weightKg == null) remove(KEY_WEIGHT_KG) else putFloat(KEY_WEIGHT_KG, weightKg.toFloat())
    }.apply()
  }

  fun setHeightCm(heightCm: Double?) {
    prefs.edit().apply {
      if (heightCm == null) remove(KEY_HEIGHT_CM) else putFloat(KEY_HEIGHT_CM, heightCm.toFloat())
    }.apply()
  }

  fun setStrideLengthMeters(strideLengthMeters: Double?) {
    prefs.edit().apply {
      if (strideLengthMeters == null) remove(KEY_STRIDE_M) else putFloat(KEY_STRIDE_M, strideLengthMeters.toFloat())
    }.apply()
  }

  fun getWeightKg(): Double {
    return prefs.getFloat(KEY_WEIGHT_KG, DEFAULT_WEIGHT_KG).toDouble()
  }

  fun getHeightCm(): Double? {
    return prefs.getFloat(KEY_HEIGHT_CM, -1f).takeIf { it > 0 }.let { value ->
      if (value == null) null else value.toDouble()
    }
  }

  fun getStrideLengthMeters(): Double {
    val stored = prefs.getFloat(KEY_STRIDE_M, -1f)
    if (stored > 0) return stored.toDouble()
    val heightCm = getHeightCm() ?: return DEFAULT_STRIDE_M
    return (heightCm / 100.0) * STRIDE_RATIO
  }

  fun getProfile(): Profile {
    return Profile(
      weightKg = getWeightKg(),
      heightCm = getHeightCm(),
      strideLengthMeters = getStrideLengthMeters(),
    )
  }

  data class Profile(
    val weightKg: Double,
    val heightCm: Double?,
    val strideLengthMeters: Double,
  )

  companion object {
    private const val PREFS_NAME = "health_profile"
    private const val KEY_WEIGHT_KG = "weightKg"
    private const val KEY_HEIGHT_CM = "heightCm"
    private const val KEY_STRIDE_M = "strideMeters"

    private const val DEFAULT_WEIGHT_KG = 70f
    private const val DEFAULT_STRIDE_M = 0.7
    private const val STRIDE_RATIO = 0.414
  }
}
