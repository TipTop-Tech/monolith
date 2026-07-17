import ActivityKit
import Foundation

struct WorkoutActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var exerciseName: String
        var isResting: Bool
        var restEndDate: Date
        var restTotalSec: Double
        var status: String
    }
}
