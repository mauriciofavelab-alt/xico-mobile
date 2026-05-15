// Native implementation · iOS + Android. Loaded by Metro for any non-web target.
// Lives outside `app/` so expo-router's require.context doesn't include it · which
// means web bundling skips `react-native-maps`'s native-only imports cleanly.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable, Linking } from "react-native";
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { SlideInUp, useReducedMotion, Easing } from "react-native-reanimated";

import { GlassMasthead, GlassCard } from "@/components/liquid-glass";
import { useCurrentRuta, type RutaStopLite } from "@/hooks/useCurrentRuta";
import { Colors, Pillars } from "@/constants/colors";
import { Fonts, scaledFontSize } from "@/constants/editorial";

const MADRID_CENTER = {
  latitude: 40.4168,
  longitude: -3.7038,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function formatWeekMeta(week_key: string | null | undefined): string {
  if (!week_key) return "MAPA";
  const match = week_key.match(/^\d{4}-W(\d{1,2})$/i);
  return match ? `SEMANA ${match[1]}` : week_key.toUpperCase();
}

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const ruta = useCurrentRuta();
  const stops = ruta.data?.stops ?? [];

  const mappableStops = useMemo(
    () => stops.filter((s): s is RutaStopLite & { lat: number; lng: number } =>
      typeof s.lat === "number" && typeof s.lng === "number",
    ),
    [stops],
  );

  const [selectedStop, setSelectedStop] = useState<typeof mappableStops[number] | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current || mappableStops.length === 0) return;
    const coords = mappableStops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 180, right: 60, bottom: 220, left: 60 },
      animated: false,
    });
  }, [mappableStops.length]);

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={MADRID_CENTER}
        userInterfaceStyle="dark"
        showsCompass={false}
        showsUserLocation
        showsMyLocationButton={false}
        rotateEnabled
        pitchEnabled
      >
        {mappableStops.map((stop) => {
          const pinColor = stop.rumbo?.color_hex ?? Colors.textTertiary;
          return (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              onPress={() => setSelectedStop(stop)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
              accessibilityLabel={`Parada ${stop.order} · ${stop.name}`}
            >
              <View style={[styles.markerPin, { backgroundColor: pinColor }]}>
                <Text style={styles.markerNum}>{stop.order}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <GlassMasthead
        label="XICO · MAPA"
        meta={formatWeekMeta(ruta.data?.week_key)}
        liveDotColor={Pillars.indice}
      />

      {selectedStop && (
        <>
          <Pressable
            accessibilityLabel="Cerrar previsualización"
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedStop(null)}
          />
          <Animated.View
            entering={
              reducedMotion
                ? undefined
                : SlideInUp.duration(500).easing(Easing.bezier(0.22, 1, 0.36, 1))
            }
            style={[styles.previewWrap, { bottom: insets.bottom + 100 }]}
            pointerEvents="box-none"
          >
            <GlassCard accentBorder={selectedStop.rumbo?.color_hex ?? Colors.textTertiary}>
              <Text style={styles.previewKicker}>
                {`PARADA ${String(selectedStop.order).padStart(2, "0")} / ${String(mappableStops.length).padStart(2, "0")}`}
              </Text>
              <Text style={styles.previewName}>{selectedStop.name}</Text>
              <Text style={styles.previewSubline}>
                {[
                  selectedStop.rumbo?.nahuatl_name,
                  selectedStop.address?.split(",")[0]?.trim(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <View style={styles.previewCtaRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir la parada ${selectedStop.name}`}
                  onPress={() => {
                    const id = selectedStop.id;
                    setSelectedStop(null);
                    router.push(`/ruta/stop/${id}` as any);
                  }}
                  style={styles.previewCta}
                >
                  <Text style={styles.previewCtaText}>Ir a la parada →</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Iniciar caminata a ${selectedStop.name}`}
                  onPress={() => {
                    const url = `maps://?daddr=${selectedStop.lat},${selectedStop.lng}&dirflg=w`;
                    Linking.openURL(url).catch(() => {
                      Linking.openURL(
                        `https://maps.apple.com/?daddr=${selectedStop.lat},${selectedStop.lng}&dirflg=w`,
                      ).catch(() => {});
                    });
                  }}
                  style={styles.previewCtaSecondary}
                >
                  <Text style={styles.previewCtaSecondaryText}>Caminando</Text>
                </Pressable>
              </View>
            </GlassCard>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  markerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.95)",
  },
  markerNum: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 14,
    includeFontPadding: false,
  },

  previewWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  previewKicker: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  previewName: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 24,
    lineHeight: 24 * 1.05,
    letterSpacing: -0.025 * 24,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  previewSubline: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: scaledFontSize(13),
    color: Colors.textSecondary,
    letterSpacing: 0.1,
    marginBottom: 14,
  },
  previewCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewCta: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHigh,
  },
  previewCtaText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  previewCtaSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
  },
  previewCtaSecondaryText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});
