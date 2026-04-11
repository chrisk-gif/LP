"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FolderKanban, Plus, Loader2 } from "lucide-react";

interface Area {
  id: string;
  name: string;
  color: string | null;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  due_date: string | null;
  area_id: string;
  areas: Area;
}

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  backlog: "Backlog",
  completed: "Fullført",
  archived: "Arkivert",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Kunne ikke hente prosjekter");
        const data = await res.json();
        setProjects(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke hente prosjekter");
      } finally {
        setLoading(false);
      }
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
            <FolderKanban className="h-6 w-6" />
            Prosjekter
          </h1>
          <p className="text-muted-foreground">
            Dine prosjekter og initiativer
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nytt prosjekt
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Aktive</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="completed">Fullførte</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {projects.filter((p) => p.status === "active").length === 0 ? (
            <p className="text-muted-foreground">Ingen aktive prosjekter.</p>
          ) : (
            projects
              .filter((p) => p.status === "active")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onClick={setViewProject} />
              ))
          )}
        </TabsContent>

        <TabsContent value="backlog" className="space-y-4 mt-4">
          {projects.filter((p) => p.status === "backlog").length === 0 ? (
            <p className="text-muted-foreground">Ingen prosjekter i backlog.</p>
          ) : (
            projects
              .filter((p) => p.status === "backlog")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onClick={setViewProject} />
              ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {projects.filter((p) => p.status === "completed").length === 0 ? (
            <p className="text-muted-foreground">Ingen fullførte prosjekter ennå.</p>
          ) : (
            projects
              .filter((p) => p.status === "completed")
              .map((project) => (
                <ProjectCard key={project.id} project={project} onClick={setViewProject} />
              ))
          )}
        </TabsContent>
      </Tabs>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(project) => {
          setProjects((prev) => [project, ...prev]);
          setCreateOpen(false);
        }}
      />

      <ProjectDetailDialog project={viewProject} onClose={() => setViewProject(null)} />

      <Suspense fallback={null}>
        <ProjectDeepLinker projects={projects} onOpenProject={setViewProject} />
      </Suspense>
    </div>
  );
}

// ==========================================================================
// Create project dialog
// ==========================================================================

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("active");
  const [dueDate, setDueDate] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaId, setAreaId] = useState("");

  useEffect(() => {
    if (!open) return;
    async function loadAreas() {
      try {
        const res = await fetch("/api/areas");
        if (res.ok) {
          const data = await res.json();
          setAreas(data);
          if (data.length > 0 && !areaId) {
            const privat = data.find((a: Area) => a.slug === "privat");
            setAreaId(privat?.id ?? data[0].id);
          }
        }
      } catch {
        // areas remain empty
      }
    }
    loadAreas();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tittel er påkrevd");
      return;
    }
    if (!areaId) {
      setFormError("Velg et område");
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
          status,
          priority,
          due_date: dueDate || null,
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
      setPriority("medium");
      setStatus("active");
      setDueDate("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kunne ikke opprette prosjekt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nytt prosjekt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-title">Tittel</Label>
            <Input
              id="project-title"
              placeholder="F.eks. Redesign av nettside"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="project-desc"
              placeholder="Beskriv prosjektet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Område <span className="text-destructive">*</span></Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg område..." />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioritet</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Kritisk</SelectItem>
                  <SelectItem value="high">Høy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Lav</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-due">Frist (valgfritt)</Label>
              <Input
                id="project-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
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

// ==========================================================================
// Project card
// ==========================================================================

function ProjectCard({ project, onClick }: { project: Project; onClick?: (p: Project) => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick?.(project)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${priorityColors[project.priority] ?? "bg-gray-400"}`}
            />
            <CardTitle className="text-lg">
              {project.title}
            </CardTitle>
          </div>
          <Badge variant="outline">
            {statusLabels[project.status] ?? project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-4 mb-2">
          {project.areas && (
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.areas.color ?? "#6b7280" }}
              />
              <span className="text-sm">{project.areas.name}</span>
            </div>
          )}
          {project.due_date && (
            <span className="text-sm text-muted-foreground">
              Frist:{" "}
              {new Date(project.due_date).toLocaleDateString("nb-NO")}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Fremgang</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================================================
// Deep-link handler: ?projectId=<uuid> opens project detail
// ==========================================================================

function ProjectDeepLinker({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject: (project: Project) => void;
}) {
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId || handled) return;

    const found = projects.find((p) => p.id === projectId);
    if (found) {
      onOpenProject(found);
      setHandled(true);
    }
  }, [searchParams, projects, onOpenProject, handled]);

  return null;
}

// ==========================================================================
// Project detail dialog
// ==========================================================================

function ProjectDetailDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">
              {statusLabels[project.status] ?? project.status}
            </Badge>
            <span className="text-muted-foreground capitalize">
              Prioritet: {project.priority}
            </span>
          </div>
          {project.areas && (
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.areas.color ?? "#6b7280" }}
              />
              <span className="text-sm">{project.areas.name}</span>
            </div>
          )}
          {project.due_date && (
            <p className="text-sm text-muted-foreground">
              Frist: {new Date(project.due_date).toLocaleDateString("nb-NO")}
            </p>
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Fremgang</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
