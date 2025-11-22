package com.yoraa

import android.app.Activity
import android.content.Intent
import android.view.WindowManager
import com.facebook.react.bridge.*

class RazorpayFullscreenModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "RazorpayFullscreen"

    @ReactMethod
    fun setFullscreenMode(enable: Boolean, promise: Promise) {
        val activity = currentActivity
        
        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        try {
            activity.runOnUiThread {
                if (enable) {
                    // Enable fullscreen for Razorpay
                    @Suppress("DEPRECATION")
                    activity.window.setFlags(
                        WindowManager.LayoutParams.FLAG_FULLSCREEN,
                        WindowManager.LayoutParams.FLAG_FULLSCREEN
                    )
                    
                    // Hide system bars for immersive fullscreen
                    @Suppress("DEPRECATION")
                    activity.window.decorView.systemUiVisibility = (
                        android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                        or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    )
                    
                    // Ensure the window expands to full screen
                    activity.window.attributes.apply {
                        width = WindowManager.LayoutParams.MATCH_PARENT
                        height = WindowManager.LayoutParams.MATCH_PARENT
                    }
                } else {
                    // Restore normal mode
                    @Suppress("DEPRECATION")
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
                    @Suppress("DEPRECATION")
                    activity.window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_VISIBLE
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_FULLSCREEN_ERROR", e.message)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        // Handle Razorpay activity result if needed
    }

    override fun onNewIntent(intent: Intent) {
        // Handle new intent if needed
    }

    private fun isTablet(): Boolean {
        val context = reactApplicationContext
        @Suppress("DEPRECATION")
        val xlarge = context.resources.configuration.screenLayout and 
                    android.content.res.Configuration.SCREENLAYOUT_SIZE_MASK >= 
                    android.content.res.Configuration.SCREENLAYOUT_SIZE_XLARGE
        @Suppress("DEPRECATION")
        val large = context.resources.configuration.screenLayout and 
                   android.content.res.Configuration.SCREENLAYOUT_SIZE_MASK >= 
                   android.content.res.Configuration.SCREENLAYOUT_SIZE_LARGE
        return xlarge || large
    }
}
