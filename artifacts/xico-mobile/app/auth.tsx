import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

type Step = "email" | "sent";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { sendMagicLink } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const cleaned = email.trim().toLowerCase();
    if (!cleaned || !cleaned.includes("@")) {
      setError("Introduce un correo válido.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await sendMagicLink(cleaned);
    setLoading(false);
    if (error) {
      setError("No pudimos enviar el enlace. Intenta de nuevo.");
      return;
    }
    setStep("sent");
  };

  if (step === "sent") {
    return (
      <View style={[s.sentRoot, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
        <View style={s.sentContent}>
          <Text style={s.logo}>XICO</Text>
          <View style={s.divider} />
          <Text style={s.heading}>Revisa tu correo.</Text>
          <Text style={s.sub}>
            Enviamos un enlace a{"\n"}
            <Text style={s.emailLabel}>{email.trim().toLowerCase()}</Text>
            {"\n\n"}Tócalo para entrar a XICO.
          </Text>
        </View>
        <Pressable onPress={() => { setStep("email"); setError(null); }} style={s.back}>
          <Text style={s.backText}>← Cambiar correo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>
        <View style={s.header}>
          <Text style={s.logo}>XICO</Text>
          <View style={s.divider} />
          <Text style={s.heading}>Entra con tu correo.</Text>
          <Text style={s.sub}>Te enviamos un enlace de acceso.</Text>
        </View>

        <TextInput
          style={s.input}
          value={email}
          onChangeText={v => { setEmail(v); setError(null); }}
          placeholder="tu@correo.com"
          placeholderTextColor="rgba(255,255,255,0.18)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        <Pressable
          onPress={handleSend}
          disabled={loading}
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.8 }, loading && { opacity: 0.5 }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.ctaText}>Enviar enlace →</Text>
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background, justifyContent: "center" },
  inner: { paddingHorizontal: 32 },
  sentRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  sentContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  header: { marginBottom: 40 },
  logo: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 5,
    color: Colors.primary,
    marginBottom: 28,
    textAlign: "center",
  },
  divider: {
    width: 28,
    height: 1.5,
    backgroundColor: Colors.primary,
    marginBottom: 24,
    alignSelf: "center",
  },
  heading: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 38,
    lineHeight: 44,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  emailLabel: { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_500Medium" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#e05555",
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.5,
    color: "#fff",
    textTransform: "uppercase",
  },
  back: { position: "absolute", bottom: 0, alignSelf: "center", padding: 16 },
  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 0.5,
  },
});
