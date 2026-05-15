//
//  LockInlineView.swift
//  XicoWidgets
//
//  Lock Screen inline widget · "XICO · NEPANTLA · LAVAPIÉS"
//  Spec §5.2 row 1 · Plan Task 6.3.3 (2026-05-15 Liquid Glass redesign).
//
//  Lock Screen inline widgets are constrained to a SINGLE LINE of text rendered
//  by the system in white-on-dark (Apple's tintColor handling). System fonts
//  only · custom .ttf doesn't render here per Apple's Lock Screen UI rules.
//
//  We use Color.primary (system white on Lock) · NO custom font · the editorial
//  cues are TYPOGRAPHIC: uppercase, tracked, the canonical "XICO · WORD · LUGAR"
//  rhythm.
//
//  The despacho color_hex shows up only via a SF Symbol "circle.fill" preceding
//  the text · Apple's inline widget supports a tinted symbol next to the
//  label (this is the only "color" we can express at this scale).
//

import WidgetKit
import SwiftUI

// MARK: - View

struct LockInlineView: View {
    let entry: DespachoEntry

    var body: some View {
        // Lock Screen inline gets ONE line. Apple's system renders this as
        // a horizontally-laid single string. We use the canonical XICO rhythm:
        //
        //   ● XICO · NEPANTLA · LAVAPIÉS
        //
        // The leading circle inherits the day's color via .widgetAccentable()
        // on iOS 17+ (Lock Screen accent tinting).
        ViewThatFits(in: .horizontal) {
            // Full version · symbol + 3 segments
            HStack(spacing: 4) {
                Image(systemName: "circle.fill")
                    .font(.system(size: 7))
                    .widgetAccentable()
                Text("XICO · \(entry.nahuatlWord.uppercased()) · \(entry.lugarBarrio.uppercased())")
                    .font(.system(size: 12, weight: .semibold))
            }
            // Compact fallback · drop the barrio
            HStack(spacing: 4) {
                Image(systemName: "circle.fill")
                    .font(.system(size: 7))
                    .widgetAccentable()
                Text("XICO · \(entry.nahuatlWord.uppercased())")
                    .font(.system(size: 12, weight: .semibold))
            }
        }
    }
}

// MARK: - Widget configuration

struct LockInlineWidget: Widget {
    let kind: String = "LockInline"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DespachoSmallProvider()) { entry in
            if #available(iOS 17.0, *) {
                LockInlineView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                LockInlineView(entry: entry)
            }
        }
        .configurationDisplayName("XICO · inline")
        .description("La palabra del día · tracked caps")
        .supportedFamilies([.accessoryInline])
    }
}

// MARK: - Preview

#Preview("Lock Inline", as: .accessoryInline) {
    LockInlineWidget()
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
