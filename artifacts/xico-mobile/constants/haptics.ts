// Centralized haptic API for XICO · 2026-05-15
//
// One thin wrapper around expo-haptics so every screen calls the same vocabulary.
// All calls are fire-and-forget · errors are swallowed (the simulator throws,
// some Android devices throw, neither failure mode should ever bubble into a
// user-facing crash). Per the Apple-patterns diagnostic §5:
//   - selection · tab tap, scroll-rubber-band cross, sub-perceptual confirmations
//   - impactLight · saved-article toggle, soft confirmations
//   - impactMedium · primary CTAs ("Empezar La Ruta", "Continuar")
//   - impactHeavy · reserved for tier-up / ceremonial moments (rare)
//   - success · sello-earned, geofence-arrival (the canonical Apple "completion" haptic)
//   - warning · destructive confirmation prompts
//   - error · destructive action failures
//
// Note: we do NOT gate on useReducedMotion here. Apple's own apps fire haptics
// regardless of Reduce Motion · that setting governs visual motion, not haptic
// feedback. Users have a separate "Haptic Touch" Settings control that the OS
// already respects at the expo-haptics layer.

import * as Haptics from "expo-haptics";

const swallow = (p: Promise<unknown>) => {
  p.catch(() => {
    /* swallow · simulator and some Android devices throw on every haptic call;
       a haptic failure must never break the host interaction. */
  });
};

export const haptic = {
  /** Sub-perceptual click · use on tab tap, scroll-end crossings. */
  selection: () => swallow(Haptics.selectionAsync()),

  /** Light impact · use on toggle-style interactions (saved on/off, etc). */
  impactLight: () => swallow(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Medium impact · use on primary CTAs ("Empezar La Ruta"). */
  impactMedium: () => swallow(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Heavy impact · reserve for ceremonial / tier-up moments (rare). */
  impactHeavy: () => swallow(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  /** Three-tap success pattern · sello-earn, geofence arrival, tier-up reveal. */
  success: () => swallow(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Warning notification pattern · destructive confirmation prompts. */
  warning: () => swallow(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** Error notification pattern · destructive failures. */
  error: () => swallow(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
