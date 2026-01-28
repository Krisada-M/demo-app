package com.healthdemo.health

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.healthdemo.R

object HealthNotification {
  const val CHANNEL_ID = "health_tracking"
  private const val CHANNEL_NAME = "Health Tracking"

  fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_LOW,
    )
    manager.createNotificationChannel(channel)
  }

  fun buildNotification(context: Context): Notification {
    return NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle("Health tracking")
      .setContentText("Measuring steps, distance, and calories")
      .setOngoing(true)
      .build()
  }
}
