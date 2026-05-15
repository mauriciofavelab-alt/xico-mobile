// TODO · Task 6.3 wrap-up · BUNDLE FONTS IN THE WIDGET EXTENSION
//
// Several widget views call .custom("Fraunces", size: ...) and
// .custom("Newsreader-Italic", size: ...) (DespachoSmall/Medium/Large/StandBy
// views). Custom fonts in a widget extension require the .ttf files to be
// bundled INTO the extension target (UIAppFonts in the extension's Info.plist
// won't help · the system loads widget fonts from the extension bundle, not
// the host app).
//
// To bundle:
//   1. Copy from artifacts/xico-mobile/node_modules/@expo-google-fonts/fraunces/
//      and @expo-google-fonts/newsreader/ into ./fonts/ here.
//      (Actual filenames vary by package version · they are typically
//       Fraunces_500Medium.ttf and Newsreader_400Regular_Italic.ttf · check
//       the package's index.js for the exact font name → file mapping.)
//   2. Uncomment the `fonts` block below.
//   3. In Swift, reference fonts by PostScript name · e.g.,
//      .custom("Fraunces-Medium", size: 56)  · NOT .custom("Fraunces", ...)
//      The current widget code uses the family name · it'll need a tiny
//      update once the .ttf actually carries the PostScript metadata.
//
// Until this lands, widgets fall back to system font for .custom() calls ·
// the layout still renders correctly · acceptable for v1.1 Build #11.
// node_modules wasn't installed in this checkout (Phase 6 worktree) so the
// .ttf copy couldn't be done as part of Task 6.3 · deferred to Build #12 prep.

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
  // fonts: [
  //   "./fonts/Fraunces-Medium.ttf",
  //   "./fonts/Newsreader-Italic.ttf",
  //   "./fonts/Newsreader-Regular.ttf",
  // ],
};
