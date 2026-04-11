"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderKanban, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*, areas(id, name, color, slug)")
        .order("updated_at", { ascending: false });

      if (fetchError) {
        setError("Kunne ikke hente prosjekter: " + fetchError.message);
        setLoading(false);
        return;
      }

      setProjects((data as unknown as Project[]) ?? []);
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
            <FolderKanban className="h-6 w-6" />
            Prosjekter
          </h1>
          <p className="text-muted-foreground">
            Dine prosjekter og initiativer
          </p>
        </div>
        <Button>
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
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {project.description ?? "Ingen beskrivelse"}
                    </p>
                    {project.areas && (
                      <div className="flex items-center gap-1 mt-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.areas.color ?? "#6b7280" }}
                        />
                        <span className="text-sm text-muted-foreground">{project.areas.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
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

      {/* Project detail dialog */}
      <ProjectDetailDialog project={viewProject} onClose={() => setViewProject(null)} />

      {/* Deep-link: ?projectId=<uuid> opens project detail */}
      <Suspense fallback={null}>
        <ProjectDeepLinker projects={projects} onOpenProject={setViewProject} />
      </Suspense>
    </div>
  );
}

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
