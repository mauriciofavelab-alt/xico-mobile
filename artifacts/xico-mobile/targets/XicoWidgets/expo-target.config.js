/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "XicoWidgets",
  displayName: "XICO",
  // Appended to the main app bundle id → com.xico.app.widgets
  bundleIdentifier: ".widgets",
  // Match the main app's iOS deployment target (see expo-build-properties in app.json)
  deploymentTarget: "17.0",
  // widget target auto-links: WidgetKit, SwiftUI, ActivityKit, AppIntents
  // ActivityKit means Live Activities live in the SAME extension target (the standard pattern).
  // No need for a separate XicoLiveActivity target.
  frameworks: ["WidgetKit", "SwiftUI", "ActivityKit", "AppIntents"],
  // App group lets the main app and the widget share UserDefaults / cached widget snapshot.
  entitlements: {
    "com.apple.security.application-groups": ["group.com.xico.app.widgets"],
  },
};
