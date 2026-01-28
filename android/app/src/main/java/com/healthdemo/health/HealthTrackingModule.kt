package com.healthdemo.health

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.time.LocalDate

class HealthTrackingModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val store = HealthStore(reactContext)
  private val profileStore = UserProfileStore(reactContext)

  override fun getName(): String = NAME

  @ReactMethod
  fun startTracking() {
    startHourlyHealthSync()
  }

  @ReactMethod
  fun stopTracking() {
    stopHourlyHealthSync()
  }

  @ReactMethod
  fun startHourlyHealthSync() {
    val prefs = reactContext.getSharedPreferences("health_tracking", Context.MODE_PRIVATE)
    prefs.edit().putBoolean("tracking_enabled", true).apply()
    HealthSyncScheduler.schedule(reactContext)
  }

  @ReactMethod
  fun stopHourlyHealthSync() {
    val prefs = reactContext.getSharedPreferences("health_tracking", Context.MODE_PRIVATE)
    prefs.edit().putBoolean("tracking_enabled", false).apply()
    HealthSyncScheduler.cancel(reactContext)
  }

  @ReactMethod
  fun syncNow() {
    HealthSyncScheduler.scheduleNow(reactContext)
  }

  @ReactMethod
  fun getTodayHourlyBuckets(promise: Promise) {
    try {
      val today = BangkokTime.nowLocalDate()
      val buckets = store.getBucketsForDate(today.toString())
      val response = fillHourlyBuckets(today, buckets)
      promise.resolve(response)
    } catch (error: Exception) {
      promise.reject("GET_TODAY_ERROR", error)
    }
  }

  @ReactMethod
  fun getSyncStatus(promise: Promise) {
    try {
      promise.resolve(buildSyncStatus())
    } catch (error: Exception) {
      promise.reject("GET_SYNC_STATUS_ERROR", error)
    }
  }

  @ReactMethod
  fun getLastSyncStatus(promise: Promise) {
    try {
      promise.resolve(buildSyncStatus())
    } catch (error: Exception) {
      promise.reject("GET_SYNC_STATUS_ERROR", error)
    }
  }

  @ReactMethod
  fun getPendingBuckets(limit: Int, promise: Promise) {
    try {
      val pending = store.getPendingBuckets(limit)
      val result = Arguments.createArray()
      pending.forEach { bucket ->
        val map = Arguments.createMap()
        map.putString("dateLocal", bucket.dateLocal)
        map.putInt("hourLocal", bucket.hourLocal)
        map.putString("startTimeUtc", bucket.startTimeUtc)
        map.putString("endTimeUtc", bucket.endTimeUtc)
        map.putDouble("steps", bucket.steps.toDouble())
        map.putDouble("distanceMeters", bucket.distanceMeters)
        map.putDouble("activeKcal", bucket.activeKcal)
        map.putDouble("clientRecordVersion", bucket.clientRecordVersion.toDouble())
        result.pushMap(map)
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("GET_PENDING_ERROR", error)
    }
  }

  private fun buildSyncStatus(): WritableMap {
    val trackingPrefs = reactContext.getSharedPreferences("health_tracking", Context.MODE_PRIVATE)
    val trackingEnabled = trackingPrefs.getBoolean("tracking_enabled", false)
    val syncPrefs = HealthSyncPrefs(reactContext)
    val pendingCount = store.getPendingBuckets(500).size

    val map = Arguments.createMap()
    map.putBoolean("trackingEnabled", trackingEnabled)
    map.putDouble("lastSyncUtcMs", syncPrefs.getLastSyncUtcMs().toDouble())
    map.putString("status", syncPrefs.getStatus())
    syncPrefs.getLastErrorMessage()?.let { message ->
      map.putString("lastError", message)
    }
    map.putInt("pendingCount", pendingCount)
    return map
  }

  @ReactMethod
  fun markBucketsWritten(results: ReadableArray) {
    val items = mutableListOf<HealthStore.WriteResult>()
    for (i in 0 until results.size()) {
      val item = results.getMap(i) ?: continue
      val dateLocal = item.getString("dateLocal") ?: continue
      val hourLocal = item.getInt("hourLocal")
      val hcUuids = item.getString("hcUuids") ?: continue
      items.add(HealthStore.WriteResult(dateLocal, hourLocal, hcUuids))
    }
    store.markWritten(items)
  }

  @ReactMethod
  fun getDailyLast7Days(promise: Promise) {
    try {
      val today = BangkokTime.nowLocalDate()
      val result = Arguments.createArray()
      for (i in 6 downTo 0) {
        val date = today.minusDays(i.toLong())
        val daily = store.getDailyTotalsForDate(date.toString())
        val map = Arguments.createMap()
        map.putString("date", date.toString())
        map.putDouble("steps", (daily?.steps ?: 0L).toDouble())
        map.putDouble("activeCaloriesKcal", daily?.activeKcal ?: 0.0)
        map.putDouble("distanceMeters", daily?.distanceMeters ?: 0.0)
        result.pushMap(map)
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("GET_DAILY_ERROR", error)
    }
  }

  @ReactMethod
  fun setUserProfile(weightKg: Double, heightCm: Double, strideLengthMeters: Double) {
    if (weightKg > 0) profileStore.setWeightKg(weightKg) else profileStore.setWeightKg(null)
    if (heightCm > 0) profileStore.setHeightCm(heightCm) else profileStore.setHeightCm(null)
    if (strideLengthMeters > 0) profileStore.setStrideLengthMeters(strideLengthMeters)
    else profileStore.setStrideLengthMeters(null)
  }

  @ReactMethod
  fun getUserProfile(promise: Promise) {
    val profile = profileStore.getProfile()
    val map = Arguments.createMap()
    map.putDouble("weightKg", profile.weightKg)
    map.putDouble("strideLengthMeters", profile.strideLengthMeters)
    if (profile.heightCm != null) {
      map.putDouble("heightCm", profile.heightCm)
    }
    promise.resolve(map)
  }

  private fun fillHourlyBuckets(date: LocalDate, buckets: List<HealthStore.HourlyBucket>): WritableArray {
    val byHour = buckets.associateBy { it.hourLocal }
    val result = Arguments.createArray()
    for (hour in 0..23) {
      val bucket = byHour[hour]
      val map: WritableMap = Arguments.createMap()
      map.putInt("hourIndex", hour)
      map.putDouble("steps", (bucket?.steps ?: 0L).toDouble())
      map.putDouble("activeCaloriesKcal", bucket?.activeKcal ?: 0.0)
      map.putDouble("distanceMeters", bucket?.distanceMeters ?: 0.0)
      map.putString("date", date.toString())
      result.pushMap(map)
    }
    return result
  }

  companion object {
    const val NAME = "HealthTracking"
  }
}
