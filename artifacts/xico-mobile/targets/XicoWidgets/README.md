# XicoWidgets target

Native iOS extension hosting both WidgetKit surfaces AND ActivityKit Live Activities for XICO. Generated via the `@bacons/apple-targets` Expo config plugin (community).

## Why one target (not two)

`@bacons/apple-targets@4` v4 collapses WidgetKit and Live Activities into a single `widget`-type target. The `widget` extension auto-links `WidgetKit`, `SwiftUI`, `ActivityKit`, and `AppIntents` frameworks. This is also Apple's recommended pattern — a single WidgetKit extension bundle exposes multiple `Widget` and `ActivityConfiguration` instances via the `@main WidgetBundle`.

The original Phase 6 plan called for two separate targets (`XicoWidgets` + `XicoLiveActivity`). After verifying the v4 plugin source (`node_modules/@bacons/apple-targets/build/target.d.ts`), this was simplified to one target. Documented in ADR-007 (next vault entry).

## Upcoming Swift work (Tasks 6.2 onward)

- 6.2 — `XicoWidgets.swift` (`@main WidgetBundle`) + `DespachoSmallWidget.swift` (Home 2×2)
- 6.3 — Medium / Large home widgets, Lock-screen inline / circular / rectangular, StandBy mode
- 7.1 — `XicoLiveActivity.swift` (`ActivityConfiguration` for La Ruta · Dynamic Island compact / minimal / expanded)
- 7.2 — Push token registration · push-update channel from Railway API

## Data source

Widgets fetch via `/api/widget/today` (Task 6.4) — widgets run as separate iOS processes and cannot bundle the local `constants/despachos.ts`. See ADR-001 for the data-layer split.

## Bundle ids

- App: `com.xico.app`
- Widget extension: `com.xico.app.widgets` (set via `.widgets` shorthand in `expo-target.config.js`)
- App group (shared with main app): `group.com.xico.app.widgets`

## Apple team

`B76TK6N9VU` — sourced from `eas.json submit.production.ios.appleTeamId` and mirrored into `app.json ios.appleTeamId` so the plugin can sign the embedded target.

## Local development

```bash
cd artifacts/xico-mobile
npx expo prebuild --platform ios --clean
xed ios   # open the generated Xcode workspace, find expo:targets/XicoWidgets
```

The native `ios/` directory is gitignored — re-run `prebuild` after any change to `expo-target.config.js` or `app.json`.
