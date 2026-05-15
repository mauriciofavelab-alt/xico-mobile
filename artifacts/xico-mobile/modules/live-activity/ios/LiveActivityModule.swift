//
//  LiveActivityModule.swift
//  xico-live-activity (local Expo Module)
//
//  JS bridge for the active-Ruta Live Activity. Exposes start / update / end
//  and a `areActivitiesEnabled` capability check. Phase 7.2 (2026-05-15 Liquid
//  Glass redesign · plan Task 7.2).
//
//  ⚠️ MUST STAY IN SYNC ⚠️
//  `RutaActivityAttributes` and its `ContentState` below MUST match the
//  definition in `targets/XicoWidgets/RutaActivity.swift` byte-for-byte
//  (field names, order, types). The widget extension and the main app
//  cannot share a framework target without significantly more native
//  scaffolding (v1.2 follow-up), so we duplicate the struct. The activity
//  is encoded by Codable on the main-app side and decoded by Codable in
//  the widget — any drift breaks the bridge silently at runtime.
//  If you edit one, edit BOTH and grep the sibling file before committing.
//

import ActivityKit
import ExpoModulesCore
import Foundation

// MARK: - Activity attributes (mirror of targets/XicoWidgets/RutaActivity.swift)

struct RutaActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var stopsCompleted: Int
        var stopsTotal: Int
        var nextStopName: String
        var nextStopDistanceM: Int
        var nextStopRumboHex: String
        var rosetonState: [Int]
    }

    var weekKey: String
    var editorName: String
}

// MARK: - Typed Records (Expo Modules Field-based bridging)

/// Strongly typed shape for `params.attributes` from JS.
struct AttributesRecord: Record {
    @Field var weekKey: String = ""
    @Field var editorName: String = ""
}

/// Strongly typed shape for `params.contentState` from JS.
/// All fields optional so `updateActivity` can accept a partial state ·
/// `startActivity` validates required fields itself.
struct ContentStateRecord: Record {
    @Field var stopsCompleted: Int?
    @Field var stopsTotal: Int?
    @Field var nextStopName: String?
    @Field var nextStopDistanceM: Int?
    @Field var nextStopRumboHex: String?
    @Field var rosetonState: [Int]?
}

struct StartParams: Record {
    @Field var attributes: AttributesRecord = AttributesRecord()
    @Field var contentState: ContentStateRecord = ContentStateRecord()
}

struct UpdateParams: Record {
    @Field var id: String = ""
    @Field var contentState: ContentStateRecord = ContentStateRecord()
}

// MARK: - Module

public class LiveActivityModule: Module {
    public func definition() -> ModuleDefinition {
        Name("LiveActivity")

        // Returns whether the user has Live Activities enabled in Settings.
        // Pre-iOS 16.1 returns false (we can't compile the call · gate the
        // import). The main-app deployment target is iOS 17 (app.json
        // expo-build-properties), so the gate is belt-and-suspenders.
        AsyncFunction("areActivitiesEnabled") { () -> Bool in
            if #available(iOS 16.1, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            } else {
                return false
            }
        }

