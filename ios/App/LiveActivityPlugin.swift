import Foundation
import Capacitor
import ActivityKit

@objc(LiveActivityPlugin)
public class LiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiveActivityPlugin"
    public let jsName = "LiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    private var activityId: String?

    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { call.resolve(); return }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.reject("Live Activities are not enabled")
            return
        }
        let state = LiveActivityPlugin.contentState(from: call)
        do {
            let activity = try Activity.request(
                attributes: WorkoutActivityAttributes(),
                content: ActivityContent(state: state, staleDate: nil),
                pushType: nil
            )
            activityId = activity.id
            call.resolve()
        } catch {
            call.reject("Failed to start Live Activity: \(error.localizedDescription)")
        }
    }

    @objc func update(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { call.resolve(); return }
        let state = LiveActivityPlugin.contentState(from: call)
        let id = activityId
        Task {
            for activity in Activity<WorkoutActivityAttributes>.activities where activity.id == id {
                await activity.update(ActivityContent(state: state, staleDate: nil))
            }
            call.resolve()
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { call.resolve(); return }
        Task {
            for activity in Activity<WorkoutActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            activityId = nil
            call.resolve()
        }
    }

    @available(iOS 16.2, *)
    private static func contentState(from call: CAPPluginCall) -> WorkoutActivityAttributes.ContentState {
        let endMs = call.getDouble("restEndEpochMs") ?? 0
        return WorkoutActivityAttributes.ContentState(
            exerciseName: call.getString("exerciseName") ?? "Workout",
            isResting: call.getBool("isResting") ?? false,
            restEndDate: Date(timeIntervalSince1970: endMs / 1000.0),
            restTotalSec: call.getDouble("restTotalSec") ?? 0,
            status: call.getString("status") ?? ""
        )
    }
}
