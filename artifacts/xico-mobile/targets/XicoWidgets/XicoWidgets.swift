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
        DespachoSmallWidget()
        // Tasks 6.3 widgets: DespachoMediumWidget(), DespachoLargeWidget(),
        //   LockInlineWidget(), LockCircularWidget(), LockRectangularWidget(),
        //   StandByWidget()
        // Phase 7: RutaActivityWidget() (Live Activity)
    }
}
