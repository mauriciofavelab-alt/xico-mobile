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
    AsyncStorage.getItem("xico_onboarding_done").then(v => setOnboardingDone(!!v));
  }, [session]);

  useEffect(() => {
    if (loading || onboardingDone === null) return;
    // When the bundle was built without Supabase secrets (web brand preview /
    // unconfigured dev builds) the auth + onboarding flows are no-ops · skip
    // straight into the editorial surfaces which fall back to local content.
    // iOS production builds always have secrets, so this branch is dead there.
    if (!supabaseConfigured) {
      router.replace("/(tabs)/hoy");
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
  if (!url.includes("access_token")) return;
  const fragment = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
  if (!fragment) return;
  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token });
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useXicoFonts();
  // 8-second hard timeout · if Google Fonts hasn't resolved (slow connection,
  // CDN issue, hung web client) we proceed with system fallback fonts instead
  // of leaving the user staring at a blank screen forever.
  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) handleAuthUrl(url); });
    const sub = Linking.addEventListener("url", ({ url }) => handleAuthUrl(url));
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
