//
//  RutaProgressProvider.swift
//  XicoWidgets
//
//  Ruta progress timeline · feeds the Lock Circular + Lock Rectangular widgets.
//  Spec §5.2 (Lock Screen) · Plan Task 6.3 (2026-05-15 Liquid Glass redesign).
//
//  Why a separate provider? The Despacho widgets (Small / Medium / Large /
//  Inline / StandBy) all share ONE provider because they show the same content
//  shape (the day's despacho). The Lock Circular + Rectangular surfaces show
//  a fundamentally different data shape — the user's PERSONAL Ruta progress,
//  not the editorial despacho. So they get a sibling provider.
//
//  Two providers · two data shapes · zero abstraction overhead. Per the XICO
//  architecture trade-off framework: don't add a unified provider abstraction
//  when 2 concrete providers do the job without rework.
//
//  TODOs (deferred per task brief):
//    · App Group bridge to ditch network calls is wired in Task 6.4 · the
//      iOS app will write the latest Ruta state to
//      group.com.xico.app.widgets UserDefaults so widgets read it locally.
//    · /api/widget/today server endpoint ships in Task 6.4 and exposes the
//      `ruta` field below. Until then every fetch falls into placeholder().
//

import Foundation
import WidgetKit

// MARK: - Timeline entry

struct RutaProgressEntry: TimelineEntry {
    let date: Date
    let earnedStops: Int          // 0...totalStops · sellos earned this week
    let totalStops: Int           // typically 5 · the Ruta has 5 stops
    let nextStopName: String?     // nil when the Ruta is fully complete
    let nextStopRumboHex: String? // color of next stop's rumbo · for accent
    let earnedByRumbo: [String: Int]  // {"norte": 1, "este": 0, "sur": 0, "oeste": 0}
    let weekLabel: String         // e.g., "SEMANA 19"
}

// MARK: - Timeline provider

struct RutaProgressProvider: TimelineProvider {
    func placeholder(in context: Context) -> RutaProgressEntry {
        RutaProgressProvider.placeholderRuta()
    }

    func getSnapshot(in context: Context, completion: @escaping (RutaProgressEntry) -> Void) {
        if context.isPreview {
            completion(placeholder(in: context))
            return
        }
        Task {
            let entry = await Self.fetchRuta()
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RutaProgressEntry>) -> Void) {
        Task {
            let entry = await Self.fetchRuta()
            // Refresh hourly · Ruta progress changes when the user earns sellos
            // mid-day. Tighter cadence than despacho (which is daily). The OS
            // ultimately decides actual refresh frequency · this is just a hint.
            let next = Date().addingTimeInterval(60 * 60)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    // MARK: Fetch

    /// Async fetch · falls back to `placeholderRuta()` on any failure so the
    /// widget timeline never returns an empty entry.
    static func fetchRuta() async -> RutaProgressEntry {
        guard let url = URL(string: "\(WidgetDataProvider.baseURL)/api/widget/today") else {
            return placeholderRuta()
        }
        do {
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalCacheData
            request.timeoutInterval = 8

            let (data, response) = try await URLSession.shared.data(for: request)

            if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
                return placeholderRuta()
            }

            let decoded = try JSONDecoder().decode(RutaWidgetResponse.self, from: data)
            let r = decoded.ruta
            return RutaProgressEntry(
                date: Date(),
                earnedStops: r.earnedStops,
                totalStops: r.totalStops,
                nextStopName: r.nextStopName,
                nextStopRumboHex: r.nextStopRumboHex,
                earnedByRumbo: r.earnedByRumbo,
                weekLabel: r.weekLabel
            )
        } catch {
            return placeholderRuta()
        }
    }

    /// Editorial placeholder · pre-launch state. Zero sellos, Casa de México as
    /// the canonical first stop (the inaugural lugar of the XICO project).
    static func placeholderRuta() -> RutaProgressEntry {
        RutaProgressEntry(
            date: Date(),
            earnedStops: 0,
            totalStops: 5,
            nextStopName: "Casa de México en España",
            nextStopRumboHex: "#234698",  // Sur · Casa Azul ultramarine
            earnedByRumbo: ["norte": 0, "este": 0, "sur": 0, "oeste": 0],
            weekLabel: "SEMANA 19"
        )
    }
}

// MARK: - JSON contract

/// Parses the `ruta` field of `/api/widget/today`. The full response also
/// carries `despacho` (handled by WidgetDataProvider) · we decode both
/// independently so each provider only depends on the shape it needs.
struct RutaWidgetResponse: Decodable {
    let ruta: RutaPayload

    struct RutaPayload: Decodable {
        let weekLabel: String
        let earnedStops: Int
        let totalStops: Int
        let nextStopName: String?
        let nextStopRumboHex: String?
        let earnedByRumbo: [String: Int]

        enum CodingKeys: String, CodingKey {
            case weekLabel = "week_label"
            case earnedStops = "earned_stops"
            case totalStops = "total_stops"
            case nextStopName = "next_stop_name"
            case nextStopRumboHex = "next_stop_rumbo_hex"
            case earnedByRumbo = "earned_by_rumbo"
        }
    }
}
