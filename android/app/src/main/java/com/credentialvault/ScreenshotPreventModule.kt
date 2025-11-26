package com.credentialvault

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ScreenshotPreventModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ScreenshotPrevent"

  private fun getActivity(): Activity? {
    return reactContext.currentActivity
  }

  @ReactMethod
  fun enableSecure() {
    val activity = getActivity() ?: return
    activity.runOnUiThread {
      activity.window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
      )
    }
  }

  @ReactMethod
  fun disableSecure() {
    val activity = getActivity() ?: return
    activity.runOnUiThread {
      activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
  }
}
