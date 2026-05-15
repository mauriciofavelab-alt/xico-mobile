//
//  WidgetDataProvider.swift
//  XicoWidgets
//
//  Network fetcher for widget surfaces · widgets run as separate iOS
//  processes and cannot import the in-app `constants/despachos.ts` (ADR-001).
//
//  Contract for /api/widget/today (Task 6.4 ships the server endpoint):
//    {
//      "despacho": {
//        "nahuatl_word":   "Nepantla",
//        "nahuatl_meaning":"el espacio entre dos mundos",
//        "color_hex":      "#B8820A",
//        "lugar_nombre":   "Mercado de San Fernando",
//        "lugar_barrio":   "Lavapiés",
//        "editor_name":    "María Vázquez"
//      }
//    }
//
//  TODOs:
//    · /api/widget/today does NOT exist yet · Task 6.4 builds it. Until then
//      every fetch falls into the catch branch and returns placeholder().
//      That's the intended fallback · widget always renders.
//    · App Group + UserDefaults caching · Task 6.4 follow-up. When the
//      endpoint authenticates we'll write the snapshot to
//      group.com.xico.app.widgets so the widget survives airplane mode.
//

import Foundation

enum WidgetDataProvider {
    /// Railway production API · mirrors `API_BASE` in
    /// `constants/api.ts` (verified 2026-05-15).
    static let baseURL = "https://xico-api-production.up.railway.app"

    /// Async fetch · falls back to `placeholder()` on any failure so the
    /// widget timeline never returns an empty entry.
    static func fetchDespacho() async -> DespachoEntry {
        guard let url = URL(string: "\(baseURL)/api/widget/today") else {
            return placeholder()
        }
        do {
            var request = URLRequest(url: url)
            // Widgets get a tight network budget · be polite about cache.
            request.cachePolicy = .reloadIgnoringLocalCacheData
            request.timeoutInterval = 8

            let (data, response) = try await URLSession.shared.data(for: request)

            if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
                return placeholder()
            }

            let decoded = try JSONDecoder().decode(WidgetResponse.self, from: data)
            return DespachoEntry(
                date: Date(),
                nahuatlWord: decoded.despacho.nahuatlWord,
                nahuatlMeaning: decoded.despacho.nahuatlMeaning,
                colorHex: decoded.despacho.colorHex,
                lugarNombre: decoded.despacho.lugarNombre,
                lugarBarrio: decoded.despacho.lugarBarrio,
                editorName: decoded.despacho.editorName
            )
        } catch {
            return placeholder()
        }
    }

    /// Editorial placeholder · real-looking values from Despacho #001 so the
    /// gallery preview and offline fallback feel curated, not synthetic.
    static func placeholder() -> DespachoEntry {
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
}

// MARK: - JSON contract

struct WidgetResponse: Decodable {
    let despacho: DespachoPayload

    struct DespachoPayload: Decodable {
        let nahuatlWord: String
        let nahuatlMeaning: String
        let colorHex: String
        let lugarNombre: String
        let lugarBarrio: String
        let editorName: String

        enum CodingKeys: String, CodingKey {
            case nahuatlWord = "nahuatl_word"
            case nahuatlMeaning = "nahuatl_meaning"
            case colorHex = "color_hex"
            case lugarNombre = "lugar_nombre"
            case lugarBarrio = "lugar_barrio"
            case editorName = "editor_name"
        }
    }
}
