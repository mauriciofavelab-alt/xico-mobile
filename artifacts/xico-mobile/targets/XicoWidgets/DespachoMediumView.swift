//
//  DespachoMediumView.swift
//  XicoWidgets
//
//  Home Screen 4×2 widget · "Despacho del día · medium"
//  Spec §5.1 row 2 · Plan Task 6.3.1 (2026-05-15 Liquid Glass redesign).
//
//  Visual recipe (extends the Small spec · same cream + black + ONE saturated hit):
//    · Cream surface    #EDE6D8
//    · LEFT column      kicker → word → color band → meaning (mirrors Small)
//    · RIGHT column     color swatch (top-right · 32×32 · the despacho color_hex)
//                       day-of-week kicker
//                       lugar nombre · barrio
//                       editor byline ITALIC (Newsreader)
//    · Hairline divider between columns · 1pt × 80% height · 18% black alpha
//
//  Provider · reuses DespachoSmallProvider from DespachoSmallView.swift.
//  The provider is despacho-driven · same timeline shape works for all
//  despacho widget families. No need for a Medium-specific provider.
//
//  Fonts · falls back to system if Fraunces/Newsreader aren't bundled in the
//  widget extension yet (see expo-target.config.js TODO at the top of file).
//

import WidgetKit
import SwiftUI

// MARK: - View

struct DespachoMediumView: View {
    let entry: DespachoEntry

    private var dayOfWeek: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_ES")
        formatter.dateFormat = "EEEE"
        return formatter.string(from: entry.date).uppercased()
    }

    var body: some View {
        ZStack {
            Color(hex: "#EDE6D8")

            HStack(alignment: .top, spacing: 14) {
                // LEFT · the editorial column
                VStack(alignment: .leading, spacing: 6) {
                    Text("XICO · HOY")
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(2.0)
                        .foregroundColor(Color.black.opacity(0.55))

                    Spacer(minLength: 0)

                    // Nahuatl word · 30pt Fraunces · pure black
                    Text(entry.nahuatlWord)
                        .font(.custom("Fraunces", size: 30))
                        .foregroundColor(.black)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    // Editorial rule · the ONE saturated moment
                    Rectangle()
                        .fill(Color(hex: entry.colorHex))
                        .frame(width: 44, height: 3)
                        .padding(.vertical, 4)

                    // Italic meaning · 12pt Newsreader-Italic · 70% black
                    Text(entry.nahuatlMeaning)
                        .font(.custom("Newsreader-Italic", size: 12))
                        .italic()
                        .foregroundColor(Color.black.opacity(0.7))
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer(minLength: 0)
                }

                // Hairline divider · 1pt · 70% height · soft black
                Rectangle()
                    .fill(Color.black.opacity(0.12))
                    .frame(width: 1)
                    .padding(.vertical, 6)

                // RIGHT · context column
                VStack(alignment: .leading, spacing: 6) {
                    // Color swatch (the ONE saturated moment · echoed in the rule)
                    HStack {
                        Spacer()
                        Rectangle()
                            .fill(Color(hex: entry.colorHex))
                            .frame(width: 24, height: 24)
                    }

                    Text(dayOfWeek)
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(2.0)
                        .foregroundColor(Color.black.opacity(0.55))

                    Spacer(minLength: 0)

                    // Lugar
                    Text(entry.lugarNombre)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.black)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(entry.lugarBarrio)
                        .font(.system(size: 10, weight: .regular))
                        .foregroundColor(Color.black.opacity(0.55))
                        .lineLimit(1)

                    Spacer(minLength: 0)

                    // Editor byline · italic Newsreader · the editorial signature
                    Text("por \(entry.editorName)")
                        .font(.custom("Newsreader-Italic", size: 10))
                        .italic()
                        .foregroundColor(Color.black.opacity(0.55))
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(14)
        }
    }
}

// MARK: - Widget configuration

struct DespachoMediumWidget: Widget {
    let kind: String = "DespachoMedium"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DespachoSmallProvider()) { entry in
            if #available(iOS 17.0, *) {
                DespachoMediumView(entry: entry)
                    .containerBackground(Color(hex: "#EDE6D8"), for: .widget)
            } else {
                DespachoMediumView(entry: entry)
            }
        }
        .configurationDisplayName("Despacho · medium")
        .description("La palabra, el lugar y el editor de hoy")
        .supportedFamilies([.systemMedium])
    }
}

// MARK: - Preview

#Preview("Despacho Medium", as: .systemMedium) {
    DespachoMediumWidget()
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
