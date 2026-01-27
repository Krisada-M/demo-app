package com.healthdemo.health

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class HealthTrackingPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? {
    return if (name == HealthTrackingModule.NAME) {
      HealthTrackingModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        HealthTrackingModule.NAME to ReactModuleInfo(
          HealthTrackingModule.NAME,
          HealthTrackingModule::class.java.name,
          false,
          false,
          false,
          false,
        ),
      )
    }
  }
}
