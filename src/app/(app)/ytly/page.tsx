"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Plus, Lightbulb, TrendingUp } from "lucide-react";

// Demo data
const initiatives = [
  {
    id: "1",
    title: "Nettside redesign og SEO",
    status: "active",
    progress: 75,
    priority: "high",
    next_action: "Publisere nye tjenestesider",
  },
  {
    id: "2",
    title: "AI-rådgivning tjenestepakke",
    status: "active",
    progress: 30,
    priority: "high",
    next_action: "Definere prispakker",
  },
  {
    id: "3",
    title: "Content marketing - bloggartikler",
    status: "active",
    progress: 20,
    priority: "medium",
    next_action: "Skrive første artikkel om AI i bygg/anlegg",
  },
  {
    id: "4",
    title: "Nettverk og partnere",
    status: "backlog",
    progress: 10,
    priority: "low",
    next_action: "Kartlegge potensielle samarbeidspartnere",
  },
];

const strategyGoals = [
  "Etablere ytly.no som anerkjent AI-rådgiver innen bygg og anlegg",
  "Generere første betalende kunde innen Q2 2026",
  "Bygge synlighet gjennom content og nettverksbygging",
];

const doList = [
  "Fokuser på konkret verdi for kunder",
  "Bygg troverdighet gjennom eksempler og case-studier",
  "Hold kostnadene lave i oppstartsfasen",
  "Bruk AI-verktøy selv i all produksjon",
];

const dontList = [
  "Ikke overinvester i teknologi før det er kunder",
  "Ikke prøv å dekke alle bransjer samtidig",
  "Ikke underpris tjenestene",
];

export default function YtlyPage() {
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nytt initiativ
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="initiatives">Initiativer</TabsTrigger>
          <TabsTrigger value="strategy">Strategi</TabsTrigger>
          <TabsTrigger value="insights">Innsikt</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aktive initiativer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {initiatives
                  .filter((i) => i.status === "active")
                  .map((init) => (
                    <div key={init.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {init.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {init.progress}%
                        </span>
                      </div>
                      <Progress value={init.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        Neste: {init.next_action}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Strategiske mål
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strategyGoals.map((goal, i) => (
                    <li
                      key={i}
                      className="text-sm flex items-start gap-2"
                    >
                      <span className="text-muted-foreground mt-0.5">
                        {i + 1}.
                      </span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-4 mt-4">
          {initiatives.map((init) => (
            <Card
              key={init.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{init.title}</CardTitle>
                  <Badge
                    variant={
                      init.status === "active" ? "default" : "outline"
                    }
                  >
                    {init.status === "active" ? "Aktiv" : "Backlog"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={init.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Neste handling: {init.next_action}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategiske mål</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strategyGoals.map((goal, i) => (
                  <li key={i} className="text-sm">{goal}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Gjør</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {doList.map((item, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-green-600">+</span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Ikke gjør</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {dontList.map((item, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-red-600">-</span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
