"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Dumbbell, Plus, Clock, Flame, Calendar, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WorkoutSession {
  id: string;
  title: string;
  session_type: string | null;
  planned_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  intensity: string | null;
  notes: string | null;
}

interface Goal {
  id: string;
  title: string;
  current_progress: number;
  target_date: string | null;
  measurable_metric: string | null;
}


const intensityColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  hard: "bg-orange-100 text-orange-800",
  max: "bg-red-100 text-red-800",
};

const intensityLabels: Record<string, string> = {
  easy: "Lett",
  moderate: "Moderat",
  hard: "Hard",
  max: "Maks",
};

export default function TrainingPage() {
  const [plannedWorkouts, setPlannedWorkouts] = useState<WorkoutSession[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch planned workouts (not completed, planned in the future or today)
      const [plannedResult, completedResult, goalsResult] = await Promise.all([
        supabase
          .from("workout_sessions")
          .select("*")
          .is("completed_at", null)
          .not("planned_at", "is", null)
          .order("planned_at"),
        supabase
          .from("workout_sessions")
          .select("*")
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(20),
        // Get training goals - first find the trening area
        supabase
          .from("areas")
          .select("id")
          .eq("slug", "trening"),
      ]);

      if (plannedResult.error) {
        setError("Kunne ikke hente treningsøkter: " + plannedResult.error.message);
        setLoading(false);
        return;
      }

      if (completedResult.error) {
        setError("Kunne ikke hente treningslogg: " + completedResult.error.message);
        setLoading(false);
        return;
      }

      setPlannedWorkouts(plannedResult.data ?? []);
      setCompletedWorkouts(completedResult.data ?? []);

      // Fetch goals for the trening area if it exists
      if (!goalsResult.error && goalsResult.data && goalsResult.data.length > 0) {
        const areaId = goalsResult.data[0].id;
        const { data: goalsData } = await supabase
          .from("goals")
          .select("*")
          .eq("area_id", areaId)
          .eq("status", "active")
          .order("target_date");
        setGoals(goalsData ?? []);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  // Calculate week stats from completed workouts this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekCompleted = completedWorkouts.filter((w) => {
    if (!w.completed_at) return false;
    return new Date(w.completed_at) >= startOfWeek;
  });

  const weekSessions = thisWeekCompleted.length;
  const weekMinutes = thisWeekCompleted.reduce(
    (acc, w) => acc + (w.duration_minutes ?? 0),
    0
  );
  const weekPlanned = plannedWorkouts.filter((w) => {
    if (!w.planned_at) return false;
    const planned = new Date(w.planned_at);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return planned >= startOfWeek && planned < endOfWeek;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Trening
          </h1>
          <p className="text-muted-foreground">Planlegging, logging og fremgang</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Logg økt
        </Button>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekSessions}</div>
            <p className="text-sm text-muted-foreground">Økter denne uka</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekMinutes}</div>
            <p className="text-sm text-muted-foreground">Minutter trent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekPlanned}</div>
            <p className="text-sm text-muted-foreground">Planlagte økter</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Ukeplan</TabsTrigger>
          <TabsTrigger value="log">Treningslogg</TabsTrigger>
          <TabsTrigger value="goals">Treningsmål</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-2 mt-4">
          {plannedWorkouts.length === 0 ? (
            <p className="text-muted-foreground">Ingen planlagte treningsøkter.</p>
          ) : (
            plannedWorkouts.map((w) => (
              <Card key={w.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{w.title}</p>
                      {w.planned_at && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(w.planned_at).toLocaleDateString("nb-NO", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          })}
                          {" kl. "}
                          {new Date(w.planned_at).toLocaleTimeString("nb-NO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {w.duration_minutes && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {w.duration_minutes} min
                      </div>
                    )}
                    {w.intensity && (
                      <Badge className={intensityColors[w.intensity] ?? ""} variant="outline">
                        {intensityLabels[w.intensity] ?? w.intensity}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="log" className="space-y-2 mt-4">
          {completedWorkouts.length === 0 ? (
            <p className="text-muted-foreground">Ingen loggførte treningsøkter ennå.</p>
          ) : (
            completedWorkouts.map((w) => (
              <Card key={w.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{w.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {w.duration_minutes && (
                        <span className="text-sm text-muted-foreground">{w.duration_minutes} min</span>
                      )}
                      {w.intensity && (
                        <Badge className={intensityColors[w.intensity] ?? ""} variant="outline">
                          {intensityLabels[w.intensity] ?? w.intensity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {w.completed_at && new Date(w.completed_at).toLocaleDateString("nb-NO")}
                    {w.notes && ` — ${w.notes}`}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">Ingen treningsmål ennå.</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Treningsmål</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.title}</span>
                      <span>{goal.current_progress}%</span>
                    </div>
                    <Progress value={goal.current_progress} className="h-2" />
                    {goal.measurable_metric && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {goal.measurable_metric}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <LogWorkoutDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(workout) => {
          setCompletedWorkouts((prev) => [workout, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function LogWorkoutDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (workout: WorkoutSession) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tittel er påkrevd");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          duration_minutes: duration ? parseInt(duration) : null,
          intensity,
          notes: notes.trim() || null,
          completed_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kunne ikke logge trening");
      }

      const data = await res.json();
      onCreated(data);
      setTitle("");
      setDuration("");
      setIntensity("moderate");
      setNotes("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Logg treningsøkt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-title">Tittel</Label>
            <Input
              id="workout-title"
              placeholder="F.eks. Styrke overkropp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout-duration">Varighet (min)</Label>
              <Input
                id="workout-duration"
                type="number"
                min="1"
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Intensitet</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Lett</SelectItem>
                  <SelectItem value="moderate">Moderat</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="max">Maks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workout-notes">Notater (valgfritt)</Label>
            <Textarea
              id="workout-notes"
              placeholder="Hvordan gikk økten..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Logg økt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
