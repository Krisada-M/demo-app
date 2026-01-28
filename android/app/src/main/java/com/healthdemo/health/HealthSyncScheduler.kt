package com.healthdemo.health

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object HealthSyncScheduler {
  private const val WORK_NAME = "health_sync"

  fun schedule(context: Context) {
    // WorkManager is used for reliable hourly sync that survives app restarts and reboots.
    val constraints = buildConstraints()
    val request = PeriodicWorkRequestBuilder<HealthSyncWorker>(1, TimeUnit.HOURS)
      .setConstraints(constraints)
      .build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
      WORK_NAME,
      ExistingPeriodicWorkPolicy.KEEP,
      request,
    )
  }

  fun scheduleNow(context: Context) {
    val constraints = buildConstraints()
    val request = androidx.work.OneTimeWorkRequestBuilder<HealthSyncWorker>()
      .setConstraints(constraints)
      .build()

    WorkManager.getInstance(context).enqueue(request)
  }

  fun cancel(context: Context) {
    WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
  }

  private fun buildConstraints(): Constraints {
    return Constraints.Builder()
      .setRequiresBatteryNotLow(true)
      .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
      .build()
  }
}
