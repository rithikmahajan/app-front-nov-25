import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseAppCheck
import UserNotifications
import AuthenticationServices

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Configure App Check BEFORE initializing Firebase
    // For development: Use AppCheckDebugProviderFactory
    // For production: Use DeviceCheckProviderFactory
    #if DEBUG
    let providerFactory = AppCheckDebugProviderFactory()
    #else
    let providerFactory = DeviceCheckProviderFactory()
    #endif
    AppCheck.setAppCheckProviderFactory(providerFactory)
    
    // Initialize Firebase
    FirebaseApp.configure()
    
    // Disable reCAPTCHA for phone auth (use APNS only)
    #if DEBUG
    Auth.auth().settings?.isAppVerificationDisabledForTesting = true
    #endif
    
    // Configure push notifications for Firebase Auth
    UNUserNotificationCenter.current().delegate = self
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: {_, _ in })
    application.registerForRemoteNotifications()
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "YoraaApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // MARK: - Push Notifications for Firebase Auth
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Auth.auth().setAPNSToken(deviceToken, type: .unknown)
  }
  
  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error)")
  }
  
  func application(_ application: UIApplication, didReceiveRemoteNotification notification: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    if Auth.auth().canHandleNotification(notification) {
      completionHandler(.noData)
      return
    }
    // This notification is not auth related; handle separately if needed
    completionHandler(.noData)
  }
  
  // MARK: - URL Scheme handling for Firebase Auth
  func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    if Auth.auth().canHandle(url) {
      return true
    }
    // URL not auth related; handle separately if needed
    return false
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
