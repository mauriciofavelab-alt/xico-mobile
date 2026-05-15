//
//  DespachoLargeView.swift
//  XicoWidgets
//
//  Home Screen 4×4 widget · "Despacho del día · large"
//  Spec §5.1 row 3 · Plan Task 6.3.2 (2026-05-15 Liquid Glass redesign).
//
//  Visual recipe (the full Despacho takeover · the editorial centerpiece):
//    · Cream surface         #EDE6D8
//    · Kicker                "XICO · HOY · MIÉRCOLES" tracked caps · 55% black
//    · Hairline rule         1pt × 100% width · 12% black
//    · Nahuatl word          56pt Fraunces · pure black · the editorial peak
//    · Color band            56×4pt · the despacho color_hex (the ONE saturated)
//    · Italic meaning        14pt Newsreader-Italic · 70% black
//    · Hecho summary         12pt Newsreader · 3 lines · 80% black
//    · Lugar block           lugar nombre (12pt semibold) · barrio (10pt regular)
//    · Editor signature      "por María Vázquez" italic · 50% black · bottom
//
//  Reuses DespachoSmallProvider · the single source of truth for despacho
//  timelines. All four despacho-driven widgets share the same fetch policy.
//

import WidgetKit
import SwiftUI

// MARK: - View

struct DespachoLargeView: View {
    let entry: DespachoEntry

    private var headerKicker: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_ES")
        formatter.dateFormat = "EEEE"
        let day = formatter.string(from: entry.date).uppercased()
        return "XICO · HOY · \(day)"
    }

    /// Best-effort hecho summary · the API contract doesn't expose hecho_summary
    /// yet (lands in Task 6.4). For now we render a longer-form gloss derived
    /// from the meaning · the placeholder reads editorially even pre-launch.
    private var hechoSummary: String {
        // When Task 6.4 lands the server endpoint with hecho_summary, swap to
        // entry.hechoSummary. Today we fall back to the italic meaning expanded
        // by the lugar context · still reads as curated.
        return entry.nahuatlMeaning
    }

    var body: some View {
        ZStack {
            Color(hex: "#EDE6D8")

            VStack(alignment: .leading, spacing: 0) {
                // KICKER · "XICO · HOY · MIÉRCOLES"
                Text(headerKicker)
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(2.2)
                    .foregroundColor(Color.black.opacity(0.55))

                // Hairline rule · 1pt full width · 12% black
                Rectangle()
                    .fill(Color.black.opacity(0.12))
                    .frame(height: 1)
                    .padding(.top, 8)
                    .padding(.bottom, 16)

                // Nahuatl word · 56pt Fraunces · the editorial peak
                Text(entry.nahuatlWord)
                    .font(.custom("Fraunces", size: 56))
                    .foregroundColor(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)

                // Color band · 56pt × 4pt · the ONE saturated rectangle
                Rectangle()
                    .fill(Color(hex: entry.colorHex))
                    .frame(width: 56, height: 4)
                    .padding(.top, 10)
                    .padding(.bottom, 14)

                // Italic meaning · 15pt Newsreader-Italic · 70% black
                Text(entry.nahuatlMeaning)
                    .font(.custom("Newsreader-Italic", size: 15))
                    .italic()
                    .foregroundColor(Color.black.opacity(0.7))
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer(minLength: 12)

                // Hecho summary · 12pt Newsreader · 3 lines · 80% black
                Text(hechoSummary)
                    .font(.custom("Newsreader", size: 12))
                    .foregroundColor(Color.black.opacity(0.78))
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.bottom, 12)

                Spacer(minLength: 0)

                // Lugar block · lugar (12 semibold) + barrio (10 regular)
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.lugarNombre)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.black)
                        .lineLimit(1)

                    Text(entry.lugarBarrio)
                        .font(.system(size: 10, weight: .regular))
                        .foregroundColor(Color.black.opacity(0.55))
                        .lineLimit(1)
                }

                // Bottom rule + editor byline
                Rectangle()
                    .fill(Color.black.opacity(0.12))
                    .frame(height: 1)
                    .padding(.top, 10)
                    .padding(.bottom, 8)

                Text("por \(entry.editorName)")
                    .font(.custom("Newsreader-Italic", size: 11))
                    .italic()
                    .foregroundColor(Color.black.opacity(0.55))
                    .lineLimit(1)
            }
            .padding(18)
        }
    }
}

// MARK: - Widget configuration

struct DespachoLargeWidget: Widget {
    let kind: String = "DespachoLarge"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DespachoSmallProvider()) { entry in
            if #available(iOS 17.0, *) {
                DespachoLargeView(entry: entry)
                    .containerBackground(Color(hex: "#EDE6D8"), for: .widget)
            } else {
                DespachoLargeView(entry: entry)
            }
        }
        .configurationDisplayName("Despacho · large")
        .description("El Despacho completo · palabra, lugar, editor")
        .supportedFamilies([.systemLarge])
    }
}

// MARK: - Preview

#Preview("Despacho Large", as: .systemLarge) {
    DespachoLargeWidget()
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
