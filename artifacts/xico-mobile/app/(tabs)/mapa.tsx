import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable, Linking, Platform } from "react-native";
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { SlideInUp, useReducedMotion, Easing } from "react-native-reanimated";

import { GlassMasthead, GlassCard } from "@/components/liquid-glass";
import { useCurrentRuta, type RutaStopLite } from "@/hooks/useCurrentRuta";
import { Colors, Pillars } from "@/constants/colors";
import { Fonts } from "@/constants/editorial";

/**
 * Mapa de la Ruta · /mapa
 *
 * Phase 5 Task 5.2 · spec §7.5.
 *
 * Native iOS Apple Maps (PROVIDER_DEFAULT on iOS yields Apple Maps · no API
 * key, no Google) in `userInterfaceStyle="dark"` mode. Each Ruta stop is a
 * rumbo-colored disc marker with the stop's order number — saturation
 * discipline per brandbook §6 (each pin carries ITS stop's rumbo, never
 * mixed). Hairline white ring (2px @ 95% alpha) gives legibility on the dark
 * map without resorting to drop-shadows (which read dirty against Apple's
 * warm dark tiles).
 *
 * Floating masthead live-dot is `Pillars.indice` (magenta) — Mapa is a
 * sibling surface of /ruta, both lieving under the Indice editorial pillar.
 * This is the screen-level pillar anchor; the per-pin rumbos are the
 * gamification-taxonomy layer underneath.
 *
 * Pin tap → glass preview card slides up from the bottom (SlideInUp, 500ms,
 * editorial easing). Card has TWO CTAs: "Ir a la parada" (routes to the
 * Stop screen) and "Caminando" (opens Apple Maps with walking directions).
 * Tap outside the card dismisses. Respects useReducedMotion.
 *
 * Look Around (spec §7.5) is deferred to v1.2 — requires a custom native
 * bridge to `MKLookAroundScene` not yet exposed by react-native-maps.
 */

// Centered on Madrid editorial center (Sol/Atocha axis). Used only as
// initialRegion; once stops load we fit the map to their bounding box.
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

  // Only stops with coordinates can render a pin. The Ruta API allows
  // null lat/lng for stops that haven't been geocoded yet — skip those
  // silently rather than rendering an off-map marker.
  const mappableStops = useMemo(
    () => stops.filter((s): s is RutaStopLite & { lat: number; lng: number } =>
      typeof s.lat === "number" && typeof s.lng === "number",
    ),
    [stops],
  );

  const [selectedStop, setSelectedStop] = useState<typeof mappableStops[number] | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Fit the map viewport to all mappable stops once they load. Single
  // pass · no animation on first fit (instant orientation > animated reveal
  // on cold start). Subsequent fits are not triggered · stops are stable
  // per Ruta week and the user can pan/zoom freely after.
  useEffect(() => {
    if (!mapRef.current || mappableStops.length === 0) return;
    const coords = mappableStops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
    // edgePadding leaves room for the floating masthead (top) and the
    // tab bar / potential preview card (bottom).
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 180, right: 60, bottom: 220, left: 60 },
      animated: false,
    });
  }, [mappableStops.length]);

  // Web fallback · react-native-maps doesn't render on the web stack.
  // The (tabs)/mapa route exists in the web build via expo-router but
  // Mapa is an iOS-first surface · show a tasteful placeholder so the
  // route doesn't crash if someone navigates to it in a browser.
  if (Platform.OS === "web") {
    return (
      <View style={[styles.root, styles.webFallback]}>
        <Text style={styles.webFallbackKicker}>XICO · MAPA</Text>
        <Text style={styles.webFallbackText}>El mapa vive en iOS.</Text>
      </View>
    );
  }

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
          {/* Tap-outside-to-dismiss overlay · standard iOS half-sheet pattern */}
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
            style={[
              styles.previewWrap,
              { bottom: insets.bottom + 100 }, // clear the tab bar
            ]}
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
                      // If Apple Maps isn't available (extremely rare on iOS),
                      // fall back to the universal maps.apple.com URL.
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

  // Web fallback (Mapa is iOS-first · no Google Maps web equivalent in our setup)
  webFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  webFallbackKicker: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  webFallbackText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Rumbo-colored disc marker · hairline white ring · stop number in bone.
  // No drop-shadow — Apple's dark map style has enough internal contrast
  // that the ring alone gives separation. Shadows on a dark map render
  // as muddy halos · we route around them per brandbook §2.
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

  // Preview card · slide-up half-sheet. Sits above the tab bar with
  // breathing room. accentBorder injects the rumbo color via GlassCard.
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
    fontSize: 13,
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