        // Start a new Live Activity. Returns the activity's id (UUID string).
        // The caller (JS) is expected to persist this id so it can later
        // address updates and the end-of-Ruta dismissal.
        AsyncFunction("startActivity") { (params: StartParams) -> String in
            if #available(iOS 16.1, *) {
                // Validate required fields. Records default missing values to
                // their zero · for `stopsTotal` that's a misuse signal.
                guard
                    let stopsCompleted = params.contentState.stopsCompleted,
                    let stopsTotal = params.contentState.stopsTotal, stopsTotal > 0,
                    let nextStopName = params.contentState.nextStopName,
                    let nextStopDistanceM = params.contentState.nextStopDistanceM,
                    let nextStopRumboHex = params.contentState.nextStopRumboHex,
                    let rosetonState = params.contentState.rosetonState
                else {
                    throw Exception(
                        name: "InvalidContentState",
                        description: "startActivity requires stopsCompleted, stopsTotal>0, nextStopName, nextStopDistanceM, nextStopRumboHex, rosetonState"
                    )
                }

                let attributes = RutaActivityAttributes(
                    weekKey: params.attributes.weekKey,
                    editorName: params.attributes.editorName
                )
                let state = RutaActivityAttributes.ContentState(
                    stopsCompleted: stopsCompleted,
                    stopsTotal: stopsTotal,
                    nextStopName: nextStopName,
                    nextStopDistanceM: nextStopDistanceM,
                    nextStopRumboHex: nextStopRumboHex,
                    rosetonState: rosetonState
                )

                do {
                    if #available(iOS 16.2, *) {
                        let activity = try Activity<RutaActivityAttributes>.request(
                            attributes: attributes,
                            content: .init(state: state, staleDate: nil),
                            pushType: nil
                        )
                        return activity.id
                    } else {
                        // iOS 16.1 used the legacy contentState API.
                        let activity = try Activity<RutaActivityAttributes>.request(
                            attributes: attributes,
                            contentState: state,
                            pushType: nil
                        )
                        return activity.id
                    }
                } catch {
                    throw Exception(
                        name: "ActivityRequestFailed",
                        description: "Activity<RutaActivityAttributes>.request failed: \(error.localizedDescription)"
                    )
                }
            } else {
                throw Exception(
                    name: "UnsupportedOSVersion",
                    description: "Live Activities require iOS 16.1+"
                )
            }
        }

        // Update an existing Live Activity by id. Partial state allowed ·
        // missing fields inherit from the activity's current contentState.
        AsyncFunction("updateActivity") { (params: UpdateParams) -> Void in
            if #available(iOS 16.1, *) {
                let activities = Activity<RutaActivityAttributes>.activities
                guard let activity = activities.first(where: { $0.id == params.id }) else {
                    throw Exception(
                        name: "ActivityNotFound",
                        description: "No Live Activity with id \(params.id)"
                    )
                }

                // Merge partial state · the contentState getter differs across
                // iOS versions (16.2 introduced `.content.state`). Read whichever
                // is available and patch the supplied fields.
                let current: RutaActivityAttributes.ContentState
                if #available(iOS 16.2, *) {
                    current = activity.content.state
                } else {
                    current = activity.contentState
                }

                let merged = RutaActivityAttributes.ContentState(
                    stopsCompleted: params.contentState.stopsCompleted ?? current.stopsCompleted,
                    stopsTotal: params.contentState.stopsTotal ?? current.stopsTotal,
                    nextStopName: params.contentState.nextStopName ?? current.nextStopName,
                    nextStopDistanceM: params.contentState.nextStopDistanceM ?? current.nextStopDistanceM,
                    nextStopRumboHex: params.contentState.nextStopRumboHex ?? current.nextStopRumboHex,
                    rosetonState: params.contentState.rosetonState ?? current.rosetonState
                )

                if #available(iOS 16.2, *) {
                    await activity.update(.init(state: merged, staleDate: nil))
                } else {
                    await activity.update(using: merged)
                }
            } else {
                throw Exception(
                    name: "UnsupportedOSVersion",
                    description: "Live Activities require iOS 16.1+"
                )
            }
        }

        // End an existing Live Activity by id with immediate dismissal.
        // Used both for "Ruta complete" success and best-effort teardown
        // when the JS state drifts (e.g. user reinstalls).
        AsyncFunction("endActivity") { (id: String) -> Void in
            if #available(iOS 16.1, *) {
                let activities = Activity<RutaActivityAttributes>.activities
                guard let activity = activities.first(where: { $0.id == id }) else {
                    // Already gone · not an error. Idempotent end.
                    return
                }
                if #available(iOS 16.2, *) {
                    await activity.end(nil, dismissalPolicy: .immediate)
                } else {
                    await activity.end(dismissalPolicy: .immediate)
                }
            } else {
                // No-op on pre-iOS 16.1 · nothing could have been started.
                return
            }
        }
    }
}
