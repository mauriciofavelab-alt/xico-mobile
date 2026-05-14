import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { Colors } from "@/constants/colors";

type AudioState = "idle" | "loading" | "playing" | "paused";

type Props = {
  ttsUri: string;
  accent: string;
};

export function AudioPlayer({ ttsUri, accent }: Props) {
  const [state, setState] = useState<AudioState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
  // ui-ux-pro-max CRITICAL · the wave bars loop infinitely while audio
  // plays. Vestibular-sensitive users need a static fallback. When set,
  // the bars hold at a calm 0.5 baseline (no loop), preserving the visual
  // affordance without the motion trigger.
  const reducedMotion = useReducedMotion();
  const waveAnim = useRef([
    new Animated.Value(0.4),
    new Animated.Value(0.4),
    new Animated.Value(0.4),
    new Animated.Value(0.4),
  ]).current;

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (state === "playing" && !reducedMotion) {
      anim = Animated.loop(
        Animated.stagger(90, waveAnim.map(v =>
          Animated.sequence([
            Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: false }),
            Animated.timing(v, { toValue: 0.2, duration: 320, useNativeDriver: false }),
          ])
        ))
      );
      anim.start();
    } else if (state === "playing" && reducedMotion) {
      // Static "in-use" indication for reduced-motion: bars sit at half-height
      waveAnim.forEach(v => v.setValue(0.5));
    } else {
      waveAnim.forEach(v => v.setValue(0.4));
    }
    return () => anim?.stop();
  }, [state, reducedMotion]);

  const stop = async () => {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setState("idle");
  };

  const play = async () => {
    if (state === "playing") {
      await soundRef.current?.pauseAsync();
      setState("paused");
      return;
    }
    if (state === "paused" && soundRef.current) {
      await soundRef.current.playAsync();
      setState("playing");
      return;
    }
    setState("loading");
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      // Descargar el audio a un archivo local para evitar bloqueo HTTP de iOS.
      // expo-file-system@19+ removed FileSystem.cacheDirectory from the
      // public type surface even though the property remains at runtime on
      // iOS/Android (it's in the legacy API). Access via bracket notation
      // to silence the typecheck without changing runtime behavior.
      const cacheDir = ((FileSystem as unknown) as { cacheDirectory?: string }).cacheDirectory ?? "";
      const localUri = cacheDir + "tts_audio.mp3";
      const download = await FileSystem.downloadAsync(ttsUri, localUri);

      const { sound } = await Audio.Sound.createAsync(
        { uri: download.uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            soundRef.current = null;
            setState("idle");
          }
        }
      );
      soundRef.current = sound;
      setState("playing");
    } catch {
      setState("idle");
    }
  };

  return (
    <View style={au.container}>
      <View style={[au.track, { borderColor: `${accent}35` }]}>
        <Pressable
          onPress={play}
          style={({ pressed }) => [au.playBtn, { backgroundColor: accent, opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={
            state === "loading" ? "Generando narración" :
            state === "playing" ? "Pausar la narración" :
            state === "paused"  ? "Reanudar la narración" :
                                  "Escuchar la versión hablada"
          }
          accessibilityState={{ busy: state === "loading" }}
          hitSlop={6}
        >
          {state === "loading" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather
              name={state === "playing" ? "pause" : "play"}
              size={15}
              color="#fff"
              style={state !== "playing" ? { marginLeft: 2 } : undefined}
            />
          )}
        </Pressable>

        <View style={au.middle}>
          <Text style={[au.label, { color: state === "idle" ? Colors.textSecondary : accent }]}>
            {state === "loading"
              ? "Generando narración…"
              : state === "playing"
              ? "Escuchando"
              : state === "paused"
              ? "En pausa"
              : "Versión hablada"}
          </Text>
          <View style={au.barRow}>
            {waveAnim.map((v, i) => (
              <Animated.View
                key={i}
                style={[
                  au.bar,
                  {
                    backgroundColor: state === "playing" ? accent : Colors.border,
                    transform: [{ scaleY: v }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={au.metaRight}>
          <Text style={au.voiceTag}>Voz IA</Text>
          <Text style={au.voiceSub}>Bella · multilingüe</Text>
        </View>

        {(state === "playing" || state === "paused") && (
          <Pressable
            onPress={stop}
            style={au.stopBtn}
            accessibilityRole="button"
            accessibilityLabel="Detener la narración"
            hitSlop={10}
          >
            <Feather name="square" size={12} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const au = StyleSheet.create({
  container: { marginVertical: 28 },
  track: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  playBtn: {
    // Lifted from 40×40 to 44×44 to meet the Apple HIG minimum touch target.
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: { flex: 1, gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.2 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 3, height: 16 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  metaRight: { alignItems: "flex-end", gap: 2 },
  voiceTag: {
    // Lifted 8→11pt to match the editorial typography floor (Apple HIG).
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  voiceSub: {
    // Lifted 7→11pt, swapped the rgba dim color for Colors.textTertiary
    // (passes 6:1 contrast vs warm-black).
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  stopBtn: { padding: 6 },
});