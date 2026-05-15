//
//  RutaActivityView.swift
//  XicoWidgets
//
//  Live Activity surface for the active Ruta · Dynamic Island
//  (compact / expanded / minimal) + Lock Screen banner.
//
//  Spec §6 · Plan Task 7.1 (2026-05-15 Liquid Glass redesign).
//  Per ADR-007 · this widget lives in the XicoWidgets bundle alongside
//  the seven WidgetKit entries · ActivityKit + WidgetKit share one extension.
//
//  Premium not pretentious. Three states share one editorial vocabulary:
//    · the mini rosetón at the leading edge · current sellos at a glance
//    · the count "N / total" in the rumbo color of the NEXT stop
//    · italic Newsreader for the próxima line
//    · NO icons, NO emoji, NO theatrical animations · the rosetón petal fill
//      transitions are handled by the system when state updates land.
//
//  Saturation discipline (brandbook §6): the rumbo color of the next stop
//  is the ONE saturated hit. Chrome stays warm-bone-on-warm-dark.
//
// TODO · Font bundling carries over from widgets (see expo-target.config.js
// at the top of this target). Custom font calls (.custom("Fraunces", ...))
// currently fall back to system because .ttf files aren't yet copied into
// the extension bundle. Layout renders correctly · text just lacks the
// editorial Fraunces/Newsreader feel until Build #12 prep.
//

import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Editorial color constants

private enum LiveActivityChrome {
    /// Warm-dark background · matches app Colors.background.
    static let background = Color(hex: "#080508")
    /// Cream bone · matches app Colors.textPrimary.
    static let cream = Color(hex: "#EDE6D8")
    /// Soft cream for the kicker line.
    static let creamDim = Color(hex: "#C9C3B8")
    /// Tertiary metadata · for the distance line.
    static let creamTertiary = Color(hex: "#8C887F")
}

// MARK: - Widget

struct RutaActivityView: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RutaActivityAttributes.self) { context in
            // Lock Screen / banner UI · cream-on-warm-dark editorial card
            LockScreenBanner(
                attributes: context.attributes,
                state: context.state
            )
        } dynamicIsland: { context in
            DynamicIsland {
                // EXPANDED · long-press the Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 6) {
                        RosetonMiniView(
                            state: context.state.rosetonState,
                            size: 32
                        )
                        Text(weekLabel(context.attributes.weekKey))
                            .font(.system(size: 9, weight: .semibold))
                            .tracking(1.4)
                            .foregroundColor(LiveActivityChrome.creamTertiary)
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.stopsCompleted)/\(context.state.stopsTotal)")
                        .font(.custom("Fraunces", size: 22))
                        .fontWeight(.semibold)
                        .foregroundColor(Color(hex: context.state.nextStopRumboHex))
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.center) {
                    // Optional editorial byline · only show if non-empty
                    if !context.attributes.editorName.isEmpty {
                        Text("— de \(context.attributes.editorName)")
                            .font(.custom("Newsreader-Italic", size: 11))
                            .italic()
                            .foregroundColor(LiveActivityChrome.creamTertiary)
                            .lineLimit(1)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 8) {
                        Text("Próxima: ")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(LiveActivityChrome.creamDim)
                        + Text(context.state.nextStopName)
                            .font(.custom("Newsreader-Italic", size: 14))
                            .italic()
                            .foregroundColor(LiveActivityChrome.cream)
                        Spacer(minLength: 8)
                        Text("\(context.state.nextStopDistanceM)m")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(LiveActivityChrome.creamTertiary)
                    }
                    .lineLimit(1)
                    .padding(.horizontal, 4)
                }
            } compactLeading: {
                // COMPACT · always visible while activity is live
                RosetonMiniView(
                    state: context.state.rosetonState,
                    size: 18
                )
            } compactTrailing: {
                Text("\(context.state.stopsCompleted)/\(context.state.stopsTotal)")
                    .font(.custom("Fraunces", size: 14))
                    .fontWeight(.semibold)
                    .foregroundColor(Color(hex: context.state.nextStopRumboHex))
            } minimal: {
                // MINIMAL · DI shared with another activity · single glyph slot
                RosetonMiniView(
                    state: context.state.rosetonState,
                    size: 18
                )
            }
            .keylineTint(Color(hex: context.state.nextStopRumboHex))
        }
    }
}

// MARK: - Lock Screen banner

private struct LockScreenBanner: View {
    let attributes: RutaActivityAttributes
    let state: RutaActivityAttributes.ContentState

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Editorial kicker
            Text("XICO · LA RUTA · \(weekLabel(attributes.weekKey))")
                .font(.system(size: 10, weight: .semibold))
                .tracking(1.5)
                .foregroundColor(LiveActivityChrome.creamTertiary)

            HStack(alignment: .center, spacing: 16) {
                RosetonMiniView(
                    state: state.rosetonState,
                    size: 36
                )

                VStack(alignment: .leading, spacing: 4) {
                    // Count · rumbo-tinted numerals · the one saturated hit
                    Text("\(state.stopsCompleted) / \(state.stopsTotal)")
                        .font(.custom("Fraunces", size: 26))
                        .fontWeight(.semibold)
                        .foregroundColor(Color(hex: state.nextStopRumboHex))

                    // Próxima · italic Newsreader · editorial intimacy
                    HStack(spacing: 6) {
                        Text("próxima ·")
                            .font(.system(size: 11, weight: .medium))
                            .tracking(0.5)
                            .foregroundColor(LiveActivityChrome.creamTertiary)
                        Text(state.nextStopName)
                            .font(.custom("Newsreader-Italic", size: 14))
                            .italic()
                            .foregroundColor(LiveActivityChrome.cream)
                            .lineLimit(1)
                    }
                }

                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .containerBackground(for: .widget) {
            LiveActivityChrome.background
        }
    }
}

// MARK: - Helpers

/// Turns an ISO week key like "2026-W19" into the editorial label "SEMANA 19".
/// Falls back to the raw key uppercased if the format doesn't match.
private func weekLabel(_ weekKey: String) -> String {
    if let range = weekKey.range(of: "W") {
        let number = weekKey[range.upperBound...]
        if !number.isEmpty {
            return "SEMANA \(number)"
        }
    }
    return weekKey.uppercased()
}
