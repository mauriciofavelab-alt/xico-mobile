import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

type AudioState = "idle" | "loading" | "playing" | "paused";

type Props = {
  ttsUri: string;
  accent: string;
};

export function AudioPlayer({ ttsUri, accent }: Props) {
  const [state, setState] = useState<AudioState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
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
    if (state === "playing") {
      anim = Animated.loop(
        Animated.stagger(90, waveAnim.map(v =>
          Animated.sequence([
            Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: false }),
            Animated.timing(v, { toValue: 0.2, duration: 320, useNativeDriver: false }),
          ])
        ))
      );
      anim.start();
    } else {
      waveAnim.forEach(v => v.setValue(0.4));
    }
    return () => anim?.stop();
  }, [state]);

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

      // Descargar el audio a un archivo local para evitar bloqueo HTTP de iOS
      const localUri = FileSystem.cacheDirectory + "tts_audio.mp3";
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
              : "Escuchar artículo"}
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
          <Text style={au.voiceTag}>ElevenLabs</Text>
          <Text style={au.voiceSub}>IA · voz humana</Text>
        </View>

        {(state === "playing" || state === "paused") && (
          <Pressable onPress={stop} style={au.stopBtn}>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: { flex: 1, gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.2 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 3, height: 16 },
  bar: { width: 3, height: 16, borderRadius: 2 },
  metaRight: { alignItems: "flex-end", gap: 2 },
  voiceTag: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8, letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  voiceSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 0.5,
  },
  stopBtn: { padding: 6 },
});
