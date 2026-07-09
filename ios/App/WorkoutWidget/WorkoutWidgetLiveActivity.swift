import ActivityKit
import WidgetKit
import SwiftUI

struct RestRing: View {
    let endDate: Date
    var size: CGFloat = 50

    var body: some View {
        ProgressView(timerInterval: Date()...endDate, countsDown: true) {
            EmptyView()
        } currentValueLabel: {
            EmptyView()
        }
        .progressViewStyle(.circular)
        .tint(.primary)
        .frame(width: size, height: size)
        .overlay {
            Text(timerInterval: Date()...endDate, countsDown: true)
                .monospacedDigit()
                .font(.system(size: size * 0.28, weight: .semibold, design: .rounded))
                .minimumScaleFactor(0.5)
                .multilineTextAlignment(.center)
        }
    }
}

struct WorkoutLockScreenView: View {
    let state: WorkoutActivityAttributes.ContentState

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "dumbbell.fill")
                .font(.title3)
                .frame(width: 40, height: 40)
                .background(.primary.opacity(0.1), in: Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(state.exerciseName)
                    .font(.headline)
                    .lineLimit(1)
                Text(state.status)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if state.isResting {
                RestRing(endDate: state.restEndDate, size: 52)
            } else if state.status == "Rest done" {
                Image(systemName: "checkmark.circle.fill")
                    .font(.title)
            } else {
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

struct WorkoutLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WorkoutActivityAttributes.self) { context in
            WorkoutLockScreenView(state: context.state)
                .activityBackgroundTint(Color.black.opacity(0.45))
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label(context.state.exerciseName, systemImage: "dumbbell.fill")
                        .font(.caption)
                        .lineLimit(1)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if context.state.isResting {
                        RestRing(endDate: context.state.restEndDate, size: 44)
                    } else if context.state.status == "Rest done" {
                        Image(systemName: "checkmark.circle.fill").font(.title3)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.status)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            } compactLeading: {
                Image(systemName: "dumbbell.fill")
            } compactTrailing: {
                if context.state.isResting {
                    Text(timerInterval: Date()...context.state.restEndDate, countsDown: true)
                        .monospacedDigit()
                        .frame(width: 44)
                } else if context.state.status == "Rest done" {
                    Image(systemName: "checkmark.circle.fill")
                }
            } minimal: {
                Image(systemName: "dumbbell.fill")
            }
        }
    }
}
