import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

import { useQuery, usePowerSync } from '@powersync/react';
import { useWorkout } from "../../context/WorkoutContext";
import { useAuth } from "../../context/AuthContext";
import { haptics } from "../../lib/haptics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { SwipeableRow } from "../ui/SwipeableRow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { playHistorySound } from "../../../utils/audio";

export function WorkoutHistory() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { exercises } = useWorkout();
  const { user } = useAuth();
  const db = usePowerSync();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<{ id: string } | null>(null);

  useEffect(() => {
    playHistorySound();
  }, []);

  const { data: exerciseHistoryRecords } = useQuery(
    'SELECT * FROM workoutHistory WHERE exerciseId = ? AND user_id = ? ORDER BY date ASC',
    [exerciseId, user?.id ?? null]
  );

  /**
   * Deleets the set from the history at the given id.
   * @param id The id of the set to delete.
   */
  const handleDeleteRequest = (id: string) => {
    setSetToDelete({ id });
    setIsDeleteDialogOpen(true);
  };
  /**
   * Confirms the deletion of a set from the history.
   */
  const confirmDelete = async () => {
    if (setToDelete !== null) {
      haptics.warn();
      await db.execute('DELETE FROM workoutHistory WHERE id = ?', [setToDelete.id]);
    }
    setIsDeleteDialogOpen(false);
    setSetToDelete(null);
  };

  const exercise = exercises.find((e) => e.id === exerciseId);

  if (!exercise) {
    return (
      <div className="h-full overflow-auto p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 mb-12 px-4 py-2 black-glass-button w-fit"
        >
          <ArrowLeft size={20} className="black-glass-text" />
          <span className="label-font black-glass-text">BACK</span>
        </button>

        <div className="flex items-center justify-center p-6">
          <div className="label-font text-muted-foreground">NO HISTORY FOUND</div>
        </div>
      </div>
    );
  }

  const hasHistory = !!exerciseHistoryRecords && exerciseHistoryRecords.length > 0;

  const chartData = hasHistory
    ? exerciseHistoryRecords
      .map((set, index) => ({
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
        className="flex items-center gap-3 mb-12 px-4 py-2 black-glass-button w-fit"
      >
        <ArrowLeft size={20} className="black-glass-text" />
        <span className="label-font black-glass-text">BACK</span>
      </button>

      <div className="display-font text-5xl bevel-text-large mb-2">{exercise.name}</div>
      <div className="label-font text-muted-foreground mb-16">
        {exercise.muscleGroups.join(" · ")}
      </div>

      <div className="mb-16">
        <div className="label-font text-muted-foreground mb-6">WEIGHT PROGRESS</div>
        {hasHistory ? (
          <div className="overflow-x-auto hide-scrollbar w-full">
            <div style={{ minWidth: `${Math.max(100, chartData.length * 60)}px`, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#6b6b6b"
                    tick={{ fill: "#6b6b6b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] bg-secondary bevel-element">
            <span className="label-font text-muted-foreground text-sm">No Data Found</span>
          </div>
        )}
      </div>

      <div>
        <div className="label-font text-muted-foreground mb-6">ALL SETS</div>
        {hasHistory && exerciseHistoryRecords ? (
          <div className="space-y-4">
            {/**
             * Loops through the sets in the history and displays them in a swipeable row.
             */}
            {exerciseHistoryRecords.slice().reverse().map((set) => {
              return (
                <SwipeableRow
                  key={set.id}
                  onRemove={() => handleDeleteRequest(set.id)}
                  className="flex items-center justify-between py-4 px-6 black-glass-button"
                >
                  <div className="label-font black-glass-text opacity-80">
                    {new Date(set.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="display-font text-2xl black-glass-text">
                    {set.reps} × {set.weight}
                  </div>
                </SwipeableRow>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 bg-secondary bevel-element">
            <span className="label-font text-muted-foreground text-sm">No Data Found</span>
          </div>
        )}
      </div>

      {/**
       * Opens a dialog when the user tries to delete a set from the history.
       */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this set from your history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="black-glass-button">
              <span className="black-glass-text">Cancel</span>
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="black-glass-button-destructive">
              <span className="black-glass-text">Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}