import Foundation
import UIKit
import React

@objc(RazorpayFullscreenBridge)
class RazorpayFullscreenBridge: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  /// Force Razorpay modal to fullscreen on iPad
  @objc func configureForIPad() {
    DispatchQueue.main.async {
      // Get the key window
      guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let window = windowScene.windows.first else {
        print("⚠️ Could not get window for Razorpay fullscreen config")
        return
      }
      
      // Check if running on iPad
      if UIDevice.current.userInterfaceIdiom == .pad {
        print("✅ Configuring Razorpay for iPad fullscreen presentation")
        
        // Set modal presentation style to fullscreen for all view controllers
        // This will affect the next presented modal (Razorpay)
        if let rootVC = window.rootViewController {
          self.configureViewController(rootVC)
        }
      }
    }
  }
  
  /// Recursively configure view controllers for fullscreen presentation
  private func configureViewController(_ viewController: UIViewController) {
    // Set default modal presentation style to fullscreen
    viewController.modalPresentationStyle = .fullScreen
    
    // Configure any presented view controllers
    if let presented = viewController.presentedViewController {
      configureViewController(presented)
    }
    
    // Configure navigation controller children
    if let navController = viewController as? UINavigationController {
      navController.viewControllers.forEach { configureViewController($0) }
    }
    
    // Configure tab bar controller children
    if let tabController = viewController as? UITabBarController {
      tabController.viewControllers?.forEach { configureViewController($0) }
    }
  }
}
