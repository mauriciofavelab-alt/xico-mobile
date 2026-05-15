//
//  StandByView.swift
//  XicoWidgets
//
//  StandBy landscape widget · full Despacho takeover when iPhone is docked
//  horizontally on a nightstand.
//  Spec §5.3 · Plan Task 6.3.6 (2026-05-15 Liquid Glass redesign).
//
//  StandBy on iPhone shows a landscape `.systemLarge` widget. iOS exposes
//  the night-mode signal via `@Environment(\.isLuminanceReduced)` · when true
//  we drop saturation and tint everything red-ish (Apple's convention for
//  the dim ambient mode · matches the system clock / weather appearance).
//
//  Two-branch design:
//    · DAY  · cream background · color band · full editorial palette
//    · NIGHT · pure black background · red-dim text · NO color band
//               (the despacho's color_hex is too saturated for dim mode ·
//                rendering it would burn the eye in a dark bedroom)
//
//  This is the Mary Cassatt DailyArt model the spec referenced · a full
//  editorial takeover on the dock at 9pm.
//

import WidgetKit
import SwiftUI

// MARK: - View

struct StandByView: View {
    let entry: DespachoEntry
    @Environment(\.isLuminanceReduced) var isLuminanceReduced

    private var headerKicker: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "es_ES")
        formatter.dateFormat = "EEEE"
        let day = formatter.string(from: entry.date).uppercased()
        return "XICO · HOY · \(day)"
    }

    var body: some View {
        if isLuminanceReduced {
            nightBody
        } else {
            dayBody
        }
    }

    // MARK: Day variant · the editorial centerpiece

    private var dayBody: some View {
        ZStack {
            Color(hex: "#EDE6D8")

            HStack(alignment: .top, spacing: 24) {
                // LEFT · the word + editorial rule + meaning
                VStack(alignment: .leading, spacing: 0) {
                    Text(headerKicker)
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(2.2)
                        .foregroundColor(Color.black.opacity(0.55))

                    Rectangle()
                        .fill(Color.black.opacity(0.12))
                        .frame(height: 1)
                        .padding(.top, 8)
                        .padding(.bottom, 16)

                    Text(entry.nahuatlWord)
                        .font(.custom("Fraunces", size: 56))
                        .foregroundColor(.black)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)

                    Rectangle()
                        .fill(Color(hex: entry.colorHex))
                        .frame(width: 56, height: 4)
                        .padding(.top, 10)
                        .padding(.bottom, 14)

                    Text(entry.nahuatlMeaning)
                        .font(.custom("Newsreader-Italic", size: 15))
                        .italic()
                        .foregroundColor(Color.black.opacity(0.7))
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // RIGHT · lugar block + editor byline
                VStack(alignment: .leading, spacing: 4) {
                    Spacer(minLength: 28)

                    Text("LUGAR")
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(2.0)
                        .foregroundColor(Color.black.opacity(0.5))

                    Text(entry.lugarNombre)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.black)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(entry.lugarBarrio)
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(Color.black.opacity(0.55))
                        .lineLimit(1)

                    Spacer(minLength: 0)

                    // Editor byline · the signature
                    Text("por \(entry.editorName)")
                        .font(.custom("Newsreader-Italic", size: 11))
                        .italic()
                        .foregroundColor(Color.black.opacity(0.55))
                        .lineLimit(1)
                }
                .frame(width: 140, alignment: .leading)
            }
            .padding(20)
        }
    }

    // MARK: Night variant · dim ambient · monochrome red

    private var nightBody: some View {
        ZStack {
            Color.black

            HStack(alignment: .top, spacing: 24) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(headerKicker)
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(2.2)
                        .foregroundColor(Color.red.opacity(0.5))

                    // Drop the hairline rule in night mode · less visual noise
                    Spacer(minLength: 14)

                    Text(entry.nahuatlWord)
                        .font(.custom("Fraunces", size: 56))
                        .foregroundColor(Color.red.opacity(0.6))
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)

                    // NO color band in night mode · color_hex would burn

                    Spacer(minLength: 14)

                    Text(entry.nahuatlMeaning)
                        .font(.custom("Newsreader-Italic", size: 15))
                        .italic()
                        .foregroundColor(Color.red.opacity(0.4))
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 4) {
                    Spacer(minLength: 28)

                    Text(entry.lugarNombre)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(Color.red.opacity(0.5))
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(entry.lugarBarrio)
                        .font(.system(size: 11, weight: .regular))
                        .foregroundColor(Color.red.opacity(0.35))
                        .lineLimit(1)

                    Spacer(minLength: 0)

                    Text("por \(entry.editorName)")
                        .font(.custom("Newsreader-Italic", size: 11))
                        .italic()
                        .foregroundColor(Color.red.opacity(0.35))
                        .lineLimit(1)
                }
                .frame(width: 140, alignment: .leading)
            }
            .padding(20)
        }
    }
}

// MARK: - Widget configuration

struct StandByWidget: Widget {
    let kind: String = "StandBy"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DespachoSmallProvider()) { entry in
            if #available(iOS 17.0, *) {
                StandByView(entry: entry)
                    // StandBy mode tints the container automatically when
                    // isLuminanceReduced · cream stays as the day-state surface
                    .containerBackground(Color(hex: "#EDE6D8"), for: .widget)
            } else {
                StandByView(entry: entry)
            }
        }
        .configurationDisplayName("Despacho · StandBy")
        .description("La pantalla de noche · el despacho en panorámico")
        .supportedFamilies([.systemLarge])
    }
}

// MARK: - Preview

#Preview("StandBy · day", as: .systemLarge) {
    StandByWidget()
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
