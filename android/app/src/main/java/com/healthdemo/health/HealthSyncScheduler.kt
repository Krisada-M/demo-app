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
    val constraints = Constraints.Builder()
      .setRequiresBatteryNotLow(true)
      .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
      .build()

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
    val constraints = Constraints.Builder()
      .setRequiresBatteryNotLow(true)
      .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
      .build()

    val request = androidx.work.OneTimeWorkRequestBuilder<HealthSyncWorker>()
      .setConstraints(constraints)
      .build()

    WorkManager.getInstance(context).enqueue(request)
  }

  fun cancel(context: Context) {
    WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
  }
}
