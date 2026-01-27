package com.healthdemo.health

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return
    HealthSyncScheduler.schedule(context)

    val prefs = context.getSharedPreferences("health_tracking", Context.MODE_PRIVATE)
    if (prefs.getBoolean("tracking_enabled", false)) {
      val serviceIntent = Intent(context, StepCounterService::class.java)
      context.startForegroundService(serviceIntent)
    }
  }
}
