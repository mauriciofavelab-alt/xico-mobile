//
//  LockCircularView.swift
//  XicoWidgets
//
//  Lock Screen circular widget · "gauge-style rosetón"
//  Spec §5.2 row 2 · Plan Task 6.3.4 (2026-05-15 Liquid Glass redesign).
//
//  Design trade-off (5-axis · per XICO architecture rules):
//    · efficiency  — SwiftUI Gauge renders natively · GPU-optimized
//    · coding cost — ~10 lines vs ~80 for a custom Path-drawn rosetón
//    · functional  — system tint integrates with all 6 Lock Screen wallpapers
//    · necessity   — the 4-petal rosetón visual identity already lives on the
//                    HOME Large widget · Lock scale is too small for petals
//    · cost        — equal
//
//  Decision: Gauge.accessoryCircularCapacity. The user's emotional moment is
//  "I have N sellos this week" · a circular fill ring conveys that at a glance.
//  The cosmological rumbo identity stays on Home + StandBy where space allows.
//
//  Requires iOS 17+ (matches deployment target via expo-build-properties · iOS
//  17 already enforced in Phase 5 for react-native-maps and WidgetKit
//  ContainerBackground).
//

import WidgetKit
import SwiftUI

// MARK: - View

struct LockCircularView: View {
    let entry: RutaProgressEntry

    var body: some View {
        Gauge(
            value: Double(entry.earnedStops),
            in: 0...Double(max(entry.totalStops, 1))
        ) {
            // Empty bottom label · the count goes in currentValueLabel
            EmptyView()
        } currentValueLabel: {
            Text("\(entry.earnedStops)")
                .font(.system(size: 18, weight: .semibold))
        }
        .gaugeStyle(.accessoryCircularCapacity)
        // System tints this with the Lock Screen accent · we mark our content
        // accentable so iOS knows what to color when the user picks a tint.
        .widgetAccentable()
    }
}

// MARK: - Widget configuration

struct LockCircularWidget: Widget {
    let kind: String = "LockCircular"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RutaProgressProvider()) { entry in
            if #available(iOS 17.0, *) {
                LockCircularView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                LockCircularView(entry: entry)
            }
        }
        .configurationDisplayName("Ruta · sellos")
        .description("Cuántos sellos has ganado esta semana")
        .supportedFamilies([.accessoryCircular])
    }
}

// MARK: - Preview

#Preview("Lock Circular", as: .accessoryCircular) {
    LockCircularWidget()
} timeline: {
    RutaProgressEntry(
        date: Date(),
        earnedStops: 2,
        totalStops: 5,
        nextStopName: "Casa de México en España",
        nextStopRumboHex: "#234698",
        earnedByRumbo: ["norte": 1, "este": 1, "sur": 0, "oeste": 0],
        weekLabel: "SEMANA 19"
    )
}
