package com.healthdemo.health

import android.app.Service
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder

class StepCounterService : Service(), SensorEventListener {
  private lateinit var sensorManager: SensorManager
  private var stepSensor: Sensor? = null

  private lateinit var healthStore: HealthStore
  private lateinit var userProfileStore: UserProfileStore
  private lateinit var stepState: StepCounterState

  override fun onCreate() {
    super.onCreate()
    sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
    stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

    healthStore = HealthStore(this)
    userProfileStore = UserProfileStore(this)
    stepState = StepCounterState(this)

    HealthNotification.ensureChannel(this)
    startForeground(1, HealthNotification.buildNotification(this))
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val sensor = stepSensor
    if (sensor == null) {
      stopSelf()
      return START_NOT_STICKY
    }
    sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    return START_STICKY
  }

  override fun onDestroy() {
    sensorManager.unregisterListener(this)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

  override fun onSensorChanged(event: SensorEvent?) {
    val sensorEvent = event ?: return
    val counter = sensorEvent.values.firstOrNull() ?: return
    val nowUtcMs = System.currentTimeMillis()
    val delta = stepState.handleCounterValue(counter, nowUtcMs) ?: return

    val profile = userProfileStore.getProfile()
    val distance = Estimators.estimateDistanceMeters(delta.steps, profile.strideLengthMeters)
    val kcal = Estimators.estimateActiveCaloriesKcal(delta.steps, delta.minutes, profile.weightKg)
    val range = BangkokTime.getHourRangeUtc(nowUtcMs)

    healthStore.upsertBucketDelta(
      dateLocal = range.dateLocal,
      hourLocal = range.hourLocal,
      startTimeUtc = range.startTimeUtc,
      endTimeUtc = range.endTimeUtc,
      deltaSteps = delta.steps,
      deltaDistance = distance,
      deltaKcal = kcal,
      source = "ESTIMATE",
    )
  }
}
