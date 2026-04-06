"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  status: string;
}

interface Goal {
  id: string;
  title: string;
  current_progress: number;
  target_date: string | null;
}

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
}

export default function PrivatePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: areas, error: areaError } = await supabase
        .from("areas")
        .select("id, slug")
        .eq("slug", "privat");

      if (areaError) {
        setError("Kunne ikke hente område: " + areaError.message);
        setLoading(false);
        return;
      }

      if (!areas || areas.length === 0) {
        setLoading(false);
        return;
      }

      const areaId = areas[0].id;

      const [tasksResult, goalsResult, eventsResult, notesResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("area_id", areaId)
          .in("status", ["inbox", "todo", "in_progress", "waiting"])
          .order("due_date"),
        supabase
          .from("goals")
          .select("*")
          .eq("area_id", areaId)
          .eq("status", "active")
          .order("target_date"),
        supabase
          .from("events")
          .select("*")
          .eq("area_id", areaId)
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(20),
        supabase
          .from("notes")
          .select("*")
          .eq("area_id", areaId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (tasksResult.error) {
        setError("Kunne ikke hente oppgaver: " + tasksResult.error.message);
        setLoading(false);
        return;
      }

      setTasks(tasksResult.data ?? []);
      setGoals(goalsResult.data ?? []);
      setEvents(eventsResult.data ?? []);
      setNotes(notesResult.data ?? []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6" />
            Privat
          </h1>
          <p className="text-muted-foreground">Personlige oppgaver, mål og hendelser</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Legg til
        </Button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Oppgaver</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="events">Hendelser</TabsTrigger>
          <TabsTrigger value="notes">Notater</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-2 mt-4">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">Ingen oppgaver ennå.</p>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <span>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === "high" || task.priority === "critical" ? "destructive" : "outline"}>
                      {task.priority === "high" || task.priority === "critical"
                        ? "Høy"
                        : task.priority === "medium"
                          ? "Medium"
                          : "Lav"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("nb-NO")
                        : "Ingen frist"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">Ingen aktive mål.</p>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">{goal.current_progress}%</span>
                  </div>
                  <Progress value={goal.current_progress} className="h-2" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-2 mt-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground">Ingen kommende hendelser.</p>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString("nb-NO")}
                      {!event.all_day &&
                        ` kl. ${new Date(event.start_time).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-2 mt-4">
          {notes.length === 0 ? (
            <p className="text-muted-foreground">Ingen notater ennå. Opprett et notat for å komme i gang.</p>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="py-3">
                  <p className="font-medium">{note.title}</p>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {note.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.created_at).toLocaleDateString("nb-NO")}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
