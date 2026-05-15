// XICO · Auth screen · Liquid Glass redesign · 2026-05-15
//
// The user's first impression of XICO. Three providers (Apple, Google,
// magic-link email) converge on the same Supabase session. Editorial
// register: Fraunces wordmark over a moody Madrid-dusk backdrop, with
// the auth controls living inside a 24pt-radius BlurView card (the
// Liquid Glass moment that earns its glassmorphism per brandbook §6 —
// auth is genuinely an overlay over the brand's environment, not chrome).
//
// Saturation discipline: ONE saturated hit on the screen · the magenta
// "Enviar enlace" CTA. Apple button is white (Apple HIG mandate on dark
// backdrops), Google button is white (Google's "G" brand mandate),
// neither counts as a XICO accent. The dusk-magenta clouds in the
// backdrop photograph are saturation-in-photography, allowed per §6.
//
// Reduced motion: backdrop ken-burns and the card slide-up are gated
// on useReducedMotion(). Haptics still fire (Apple's pattern).

import { BlurView } from "expo-blur";
import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { SpringPressable } from "@/components/primitives/SpringPressable";
import { Colors, Pillars } from "@/constants/colors";
import { Fonts, Hairline, Tracking, TypeSize } from "@/constants/editorial";
import { haptic } from "@/constants/haptics";
import { InsetRim, Shadow } from "@/constants/shadows";
import { supabase, supabaseConfigured } from "@/constants/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  PRIVACY_URL,
  TERMS_URL,
  googleConfigured,
  googlePlatformSupported,
  useAppleAvailable,
} from "@/constants/auth-config";

// ─── Backdrop image ──────────────────────────────────────────────────
// `_backdrop-tu-codice.jpg` is the dedicated wide moody-dusk Madrid
// skyline · warm coral-magenta clouds over deep navy sky over dark
// silhouetted buildings. On-brand: the magenta is Casa Gilardi in
// nature, Madrid is the escenario where the diáspora lives. Saturation
// lives in the photograph, not in chrome (brandbook §6).
const BACKDROP = require("../assets/lugares/_backdrop-tu-codice.jpg");

// Notice kinds drive the soft-notice color stripe + auto-dismiss timing.
type NoticeKind = "error" | "success";
type Notice = { kind: NoticeKind; text: string };

