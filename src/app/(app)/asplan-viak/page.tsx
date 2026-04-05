"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus,
} from "lucide-react";

// Demo data
const tenders = [
  {
    id: "1",
    title: "Byåsentunnelen - Detaljprosjektering",
    client: "Trondheim kommune",
    status: "preparing",
    due_date: "2026-04-18",
    probability: 60,
    risk_level: "medium",
    next_milestone: "Ferdigstille prismatrise",
  },
  {
    id: "2",
    title: "E6 Kvithammar-Åsen - Geoteknikk",
    client: "Nye Veier",
    status: "submitted",
    due_date: "2026-04-10",
    probability: 45,
    risk_level: "low",
    next_milestone: "Venter på tilbakemelding",
  },
  {
    id: "3",
    title: "Siljan sentrum - Reguleringsplan",
    client: "Siljan kommune",
    status: "identified",
    due_date: "2026-05-20",
    probability: 70,
    risk_level: "low",
    next_milestone: "Avklare scope med oppdragsgiver",
  },
  {
    id: "4",
    title: "Rogaland FK - Skolestruktur",
    client: "Rogaland fylkeskommune",
    status: "preparing",
    due_date: "2026-04-25",
    probability: 55,
    risk_level: "high",
    next_milestone: "Intern kvalitetssikring",
  },
];

const workTasks = [
  {
    id: "1",
    title: "Ferdigstille prismatrise for Byåsentunnelen",
    due_date: "2026-04-08",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "2",
    title: "Review av teknisk løsning E6-tilbud",
    due_date: "2026-04-07",
    priority: "high",
    status: "todo",
  },
  {
    id: "3",
    title: "Oppdatere CV for tilbud Siljan",
    due_date: "2026-04-15",
    priority: "medium",
    status: "todo",
  },
  {
    id: "4",
    title: "Avdelingsledermøte - forberede agenda",
    due_date: "2026-04-07",
    priority: "medium",
    status: "todo",
  },
  {
    id: "5",
    title: "Timeregistrering uke 14",
    due_date: "2026-04-06",
    priority: "low",
    status: "todo",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  identified: { label: "Identifisert", color: "bg-gray-500", icon: Clock },
  preparing: { label: "Under arbeid", color: "bg-blue-500", icon: TrendingUp },
  submitted: { label: "Innlevert", color: "bg-yellow-500", icon: CheckCircle },
  won: { label: "Vunnet", color: "bg-green-500", icon: CheckCircle },
  lost: { label: "Tapt", color: "bg-red-500", icon: XCircle },
  cancelled: { label: "Kansellert", color: "bg-gray-400", icon: XCircle },
};

const riskColors: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export default function AsplanViakPage() {
  const activeTenders = tenders.filter((t) =>
    ["identified", "preparing", "submitted"].includes(t.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Asplan Viak
          </h1>
          <p className="text-muted-foreground">
            Tilbud, oppgaver og arbeidsplan
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nytt tilbud
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{activeTenders.length}</div>
            <p className="text-sm text-muted-foreground">Aktive tilbud</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-500">
              {tenders.filter((t) => t.risk_level === "high").length}
            </div>
            <p className="text-sm text-muted-foreground">Høy risiko</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">
              {tenders.filter((t) => {
                const d = new Date(t.due_date);
                const diff = (d.getTime() - Date.now()) / 86400000;
                return diff <= 7 && diff >= 0;
              }).length}
            </div>
            <p className="text-sm text-muted-foreground">Frist innen 7 dager</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{workTasks.length}</div>
            <p className="text-sm text-muted-foreground">Åpne oppgaver</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Tilbudspipeline</TabsTrigger>
          <TabsTrigger value="tasks">Oppgaver</TabsTrigger>
          <TabsTrigger value="deadlines">Frister</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4 mt-4">
          {tenders.map((tender) => {
            const config = statusConfig[tender.status];
            const StatusIcon = config.icon;
            return (
              <Card
                key={tender.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${config.color}`}
                      />
                      <CardTitle className="text-lg">
                        {tender.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Oppdragsgiver
                      </span>
                      <p className="font-medium">{tender.client}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frist</span>
                      <p className="font-medium">
                        {new Date(tender.due_date).toLocaleDateString("nb-NO")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Sannsynlighet
                      </span>
                      <p className="font-medium">{tender.probability}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risiko</span>
                      <p
                        className={`font-medium flex items-center gap-1 ${riskColors[tender.risk_level]}`}
                      >
                        {tender.risk_level === "high" && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {tender.risk_level === "low"
                          ? "Lav"
                          : tender.risk_level === "medium"
                            ? "Middels"
                            : tender.risk_level === "high"
                              ? "Høy"
                              : "Kritisk"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Neste milepæl:{" "}
                    </span>
                    <span>{tender.next_milestone}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-2 mt-4">
          {workTasks.map((task) => (
            <Card key={task.id} className="cursor-pointer hover:bg-accent/50">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === "high"
                        ? "bg-orange-500"
                        : task.priority === "medium"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <span>{task.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(task.due_date).toLocaleDateString("nb-NO")}
                </span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-2 mt-4">
          {[...tenders]
            .sort(
              (a, b) =>
                new Date(a.due_date).getTime() -
                new Date(b.due_date).getTime()
            )
            .map((tender) => (
              <Card key={tender.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <span>{tender.title}</span>
                  <Badge
                    variant={
                      (new Date(tender.due_date).getTime() - Date.now()) /
                        86400000 <=
                      7
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {new Date(tender.due_date).toLocaleDateString("nb-NO")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
