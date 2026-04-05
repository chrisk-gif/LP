"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderKanban, Plus } from "lucide-react";

// Demo data
const projects = [
  {
    id: "1",
    title: "Byåsentunnelen - Tilbudsarbeid",
    area: { name: "Asplan Viak", color: "#2563eb" },
    status: "active",
    priority: "high",
    progress: 40,
    due_date: "2026-05-15",
    description: "Utarbeide komplett tilbud for Byåsentunnelen",
  },
  {
    id: "2",
    title: "ytly.no Nettside Redesign",
    area: { name: "ytly.no", color: "#7c3aed" },
    status: "active",
    priority: "medium",
    progress: 75,
    due_date: "2026-04-20",
    description: "Fullstendig redesign av ytly.no med nye tjenestesider",
  },
  {
    id: "3",
    title: "Siljan Kommune - Reguleringsplan",
    area: { name: "Asplan Viak", color: "#2563eb" },
    status: "active",
    priority: "medium",
    progress: 60,
    due_date: "2026-06-01",
    description: "Utarbeide reguleringsplan for sentrumsområdet",
  },
  {
    id: "4",
    title: "Personlig budsjettsystem",
    area: { name: "Økonomi", color: "#d97706" },
    status: "backlog",
    priority: "low",
    progress: 10,
    due_date: null,
    description: "Sette opp fast budsjett og sparemål",
  },
];

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
          {projects
            .filter((p) => p.status === "active")
            .map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${priorityColors[project.priority]}`}
                      />
                      <CardTitle className="text-lg">
                        {project.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.area.color }}
                      />
                      <span className="text-sm">{project.area.name}</span>
                    </div>
                    {project.due_date && (
                      <span className="text-sm text-muted-foreground">
                        Frist:{" "}
                        {new Date(project.due_date).toLocaleDateString(
                          "nb-NO"
                        )}
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
            ))}
        </TabsContent>

        <TabsContent value="backlog" className="space-y-4 mt-4">
          {projects
            .filter((p) => p.status === "backlog")
            .map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <p className="text-muted-foreground">Ingen fullførte prosjekter ennå.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
