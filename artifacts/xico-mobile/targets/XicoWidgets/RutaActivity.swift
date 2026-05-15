//
//  RutaActivity.swift
//  XicoWidgets
//
//  ActivityAttributes for the active-Ruta Live Activity.
//  Per ADR-007 · Live Activities live in the SAME extension target as widgets.
//  Spec §6 · Plan Task 7.1 (2026-05-15 Liquid Glass redesign).
//
//  Fields adapted from the plan:
//    · Removed `nextStopBarrio` · the Ruta API doesn't carry barrio yet
//      (Phase 4.4 note) and the Dynamic Island has no room for it anyway.
//    · Removed `nextStopPhotoURL` · per-stop photos aren't sourced for v1.1
//      (ADR-003) · revisit when the despacho-photo backlog is filled.
//    · Added `nextStopRumboHex` · the Dynamic Island compact + expanded
//      stopsCompleted/total numeral tints with the rumbo of the NEXT stop ·
//      this is the one saturated hit per surface (brandbook §6) and it
//      requires sending the color with each update rather than hardcoding.
//    · `rosetonState` order is canonical Mexica cosmology:
//      [norte, este, sur, oeste] · matches widget RutaProgressProvider.
//
//  Total state size well within the 4 KB Live Activity budget.
//

import ActivityKit
import Foundation

struct RutaActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Sellos earned this Ruta (0...5).
        var stopsCompleted: Int
        /// Total stops in the active Ruta (usually 5).
        var stopsTotal: Int
        /// Name of the next stop · e.g. "Casa de México".
        var nextStopName: String
        /// Walking distance in meters · e.g. 850.
        var nextStopDistanceM: Int
        /// Hex of the rumbo color associated with the next stop ·
        /// e.g. "#D9357B" (Tlapallan · Este). Used as the editorial accent
        /// on the compact-trailing and expanded-trailing numerals.
        var nextStopRumboHex: String
        /// Sello count per rumbo · canonical order [norte, este, sur, oeste].
        /// Drives the mini rosetón petal fills (see RosetonMiniView).
        var rosetonState: [Int]
    }

    /// ISO week key · e.g. "2026-W19". Used for the Lock Screen kicker.
    var weekKey: String
    /// Curating editor's name · e.g. "María Vázquez". Optional editorial byline.
    var editorName: String
}
