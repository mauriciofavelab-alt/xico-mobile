import { requireNativeModule } from "expo-modules-core";

/**
 * Live Activity bridge · JS-side typed wrapper around the native
 * `LiveActivityModule` Swift Expo Module. Phase 7.2.
 *
 * Mirrors `RutaActivityAttributes.ContentState` in
 * `modules/live-activity/ios/LiveActivityModule.swift` and
 * `targets/XicoWidgets/RutaActivity.swift`. Field names + types MUST stay
 * aligned across all three files — Codable + Expo Records bridge by name,
 * so any drift breaks at runtime, not compile time.
 *
 * iOS-only feature. On Android / web, calling these throws "LiveActivity is
 * not available" — call sites are expected to guard with `areEnabled()`
 * first OR wrap in try/catch.
 */

export type RutaContentState = {
  /** Sellos earned this Ruta (0...stopsTotal). */
  stopsCompleted: number;
  /** Total stops in the active Ruta (usually 5). Must be > 0. */
  stopsTotal: number;
  /** Display name of the NEXT (unearned) stop. */
  nextStopName: string;
  /** Walking distance in meters to the next stop. 0 if unknown. */
  nextStopDistanceM: number;
  /** Hex color of the rumbo associated with the next stop (e.g. "#D9357B"). */
  nextStopRumboHex: string;
  /** Sello count per rumbo · canonical order [norte, este, sur, oeste]. */
  rosetonState: number[];
};

export type RutaAttributes = {
  /** ISO week key — e.g. "2026-W19". */
  weekKey: string;
  /** Curating editor's display name. */
  editorName: string;
};

export type StartParams = {
  attributes: RutaAttributes;
  contentState: RutaContentState;
};

export type UpdateParams = {
  id: string;
  contentState: Partial<RutaContentState>;
};

interface LiveActivityNative {
  startActivity(params: StartParams): Promise<string>;
  updateActivity(params: UpdateParams): Promise<void>;
  endActivity(id: string): Promise<void>;
  areActivitiesEnabled(): Promise<boolean>;
}

// Lazy native-module lookup. `requireNativeModule` throws on platforms
// where the module isn't installed (Android, web, Expo Go). Wrapping the
// access in a getter lets the rest of the app boot without a hard error
// when the module is missing; consumers should call `areEnabled()` first.
let cached: LiveActivityNative | null = null;
function getNative(): LiveActivityNative {
  if (cached) return cached;
  cached = requireNativeModule<LiveActivityNative>("LiveActivity");
  return cached;
}

export const LiveActivity = {
  /** Start a new Live Activity. Returns the activity id (persist this). */
  start: (params: StartParams) => getNative().startActivity(params),
  /** Update an existing Live Activity. Partial state allowed. */
  update: (params: UpdateParams) => getNative().updateActivity(params),
  /** End the Live Activity immediately. Idempotent on missing id. */
  end: (id: string) => getNative().endActivity(id),
  /** True iff the user has Live Activities enabled in Settings. */
  areEnabled: () => getNative().areActivitiesEnabled(),
};

export default LiveActivity;
