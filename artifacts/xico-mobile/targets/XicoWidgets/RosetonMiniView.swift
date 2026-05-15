//
//  RosetonMiniView.swift
//  XicoWidgets
//
//  Shared mini rosetón renderer for the Live Activity. Used at:
//    · 18pt in Dynamic Island compact-leading and minimal regions
//    · 32pt in Dynamic Island expanded-leading region
//    · 36pt in the Lock Screen banner
//
//  Four ellipse petals arranged N/E/S/O, tinted in rumbo colors when
//  the corresponding rumbo has >= 1 sello, dim otherwise. A green center
//  dot appears when all four rumbos have >= 1 (the Cronista cusp).
//
//  Why ellipses (not custom Path almond shapes): at 18pt the petal silhouette
//  is barely distinguishable · ellipses scale legibly from 18pt to 36pt with
//  zero rendering cost. The four-direction COLOR signal carries the meaning
//  · the shape is just a container.
//
//  Rumbo color order matches brandbook §5 and the RutaProgressProvider
//  state array · [norte, este, sur, oeste].
//

import SwiftUI

struct RosetonMiniView: View {
    /// Sello count per rumbo · canonical order [norte, este, sur, oeste].
    let state: [Int]
    /// Outer diameter in points. Petal dimensions scale from this.
    let size: CGFloat

    // Mexica rumbo colors · brandbook §5
    private let rumboColors: [Color] = [
        Color(hex: "#0E1018"), // Mictlampa · norte · the blackest visible petal
        Color(hex: "#D9357B"), // Tlapallan · este · Barragán rosa
        Color(hex: "#234698"), // Huitzlampa · sur · Casa Azul ultramarine
        Color(hex: "#EDE6D8"), // Cihuatlampa · oeste · Las Arboledas bone
    ]

    var body: some View {
        ZStack {
            ForEach(0..<4, id: \.self) { i in
                let filled = (state.indices.contains(i) && state[i] > 0)
                Ellipse()
                    .fill(filled ? rumboColors[i] : Color.white.opacity(0.2))
                    .frame(width: size * 0.22, height: size * 0.5)
                    .offset(y: -size * 0.2)
                    .rotationEffect(.degrees(Double(i) * 90))
            }
            // Cronista cusp · all four rumbos earned at least one sello
            if state.count == 4 && state.allSatisfy({ $0 > 0 }) {
                Circle()
                    .fill(Color(hex: "#3F5A3A")) // Tlalxicco verde
                    .frame(width: size * 0.15, height: size * 0.15)
            }
        }
        .frame(width: size, height: size)
    }
}
