package com.healthdemo.health

object Estimators {
  fun estimateDistanceMeters(stepsDelta: Long, strideLengthMeters: Double): Double {
    if (stepsDelta <= 0) return 0.0
    return stepsDelta * strideLengthMeters
  }

  fun estimateActiveCaloriesKcal(
    stepsDelta: Long,
    minutes: Double,
    weightKg: Double,
  ): Double {
    if (stepsDelta <= 0 || minutes <= 0) return 0.0
    val stepsPerMin = stepsDelta / minutes
    val met = when {
      stepsPerMin < 60 -> 2.0
      stepsPerMin < 100 -> 3.0
      stepsPerMin < 130 -> 4.0
      else -> 6.0
    }
    return met * weightKg * 3.5 / 200.0 * minutes
  }
}
