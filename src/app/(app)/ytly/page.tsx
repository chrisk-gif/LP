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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Rocket, Plus, TrendingUp, Loader2, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  due_date: string | null;
}

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
  description: string | null;
  horizon: string;
  status: string;
  current_progress: number;
  target_date: string | null;
  why_it_matters: string | null;
}

export default function YtlyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [areaId, setAreaId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: areas, error: areaError } = await supabase
        .from("areas")
        .select("id, slug")
        .eq("slug", "ytly");

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
      setAreaId(areaId);

      const [projectsResult, tasksResult, goalsResult] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("area_id", areaId)
          .order("updated_at", { ascending: false }),
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
      ]);

      if (projectsResult.error) {
        setError("Kunne ikke hente prosjekter: " + projectsResult.error.message);
        setLoading(false);
        return;
      }
      if (tasksResult.error) {
        setError("Kunne ikke hente oppgaver: " + tasksResult.error.message);
        setLoading(false);
        return;
      }
      if (goalsResult.error) {
        setError("Kunne ikke hente mål: " + goalsResult.error.message);
        setLoading(false);
        return;
      }

      setProjects(projectsResult.data ?? []);
      setTasks(tasksResult.data ?? []);
      setGoals(goalsResult.data ?? []);
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

  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            ytly.no
          </h1>
          <p className="text-muted-foreground">
            Strategi, initiativer og gjennomføring
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nytt initiativ
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="projects">Prosjekter</TabsTrigger>
          <TabsTrigger value="tasks">Oppgaver</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aktive prosjekter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ingen aktive prosjekter.</p>
                ) : (
                  activeProjects.map((project) => (
                    <div key={project.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {project.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                      {project.description && (
                        <p className="text-xs text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Strategiske mål
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ingen aktive mål.</p>
                ) : (
                  <ul className="space-y-2">
                    {goals.map((goal, i) => (
                      <li
                        key={goal.id}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-muted-foreground mt-0.5">
                          {i + 1}.
                        </span>
                        <div>
                          <span>{goal.title}</span>
                          {goal.current_progress > 0 && (
                            <span className="text-muted-foreground ml-2">
                              ({goal.current_progress}%)
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-4">
          {projects.length === 0 ? (
            <p className="text-muted-foreground">Ingen prosjekter ennå.</p>
          ) : (
            projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge
                      variant={
                        project.status === "active" ? "default" : "outline"
                      }
                    >
                      {project.status === "active"
                        ? "Aktiv"
                        : project.status === "backlog"
                          ? "Backlog"
                          : project.status === "completed"
                            ? "Fullført"
                            : "Arkivert"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={project.progress} className="h-2" />
                    {project.description && (
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    {project.due_date && (
                      <p className="text-sm text-muted-foreground">
                        Frist: {new Date(project.due_date).toLocaleDateString("nb-NO")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-2 mt-4">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">Ingen oppgaver ennå.</p>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.priority === "high" || task.priority === "critical"
                          ? "bg-orange-500"
                          : task.priority === "medium"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <span>{task.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString("nb-NO")
                      : "Ingen frist"}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">Ingen mål ennå.</p>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge variant="outline">{goal.horizon}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fremgang</span>
                      <span>{goal.current_progress}%</span>
                    </div>
                    <Progress value={goal.current_progress} className="h-2" />
                    {goal.why_it_matters && (
                      <p className="text-sm text-muted-foreground italic">
                        Hvorfor: {goal.why_it_matters}
                      </p>
                    )}
                    {goal.target_date && (
                      <p className="text-sm text-muted-foreground">
                        Mål: {new Date(goal.target_date).toLocaleDateString("nb-NO")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        areaId={areaId}
        onCreated={(project) => {
          setProjects((prev) => [project, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  areaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId: string | null;
  onCreated: (project: Project) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tittel er påkrevd");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          area_id: areaId,
          status: "active",
          priority: "medium",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kunne ikke opprette prosjekt");
      }

      const data = await res.json();
      onCreated(data);
      setTitle("");
      setDescription("");
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
          <DialogTitle>Nytt initiativ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">Tittel</Label>
            <Input
              id="project-title"
              placeholder="F.eks. Ny landingsside"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="project-desc"
              placeholder="Beskriv initiativet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Opprett
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
