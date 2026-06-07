import { useParams, useNavigate } from "react-router";
import { useWorkout } from "../../context/WorkoutContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";

export function WorkoutHistory() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { exercises, history } = useWorkout();
  const navigate = useNavigate();

  const exercise = exercises.find((e) => e.id === exerciseId);
  const exerciseHistory = history.find((h) => h.exerciseId === exerciseId);

  if (!exercise) {
    return (
      <div className="h-full overflow-auto p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={20} />
          <span className="label-font">BACK</span>
        </button>

        <div className="flex items-center justify-center p-6">
          <div className="label-font text-muted-foreground">NO HISTORY FOUND</div>
        </div>
      </div>
    );
  }

  const hasHistory = !!exerciseHistory && exerciseHistory.sets.length > 0;

  const chartData = hasHistory
    ? exerciseHistory.sets
        .slice(-10)
        .map((set) => ({
          date: new Date(set.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          weight: set.weight,
          reps: set.reps,
        }))
    : [];

  return (
    <div className="h-full overflow-auto p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft size={20} />
        <span className="label-font">BACK</span>
      </button>

      <div className="display-font text-5xl bevel-text-large mb-2">{exercise.name}</div>
      <div className="label-font text-muted-foreground mb-16">
        {exercise.muscleGroups.join(" · ")}
      </div>

      <div className="mb-16">
        <div className="label-font text-muted-foreground mb-6">WEIGHT PROGRESS</div>
        {hasHistory ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" strokeOpacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#6b6b6b"
                tick={{ fill: "#6b6b6b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b6b6b"
                tick={{ fill: "#6b6b6b", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "none",
                  borderRadius: "0",
                  color: "#e8e8e8",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
                labelStyle={{ color: "#6b6b6b" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ fill: "#ffffff", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] bg-secondary bevel-element">
            <span className="label-font text-muted-foreground text-sm">No Data Found</span>
          </div>
        )}
      </div>

      <div>
        <div className="label-font text-muted-foreground mb-6">RECENT SETS</div>
        {hasHistory && exerciseHistory ? (
          <div className="space-y-4">
            {exerciseHistory.sets.slice(-5).reverse().map((set, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 px-6 bg-secondary bevel-element"
              >
                <div className="label-font text-muted-foreground">
                  {new Date(set.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="display-font text-2xl bevel-text">
                  {set.reps} × {set.weight}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 bg-secondary bevel-element">
            <span className="label-font text-muted-foreground text-sm">No Data Found</span>
          </div>
        )}
      </div>
    </div>
  );
}