// XICO · Auth provider configuration · 2026-05-15
//
// Single source of truth for which auth providers are available at runtime
// and how they're wired. Three providers converge on the same Supabase
// session: Apple (iOS only), Google (iOS + Android), and magic-link email
// (all platforms). The auth.tsx screen reads from here so it can render
// the right buttons + show a graceful "configuración pendiente" notice
// when an env var is missing instead of crashing.
//
// Why a separate module:
//   - GoogleSignin.configure() must run ONCE at app start, before any
//     signIn() call. Putting it at module top-level guarantees that
//     ordering (the import side-effect fires the first time auth.tsx
//     pulls this module · subsequent re-imports are no-ops via the JS
//     module cache).
//   - The "is Apple available?" check is async (the static
//     AppleAuthentication.isAvailableAsync()) and can't live in a top-
//     level const. The hook below wraps the check so the UI re-renders
//     once we have the answer.
//
// Per the XICO architecture trade-off framework: this module pays off
// (efficiency: 1 init not N, coding: 1 import line in auth.tsx,
// functionality: graceful degradation on placeholder env vars,
// necessity: yes because GoogleSignin.configure is mandatory at module
// scope).

import { useEffect, useState } from "react";
import { Platform } from "react-native";

// ─── Google ──────────────────────────────────────────────────────────
//
// EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is baked into the JS bundle at build
// time. In dev: set it in `.env.local`. In TestFlight/prod: `eas
// secret:create`. The value lives in Google Cloud Console → APIs &
// Services → Credentials → OAuth 2.0 Client IDs → iOS application.
const RAW_GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Treat any of these as "not configured": empty, missing, or the
// placeholder string we ship in `.env.example`. The auth screen shows
// a soft-notice when the user taps Google and config is missing.
function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  if (value.trim().length === 0) return true;
  if (value.includes("your-google-ios-client-id")) return true;
  return false;
}

export const googleConfigured = !isPlaceholder(RAW_GOOGLE_IOS_CLIENT_ID);
export const GOOGLE_IOS_CLIENT_ID = RAW_GOOGLE_IOS_CLIENT_ID ?? "";

// Configure GoogleSignin once at module load, but only if the env var is
// real. On web the native module doesn't exist · skip entirely. Wrap in
// try/catch so a broken native module never blocks app boot · the user
// will hit the "configuración pendiente" notice instead.
if (googleConfigured && Platform.OS !== "web") {
  try {
    // Lazy require · the native module shouldn't load on web at all.
    // Using require here is intentional · static import would force
    // the native side-effect at module-parse time on every platform.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    GoogleSignin.configure({
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      scopes: ["profile", "email"],
    });
  } catch (err) {
    // Native module unavailable (e.g. running in Expo Go without the
    // dev client). Logging once at module load is fine · the auth
    // screen will degrade to magic-link + Apple only.
    if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn("[auth-config] GoogleSignin.configure failed · falling back:", err);
    }
  }
}

// ─── Apple ───────────────────────────────────────────────────────────
//
// AppleAuthentication is only meaningful on iOS · the rest of the API
// surface exists on Android/web but every call rejects. We do an async
// availability probe so the UI hides the Apple button on iPad/iOS
// devices that for some reason don't have Sign in with Apple enabled
// (a rare corner case but Apple's own sample apps gate on it).

export function useAppleAvailable(): boolean {
  // Optimistic default: on iOS we assume Sign In with Apple IS available,
  // then ONLY set it to false if the async probe explicitly returns false.
  // This removes the ~200ms "pop-in" flicker where the Apple button
  // appeared after first paint · a focus-group-visible perception issue.
  const [available, setAvailable] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AppleAuthentication = require("expo-apple-authentication");
      AppleAuthentication.isAvailableAsync()
        .then((ok: boolean) => {
          if (!cancelled && ok === false) setAvailable(false);
        })
        .catch(() => {
          if (!cancelled) setAvailable(false);
        });
    } catch {
      if (!cancelled) setAvailable(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}

// ─── Google button platform gate ─────────────────────────────────────
//
// Google native SDK doesn't work on web (would need expo-auth-session
// web flow, deferred to v1.1). On iOS + Android we render the button
// but it still shows the "configuración pendiente" notice if env vars
// aren't set.
export const googlePlatformSupported = Platform.OS === "ios" || Platform.OS === "android";

// ─── Terms / Privacy URLs ────────────────────────────────────────────
//
// Placeholder URLs · update before App Store submission. The footer
// Pressables Linking.openURL these · if they're empty/falsy the
// Pressable disables itself and console.logs.
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL || "";
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL || "";
