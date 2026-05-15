//
//  ColorHex.swift
//  XicoWidgets
//
//  Hex color helper for SwiftUI · shared across widget views.
//  Mirrors the iOS UIKit pattern but yields SwiftUI Color directly.
//
//  Pulled into its own file (rather than inlined into DespachoSmallView.swift)
//  because every widget surface in Task 6.3 will consume color_hex from the
//  same API contract. One canonical definition for the whole extension target.
//

import SwiftUI

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r, g, b: UInt64
        switch h.count {
        case 6: (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default: (r, g, b) = (0, 0, 0)
        }
        self.init(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}
