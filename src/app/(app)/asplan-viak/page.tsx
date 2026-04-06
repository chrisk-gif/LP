"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Tender {
  id: string;
  title: string;
  client: string | null;
  status: string;
  due_date: string | null;
  probability: number | null;
  risk_level: string | null;
  next_milestone: string | null;
}

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  status: string;
}

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
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Get area id for asplan-viak
      const { data: areas, error: areaError } = await supabase
        .from("areas")
        .select("id, slug")
        .eq("slug", "asplan-viak");

      if (areaError) {
        setError("Kunne ikke hente område: " + areaError.message);
        setLoading(false);
        return;
      }

      if (!areas || areas.length === 0) {
        setTenders([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      const areaId = areas[0].id;

      // Fetch tenders and tasks in parallel
      const [tendersResult, tasksResult] = await Promise.all([
        supabase
          .from("tenders")
          .select("*")
          .eq("area_id", areaId)
          .order("due_date"),
        supabase
          .from("tasks")
          .select("*")
          .eq("area_id", areaId)
          .in("status", ["inbox", "todo", "in_progress", "waiting"])
          .order("due_date"),
      ]);

      if (tendersResult.error) {
        setError("Kunne ikke hente tilbud: " + tendersResult.error.message);
        setLoading(false);
        return;
      }

      if (tasksResult.error) {
        setError("Kunne ikke hente oppgaver: " + tasksResult.error.message);
        setLoading(false);
        return;
      }

      setTenders(tendersResult.data ?? []);
      setTasks(tasksResult.data ?? []);
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
                if (!t.due_date) return false;
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
            <div className="text-2xl font-bold">{tasks.length}</div>
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
          {tenders.length === 0 ? (
            <p className="text-muted-foreground">Ingen tilbud ennå.</p>
          ) : (
            tenders.map((tender) => {
              const config = statusConfig[tender.status] ?? statusConfig.identified;
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
                        <p className="font-medium">{tender.client ?? "Ikke angitt"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frist</span>
                        <p className="font-medium">
                          {tender.due_date
                            ? new Date(tender.due_date).toLocaleDateString("nb-NO")
                            : "Ikke satt"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Sannsynlighet
                        </span>
                        <p className="font-medium">
                          {tender.probability != null ? `${tender.probability}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risiko</span>
                        <p
                          className={`font-medium flex items-center gap-1 ${riskColors[tender.risk_level ?? "medium"]}`}
                        >
                          {tender.risk_level === "high" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {tender.risk_level === "critical" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {tender.risk_level === "low"
                            ? "Lav"
                            : tender.risk_level === "medium"
                              ? "Middels"
                              : tender.risk_level === "high"
                                ? "Høy"
                                : tender.risk_level === "critical"
                                  ? "Kritisk"
                                  : "—"}
                        </p>
                      </div>
                    </div>
                    {tender.next_milestone && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Neste milepæl:{" "}
                        </span>
                        <span>{tender.next_milestone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
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

        <TabsContent value="deadlines" className="space-y-2 mt-4">
          {tenders.length === 0 ? (
            <p className="text-muted-foreground">Ingen tilbud med frister.</p>
          ) : (
            [...tenders]
              .filter((t) => t.due_date)
              .sort(
                (a, b) =>
                  new Date(a.due_date!).getTime() -
                  new Date(b.due_date!).getTime()
              )
              .map((tender) => (
                <Card key={tender.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <span>{tender.title}</span>
                    <Badge
                      variant={
                        tender.due_date &&
                        (new Date(tender.due_date).getTime() - Date.now()) /
                          86400000 <=
                          7
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {tender.due_date
                        ? new Date(tender.due_date).toLocaleDateString("nb-NO")
                        : "Ingen frist"}
                    </Badge>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
