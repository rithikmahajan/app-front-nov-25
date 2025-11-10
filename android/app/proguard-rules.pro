# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep Razorpay classes
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Keep ProGuard annotations
-dontwarn proguard.annotation.**
-keep class proguard.annotation.** { *; }

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keep @com.facebook.proguard.annotations.KeepGettersAndSetters class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# React Native StatusBar - suppress warnings for deprecated APIs
# These are used by React Native's StatusBarModule and will be handled at runtime
-dontwarn android.view.Window
-keep class com.facebook.react.modules.statusbar.StatusBarModule { *; }

# AndroidX Core for edge-to-edge
-keep class androidx.core.view.WindowCompat { *; }
-keep class androidx.core.view.WindowInsetsCompat { *; }
