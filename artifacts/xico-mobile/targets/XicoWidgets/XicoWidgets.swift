//
//  XicoWidgets.swift
//  XicoWidgets
//
//  Widget bundle entry · contains all widgets + (Phase 7) Live Activities.
//  Per ADR-007 · single iOS extension target for both widget and Live Activity work.
//

import WidgetKit
import SwiftUI

@main
struct XicoWidgetsBundle: WidgetBundle {
    var body: some Widget {
        // Home Screen · cream surface · editorial moments (DespachoSmallProvider)
        DespachoSmallWidget()
        DespachoMediumWidget()
        DespachoLargeWidget()
        // Lock Screen · system tint · accessory families
        LockInlineWidget()            // DespachoSmallProvider · the day's word
        LockCircularWidget()          // RutaProgressProvider · sellos gauge
        LockRectangularWidget()       // RutaProgressProvider · sellos + next stop
        // StandBy · landscape full Despacho · day + night variants
        StandByWidget()
        // Phase 7: RutaActivityWidget() (Live Activity · same target per ADR-007)
    }
}
