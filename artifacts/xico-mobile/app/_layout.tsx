import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase, supabaseConfigured } from "@/constants/supabase";
import { useXicoFonts } from "@/constants/fonts";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TimeModeProvider } from "@/context/TimeModeContext";
import { ReEntryWelcome } from "@/components/pasaporte";
import { useLastOpen } from "@/hooks/useLastOpen";
import { useSessionLifecycleEvents } from "@/hooks/useEmotionalEvent";
import { useTierIcon } from "@/hooks/useTierIcon";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [reEntryShown, setReEntryShown] = useState(false);
  const { daysSinceLastOpen, ready: lastOpenReady, touch } = useLastOpen();

  // Re-entrada gate: when days_since_last_open >= 7, show ReEntryWelcome
  // ONCE per session. After dismissal, touch() writes the new last_open_ts.
  const showReEntry =
    !!session &&
    !!onboardingDone &&
    lastOpenReady &&
    typeof daysSinceLastOpen === "number" &&
    daysSinceLastOpen >= 7 &&
    !reEntryShown;

  // Fire session_open / re_entry / late_night_open / quiet_return events.
  useSessionLifecycleEvents();

  // Swap the iOS alternate app icon to match the user's current tier in
  // the pasaporte ladder. iOS shows a one-time "Icon Changed" system alert;
  // the hook dedupes by lastTier ref so we only swap on actual transitions.
  useTierIcon();

  useEffect(() => {
    // .catch routes AsyncStorage failures (rare but documented on iOS reinstall
    // edge cases) to "not yet onboarded" so the user sees /onboarding instead
    // of unhandled-rejecting into the ErrorBoundary on second launch. Per
    // diagnostic §B-4.
    AsyncStorage.getItem("xico_onboarding_done")
      .then((v) => setOnboardingDone(!!v))
      .catch(() => setOnboardingDone(false));
  }, [session]);

  useEffect(() => {
    if (loading || onboardingDone === null) return;
    // When the bundle was built without Supabase secrets (web brand preview /
    // unconfigured dev builds) the auth + onboarding flows are no-ops · skip
    // them. iOS production builds always have secrets, so this branch is dead
    // there. We don't redirect on every render — only when the user lands on
    // a flow that is itself unreachable (/auth, /onboarding). Otherwise the
    // user is free to navigate the editorial surfaces (/hoy, /ruta, etc.).
    if (!supabaseConfigured) {
      // No-op · let the user roam. The auth + onboarding screens still exist
      // as routes (and gracefully render their UI), but nothing forces them.
      return;
    }
    if (!session) {
      router.replace("/auth");
    } else if (!onboardingDone) {
      router.replace("/onboarding");
    }
  }, [session, loading, onboardingDone]);

  if (loading || onboardingDone === null) return null;

  // Re-entrada emocional · one-time welcome before tabs render
  if (showReEntry) {
    return (
      <ReEntryWelcome
        daysSinceLastOpen={daysSinceLastOpen!}
        onContinue={() => {
          setReEntryShown(true);
          void touch();
        }}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="article/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}

async function handleAuthUrl(url: string) {
  // Defensive: every step can throw on malformed input. We never want a
  // bad magic-link URL to crash the app · silently no-op on parse errors
  // and route setSession failures to a soft notice instead of unhandled
  // rejection. 2026-05-15 (pre-TestFlight crash hunt).
  try {
    if (!url.includes("access_token")) return;
    const fragment = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
    if (!fragment) return;
    const params = new URLSearchParams(fragment);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        // Supabase rejected the tokens (expired, reused, malformed).
        // The user is on a stale magic-link · drop them back at /auth
        // with a query flag so auth.tsx can render a soft notice
        // ("Este enlace ya caducó · pide uno nuevo.") rather than
        // silently appearing un-logged-in with no explanation.
        try {
          router.replace("/auth?expired=1" as never);
        } catch {
          // router not ready yet · the user will see /auth on next paint
          // without the expired flag · acceptable degradation.
        }
      }
    }
  } catch {
    // URL parse / Supabase network error · stay on whatever screen the
    // user was on. No crash, no error UI · silent recovery.
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useXicoFonts();
  // 8-second hard timeout · if Google Fonts hasn't resolved (slow connection,
  // CDN issue, hung web client) we proceed with system fallback fonts instead
  // of leaving the user staring at a blank screen forever.
  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    // Splash hides when fonts resolve · OR when the 8s timeout flag fires
    // (slow CDN). Without the timeout branch the splash could stay up
    // forever on a slow connection · the system-fallback fonts render is
    // still preferable to a stuck splash. 2026-05-15.
    if (fontsLoaded || fontError || fontTimeout) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, fontTimeout]);

  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Both branches catch any rejection · a malformed initial URL or a
    // deep-link event with bad shape no longer logs an unhandled
    // rejection / yellow box. 2026-05-15.
    Linking.getInitialURL()
      .then((url) => { if (url) handleAuthUrl(url); })
      .catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleAuthUrl(url).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError && !fontTimeout) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TimeModeProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </TimeModeProvider>
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
