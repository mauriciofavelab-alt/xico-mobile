//
//  LockRectangularView.swift
//  XicoWidgets
//
//  Lock Screen rectangular widget · mini rosetón + sello count + next stop
//  Spec §5.2 row 3 · Plan Task 6.3.5 (2026-05-15 Liquid Glass redesign).
//
//  Three columns at Lock Screen scale:
//    · LEFT  · 28pt circular gauge (the "mini rosetón")
//    · RIGHT · "2 / 5 SELLOS" tracked caps · 11pt semibold
//            · next stop italic name · 12pt
//
//  Lock Screen rules: system fonts only (Apple renders custom fonts as system
//  in Lock Screen widgets · so we use .system explicitly and tracked uppercase
//  for the editorial signal). Color.primary inherits the user's Lock Screen
//  tint · we mark the gauge .widgetAccentable() so it carries the accent.
//

import WidgetKit
import SwiftUI

// MARK: - View

struct LockRectangularView: View {
    let entry: RutaProgressEntry

    var body: some View {
        HStack(spacing: 10) {
            // LEFT · mini circular gauge · the "rosetón" abstracted
            Gauge(
                value: Double(entry.earnedStops),
                in: 0...Double(max(entry.totalStops, 1))
            ) {
                EmptyView()
            }
            .gaugeStyle(.accessoryCircularCapacity)
            .frame(width: 32, height: 32)
            .widgetAccentable()

            // RIGHT · the editorial information stack
            VStack(alignment: .leading, spacing: 2) {
                // Sellos · tracked caps · the editorial label
                Text("\(entry.earnedStops) / \(entry.totalStops) SELLOS")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.2)
                    .lineLimit(1)

                // Next stop · italic system serif (system font with .italic
                // gives us a serif-like editorial cue without bundling Newsreader)
                if let nextStop = entry.nextStopName {
                    Text(nextStop)
                        .font(.system(size: 12, weight: .regular, design: .serif))
                        .italic()
                        .lineLimit(1)
                        .truncationMode(.tail)
                } else {
                    Text("Ruta completa")
                        .font(.system(size: 12, weight: .regular, design: .serif))
                        .italic()
                        .lineLimit(1)
                }

                // Week label · tracked tertiary · the editorial timestamp
                Text(entry.weekLabel)
                    .font(.system(size: 9, weight: .medium))
                    .tracking(1.4)
                    .opacity(0.7)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Widget configuration

struct LockRectangularWidget: Widget {
    let kind: String = "LockRectangular"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RutaProgressProvider()) { entry in
            if #available(iOS 17.0, *) {
                LockRectangularView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                LockRectangularView(entry: entry)
            }
        }
        .configurationDisplayName("Ruta · próxima parada")
        .description("Sellos ganados + tu próxima parada")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Preview

#Preview("Lock Rectangular", as: .accessoryRectangular) {
    LockRectangularWidget()
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
