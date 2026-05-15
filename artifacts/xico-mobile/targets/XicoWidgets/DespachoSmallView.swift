//
//  DespachoSmallView.swift
//  XicoWidgets
//
//  Home Screen 2×2 widget · "Despacho del día"
//  Spec §5.1 row 1 (Home Small · Despacho variant) ·
//  Plan Task 6.2 (2026-05-15 Liquid Glass redesign).
//
//  Visual recipe (premium not pretentious · curated not algorithmic):
//    · Cream surface  #EDE6D8  (Las Arboledas bone · brandbook §5 Oeste)
//    · Kicker "XICO · HOY"     9pt tracked caps · 55% black alpha
//    · Nahuatl word            26pt Fraunces · pure black
//    · Color band              36×3pt rectangle · the despacho color_hex
//                              (the ONE saturated moment · the editorial rule)
//    · Italic meaning          11pt Newsreader-Italic · 70% black alpha
//    · Lugar label             9pt tracked medium · 50% black alpha
//
//  TODOs (intentionally deferred · documented per task brief):
//    · Bundle Fraunces.ttf + Newsreader-Italic.ttf in expo-target.config.js
//      (Task 6.3 wrap-up · all widget surfaces need the same fonts).
//      Until then, SwiftUI falls back to system font for .custom() calls
//      that don't resolve · widget still renders.
//    · Configure App Group sharing in entitlements (Task 6.4 follow-up · once
//      the API endpoint authenticates we'll cache the snapshot via the
//      group.com.xico.app.widgets UserDefaults suite).
//    · The /api/widget/today endpoint itself ships in Task 6.4. Until then
//      WidgetDataProvider.fetchDespacho() falls back to placeholder() on
//      URL error · widget renders the placeholder copy below.
//

import WidgetKit
import SwiftUI

// MARK: - Timeline entry

struct DespachoEntry: TimelineEntry {
    let date: Date
    let nahuatlWord: String
    let nahuatlMeaning: String
    let colorHex: String
    let lugarNombre: String
    let lugarBarrio: String
    let editorName: String
}

// MARK: - Timeline provider

struct DespachoSmallProvider: TimelineProvider {
    func placeholder(in context: Context) -> DespachoEntry {
        WidgetDataProvider.placeholder()
    }

    func getSnapshot(in context: Context, completion: @escaping (DespachoEntry) -> Void) {
        if context.isPreview {
            completion(placeholder(in: context))
            return
        }
        Task {
            let entry = await WidgetDataProvider.fetchDespacho()
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DespachoEntry>) -> Void) {
        Task {
            let entry = await WidgetDataProvider.fetchDespacho()
            // Refresh once per day · the next 9:00 (Madrid local time).
            // Calendar.current respects the device locale · matches the editorial
            // cadence "el despacho llega cada mañana".
            let next = Calendar.current.nextDate(
                after: Date(),
                matching: DateComponents(hour: 9, minute: 0),
                matchingPolicy: .nextTime
            ) ?? Date().addingTimeInterval(60 * 60 * 6)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }
}

// MARK: - View

struct DespachoSmallView: View {
    let entry: DespachoEntry

    var body: some View {
        ZStack(alignment: .leading) {
            Color(hex: "#EDE6D8")

            VStack(alignment: .leading, spacing: 6) {
                // Kicker · 9pt tracked caps · 55% black
                Text("XICO · HOY")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(2.0)
                    .foregroundColor(Color.black.opacity(0.55))

                Spacer(minLength: 0)

                // Nahuatl word · 26pt Fraunces · pure black
                Text(entry.nahuatlWord)
                    .font(.custom("Fraunces", size: 26))
                    .foregroundColor(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                // Editorial rule · the ONE saturated moment
                // 36pt × 3pt rectangle filled with the despacho's color_hex
                Rectangle()
                    .fill(Color(hex: entry.colorHex))
                    .frame(width: 36, height: 3)
                    .padding(.vertical, 4)

                // Italic meaning · 11pt Newsreader-Italic · 70% black
                Text(entry.nahuatlMeaning)
                    .font(.custom("Newsreader-Italic", size: 11))
                    .italic()
                    .foregroundColor(Color.black.opacity(0.7))
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer(minLength: 0)

                // Lugar label · 9pt tracked medium · 50% black
                Text(entry.lugarNombre)
                    .font(.system(size: 9, weight: .medium))
                    .tracking(1.2)
                    .foregroundColor(Color.black.opacity(0.5))
                    .lineLimit(1)
            }
            .padding(14)
        }
    }
}

// MARK: - Widget configuration

struct DespachoSmallWidget: Widget {
    let kind: String = "DespachoSmall"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DespachoSmallProvider()) { entry in
            if #available(iOS 17.0, *) {
                DespachoSmallView(entry: entry)
                    .containerBackground(Color(hex: "#EDE6D8"), for: .widget)
            } else {
                DespachoSmallView(entry: entry)
            }
        }
        .configurationDisplayName("Despacho del día")
        .description("La palabra y el lugar de hoy")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Preview

#Preview("Despacho Small", as: .systemSmall) {
    DespachoSmallWidget()
} timeline: {
    DespachoEntry(
        date: Date(),
        nahuatlWord: "Nepantla",
        nahuatlMeaning: "el espacio entre dos mundos",
        colorHex: "#B8820A",
        lugarNombre: "Mercado de San Fernando",
        lugarBarrio: "Lavapiés",
        editorName: "María Vázquez"
    )
}