// Each in-flight provider drives its loading state + disables the
// other buttons. Only one auth attempt may run at a time.
type Loading = null | "apple" | "google" | "email";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const appleAvailable = useAppleAvailable();
  const { sendMagicLink } = useAuth();

  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState<Loading>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Ken-burns backdrop parallax ────────────────────────────────────
  // Slow translateY oscillation (±8pt over 24s) gives the still photo
  // the breathing presence Apple uses on the iOS lockscreen. Honors
  // reduced motion · gated below at the animated style binding.
  const kenBurns = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    kenBurns.value = withRepeat(
      withTiming(1, { duration: 24000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reducedMotion, kenBurns]);

  const backdropAnim = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { transform: [{ scale: 1.08 }] };
    }
    const translateY = -8 + kenBurns.value * 16;
    return {
      transform: [{ scale: 1.08 }, { translateY }],
    };
  }, [reducedMotion]);

  // ─── Notice helpers ─────────────────────────────────────────────────
  // Soft-notice pattern lifted from app/ruta/stop/[id].tsx · Newsreader
  // italic 14pt, no exclamation, no emoji. Auto-dismiss timer cleared
  // on unmount so haptics + state writes never land on a torn-down
  // component (diagnostic §C-1).
  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const showNotice = (n: Notice, dismissMs: number) => {
    setNotice(n);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, dismissMs);
  };

  // ─── Apple sign-in ──────────────────────────────────────────────────
  const handleApple = async () => {
    if (loading) return;
    haptic.impactMedium();
    setLoading("apple");
    setNotice(null);
    try {
      // Lazy require · expo-apple-authentication has no-op fallbacks on
      // non-iOS but we never even render the button there, so dynamic
      // require keeps the import out of web bundles.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AppleAuthentication = require("expo-apple-authentication");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error("no_identity_token");
      }
      if (!supabaseConfigured) {
        throw new Error("supabase_not_configured");
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) throw error;
      // Success · AuthContext.onAuthStateChange picks up the new
      // session and _layout.tsx routes us forward. No local navigation.
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = err instanceof Error ? err.message : String(err);
      // User-cancelled · "ERR_REQUEST_CANCELED" or "ERR_CANCELED" depending
      // on RN/native version. Don't show a notice · cancellation is intent,
      // not failure.
      if (
        code === "ERR_REQUEST_CANCELED" ||
        code === "ERR_CANCELED" ||
        message.includes("canceled") ||
        message.includes("cancelled")
      ) {
        setLoading(null);
        return;
      }
      console.warn("[auth] apple sign-in failed:", message);
      showNotice(
        {
          kind: "error",
          text: "No pudimos conectarnos. Vuelve a intentarlo en un momento.",
        },
        4000,
      );
    } finally {
      setLoading(null);
    }
  };

  // ─── Google sign-in ─────────────────────────────────────────────────
  const handleGoogle = async () => {
    if (loading) return;
    haptic.impactMedium();
    setLoading("google");
    setNotice(null);
    // Graceful degradation when the iOS client ID is still the placeholder.
    // The user can still use Apple or email · we just tell them why this
    // path doesn't work yet.
    if (!googleConfigured) {
      showNotice(
        {
          kind: "error",
          text: "Configuración pendiente · vuelve a intentar en breve.",
        },
        4000,
      );
      setLoading(null);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const GoogleSignin = require("@react-native-google-signin/google-signin");
      // hasPlayServices() throws on iOS-without-Play-Services (always) so we
      // only call it on Android. On iOS we skip straight to signIn().
      if (Platform.OS === "android") {
        await GoogleSignin.GoogleSignin.hasPlayServices();
      }
      await GoogleSignin.GoogleSignin.signIn();
      const tokens = await GoogleSignin.GoogleSignin.getTokens();
      const idToken = tokens?.idToken;
      if (!idToken) {
        throw new Error("no_id_token");
      }
      if (!supabaseConfigured) {
        throw new Error("supabase_not_configured");
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) throw error;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message = err instanceof Error ? err.message : String(err);
      // SIGN_IN_CANCELLED on Google · don't surface a notice.
      if (
        code === "SIGN_IN_CANCELLED" ||
        code === "-5" || // legacy iOS Google SDK cancel code
        message.includes("canceled") ||
        message.includes("cancelled")
      ) {
        setLoading(null);
        return;
      }
      console.warn("[auth] google sign-in failed:", message);
      showNotice(
        {
          kind: "error",
          text: "No pudimos conectarnos. Vuelve a intentarlo en un momento.",
        },
        4000,
      );
    } finally {
      setLoading(null);
    }
  };

  // ─── Email magic link ───────────────────────────────────────────────
  const handleEmail = async () => {
    if (loading) return;
    const cleaned = email.trim().toLowerCase();
    // Light client-side check before round-trip · matches a@b.c shape
    // without being draconian (the server still validates).
    const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
    if (!cleaned || !looksValid) {
      showNotice(
        {
          kind: "error",
          text: "Ese correo no parece bien escrito. Revísalo.",
        },
        4000,
      );
      return;
    }
    haptic.impactMedium();
    setLoading("email");
    setNotice(null);
    const { error } = await sendMagicLink(cleaned);
    setLoading(null);
    if (error) {
      // Supabase rate-limit error contains "rate" or "Email rate limit".
      const isRate = /rate|too many|too soon/i.test(error);
      showNotice(
        {
          kind: "error",
          text: isRate
            ? "Espera unos segundos antes de pedir otro enlace."
            : "No pudimos enviar el enlace. Intenta de nuevo.",
        },
        4000,
      );
      return;
    }
    showNotice(
      {
        kind: "success",
        text: "Te enviamos el enlace a tu correo.",
      },
      6000,
    );
  };

  // ─── Legal link tap ────────────────────────────────────────────────
  const openLegal = (url: string, label: string) => {
    if (!url) {
      // eslint-disable-next-line no-console
      console.log(`[auth] legal link disabled · ${label} URL not configured`);
      return;
    }
    Linking.openURL(url).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[auth] failed to open ${label}:`, err);
    });
  };

  const anyLoading = loading !== null;

  return (
    <View style={s.root}>
      {/* Backdrop · full-bleed image scaled 1.08 with ken-burns parallax,
          plus a 28% black scrim so the wordmark + glass card read clearly.
          ImageBackground via Image+absoluteFill so we can wrap the animated
          transform; ImageBackground itself doesn't accept transform style. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, backdropAnim]}
        pointerEvents="none"
      >
        <Image source={BACKDROP} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </Animated.View>
      {/* 28% black scrim · brandbook warm-black at 0.28 alpha */}
      <Animated.View
        entering={reducedMotion ? undefined : FadeIn.duration(300)}
        style={[StyleSheet.absoluteFill, s.scrim]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={s.kbWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* The card itself · slides up 24pt + fades in (600ms). Reduced
              motion: instant render. Wrapped in Animated.View so the entering
              prop animates the whole card together with its shadow. */}
          <Animated.View
            entering={
              reducedMotion
                ? undefined
                : FadeInUp.duration(600)
                    .easing(Easing.bezier(0.22, 1, 0.36, 1))
                    .withInitialValues({ transform: [{ translateY: 24 }], opacity: 0 })
            }
            style={s.cardWrap}
          >
            <View style={[s.cardShadow, Shadow.chromeFloat]}>
              <BlurView
                intensity={60}
                tint="dark"
                style={[s.card, InsetRim]}
                accessibilityRole="none"
              >
                {/* Wordmark · Fraunces 48pt semibold, tight tracking. The
                    masthead-style identity. textPrimary bone white. */}
                <Text style={s.wordmark} accessibilityRole="header">
                  XICO
                </Text>
                {/* Tagline · Newsreader italic 16pt secondary */}
                <Text style={s.tagline}>Una publicación de México en Madrid</Text>

                <View style={{ height: 40 }} />

                {/* Apple button · iOS-only + isAvailableAsync gate. The
                    native AppleAuthenticationButton has its own press
                    animation per Apple HIG, so we don't wrap in
                    SpringPressable · just call haptic in handler. */}
                {appleAvailable && Platform.OS === "ios" ? (
                  <AppleButton
                    onPress={handleApple}
                    loading={loading === "apple"}
                    disabled={anyLoading && loading !== "apple"}
                  />
                ) : null}

                {/* Google button · iOS + Android · custom-styled white
                    surface with Google's 4-color G. SpringPressable for
                    the press physics + haptic. */}
                {googlePlatformSupported ? (
                  <>
                    {appleAvailable && Platform.OS === "ios" ? (
                      <View style={{ height: 12 }} />
                    ) : null}
                    <GoogleButton
                      onPress={handleGoogle}
                      loading={loading === "google"}
                      disabled={anyLoading && loading !== "google"}
                    />
                  </>
                ) : null}

                <View style={{ height: 24 }} />

                {/* "o con tu correo" hairline divider with centered caps */}
                <View style={s.dividerRow}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerLabel}>O CON TU CORREO</Text>
                  <View style={s.dividerLine} />
                </View>

                {/* Email input · transparent surface, hairline bottom,
                    thickens to magenta on focus. */}
                <View style={s.inputWrap}>
                  <TextInput
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      // Clear any prior error as the user re-types.
                      if (notice?.kind === "error") setNotice(null);
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="tu@correo.es"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleEmail}
                    editable={!anyLoading}
                    style={s.input}
                    accessibilityLabel="Correo electrónico"
                    accessibilityHint="Introduce tu correo para recibir el enlace de acceso"
                  />
                  <View
                    style={[
                      s.inputUnderline,
                      emailFocused && s.inputUnderlineFocus,
                    ]}
                  />
                </View>

                <View style={{ height: 16 }} />

                {/* Enviar enlace CTA · the single saturated hit · magenta */}
                <SpringPressable
                  onPress={handleEmail}
                  disabled={anyLoading}
                  haptic={null /* haptic.impactMedium fires in handler */}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar enlace de acceso"
                  accessibilityState={{ disabled: anyLoading }}
                  style={[
                    s.emailCta,
                    anyLoading && loading !== "email" && s.ctaDimmed,
                  ]}
                >
                  <View style={s.ctaContent}>
                    {loading === "email" ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={s.emailCtaText}>ENVIAR ENLACE</Text>
                    )}
                  </View>
                </SpringPressable>

                {/* Soft-notice · sits inside the card, below the CTA. Slides
                    up on appear. Color stripe on the left (rumbo-style):
                    magenta for error, verde for success. Auto-dismisses. */}
                {notice ? (
                  <Animated.View
                    entering={
                      reducedMotion
                        ? undefined
                        : FadeInUp.duration(280).easing(Easing.out(Easing.cubic))
                    }
                    style={[
                      s.notice,
                      notice.kind === "success" ? s.noticeSuccess : s.noticeError,
                    ]}
                    accessibilityLiveRegion="polite"
                    accessibilityRole="text"
                  >
                    <Text style={s.noticeText}>{notice.text}</Text>
                  </Animated.View>
                ) : null}
              </BlurView>
            </View>
          </Animated.View>

          {/* Footer · sits OUTSIDE the BlurView card per spec. Terms +
              Privacy as Pressables, the rest of the line static. */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              Al continuar aceptas los{" "}
              <Text
                style={[s.footerLink, !TERMS_URL && s.footerLinkDisabled]}
                onPress={() => openLegal(TERMS_URL, "Términos")}
              >
                Términos
              </Text>
              {" "}y la{" "}
              <Text
                style={[s.footerLink, !PRIVACY_URL && s.footerLinkDisabled]}
                onPress={() => openLegal(PRIVACY_URL, "Privacidad")}
              >
                Privacidad
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Apple button · wrapper around expo-apple-authentication's native
// component. The native button has its own HIG-compliant press feedback
// and rendering · we only need to handle the disabled + loading overlay.
// ───────────────────────────────────────────────────────────────────────
function AppleButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AppleAuthentication = require("expo-apple-authentication");
  return (
    <View style={{ opacity: disabled ? 0.45 : 1 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={12}
        style={{ width: "100%", height: 52 }}
        onPress={() => {
          if (disabled || loading) return;
          onPress();
        }}
      />
      {loading ? (
        <View style={s.appleLoading} pointerEvents="none">
          <ActivityIndicator color="#000000" size="small" />
        </View>
      ) : null}
    </View>
  );
}

// ─── Google button · custom-styled white surface with the 4-color G.
// SpringPressable for the Apple-style press physics + haptic.
// ───────────────────────────────────────────────────────────────────────
function GoogleButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <SpringPressable
      onPress={onPress}
      disabled={disabled || loading}
      haptic={null /* fired in handler */}
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
      accessibilityState={{ disabled }}
      style={[
        s.googleBtn,
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      <View style={s.googleBtnContent}>
        {loading ? (
          <ActivityIndicator color="#1A1A1A" size="small" />
        ) : (
          <>
            <GoogleLogo size={20} />
            <Text style={s.googleBtnText}>Continuar con Google</Text>
          </>
        )}
      </View>
    </SpringPressable>
  );
}

// ─── Google 4-color "G" logo · inline SVG so we don't pull a brand
// asset · the geometry below is Google's official Material logo
// (public brand mark, 18px viewBox). Colors and paths match the
// canonical "Google G" used across Sign-in surfaces.
// ───────────────────────────────────────────────────────────────────────
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6154z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5831-5.036-3.7104H.957v2.3318C2.4382 15.9831 5.4818 18 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.957C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.957 4.0418L3.964 10.71z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
      />
    </Svg>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrim: {
    backgroundColor: "rgba(8, 5, 8, 0.28)" /* Colors.background at 28% alpha */,
  },
  kbWrap: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 0,
  },

  // ─── Card ─────────────────────────────────────────────────────────────
  cardWrap: {
    width: "88%",
    alignSelf: "center",
  },
  // The shadow lives on a non-blurred View · iOS BlurView doesn't render
  // shadows correctly when overflow-clipped. The outer wrap carries the
  // chromeFloat shadow, the inner BlurView carries the radius + clip.
  cardShadow: {
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 32,
    overflow: "hidden",
    // The BlurView's tint="dark" already darkens, but on devices where
    // the blur is disabled (reduce-transparency a11y setting) we want a
    // sane fallback colour. Warm-black at high alpha matches LiquidGlass.thick.
    backgroundColor: "rgba(20, 14, 16, 0.55)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.14)",
  },

  // ─── Wordmark + tagline ──────────────────────────────────────────────
  wordmark: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 48,
    letterSpacing: Tracking.tight,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 48 * 1.05,
  },
  tagline: {
    fontFamily: Fonts.serifItalic,
    fontSize: TypeSize.body,
    fontStyle: "italic",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: TypeSize.body * 1.35,
  },

  // ─── Divider with caps label ─────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: Hairline.thin,
    backgroundColor: Colors.borderMedium,
  },
  dividerLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textTertiary,
    paddingHorizontal: 12,
    textTransform: "uppercase",
  },

  // ─── Email input (transparent + hairline bottom that thickens on focus) ─
  inputWrap: {
    marginTop: 18,
    height: 52,
    justifyContent: "center",
  },
  input: {
    fontFamily: Fonts.serifRegular,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  inputUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Hairline.thin,
    backgroundColor: Colors.borderMedium,
  },
  inputUnderlineFocus: {
    height: 1.5,
    backgroundColor: Pillars.indice /* magenta · the single saturated hit on focus */,
  },

  // ─── Enviar enlace CTA · the one saturated button ────────────────────
  emailCta: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: Pillars.indice /* magenta · saturation discipline */,
    overflow: "hidden",
    shadowColor: Pillars.indice,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDimmed: { opacity: 0.55 },
  emailCtaText: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },

  // ─── Google button ───────────────────────────────────────────────────
  googleBtn: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: Hairline.thin,
    borderColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  googleBtnContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: "#1A1A1A",
    letterSpacing: 0.1,
  },

  // ─── Apple loading overlay (over the native button) ──────────────────
  appleLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 12,
  },

  // ─── Soft-notice (error/success) ─────────────────────────────────────
  notice: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 2,
    backgroundColor: "rgba(20, 14, 16, 0.35)",
    borderRadius: 6,
  },
  noticeError: {
    borderLeftColor: Pillars.indice /* magenta accent stripe · rumbo pattern */,
  },
  noticeSuccess: {
    borderLeftColor: Colors.verdeLight /* verde · success */,
  },
  noticeText: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 14 * 1.45,
    color: Colors.textPrimary,
  },

  // ─── Footer (outside the card) ───────────────────────────────────────
  footer: {
    marginTop: 18,
    paddingHorizontal: 32,
  },
  footerText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  footerLink: {
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
  footerLinkDisabled: {
    color: Colors.textQuaternary,
    textDecorationLine: "none",
  },
});
