'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Target,
  Clock,
  ListTodo,
  StickyNote,
  Sparkles,
  ArrowLeft,
  GripVertical,
  Plus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// DEMO DATA - Replace with API call
const DEMO_FOCUS = [
  { id: '1', title: 'Ferdigstille tilbudsgrunnlag E39 Lyngdal-Flekkefjord', done: false },
  { id: '2', title: 'Gjennomgang av geoteknisk rapport Byasentunnelen', done: false },
  { id: '3', title: 'Sende faktura til Statens vegvesen', done: false },
]

const DEMO_SCHEDULE = [
  { id: 's1', time: '08:00', duration: 60, title: 'Fokustid - tilbudsarbeid', type: 'focus' as const },
  { id: 's2', time: '09:00', duration: 60, title: 'Prosjektmote Byasentunnelen', type: 'meeting' as const },
  { id: 's3', time: '10:00', duration: 90, title: 'Tilbudskalkulasjon E39', type: 'focus' as const },
  { id: 's4', time: '11:30', duration: 60, title: 'Lunsj med Kjetil (SVV)', type: 'meeting' as const },
  { id: 's5', time: '12:30', duration: 30, title: 'Epost og admin', type: 'admin' as const },
  { id: 's6', time: '13:00', duration: 60, title: 'Intern tilbudsgjennomgang', type: 'meeting' as const },
  { id: 's7', time: '14:00', duration: 120, title: 'Rapport-skriving geoteknikk', type: 'focus' as const },
  { id: 's8', time: '16:30', duration: 60, title: 'Trening - styrke', type: 'personal' as const },
  { id: 's9', time: '18:00', duration: 90, title: 'Middag med familien', type: 'personal' as const },
]

const DEMO_UNSCHEDULED = [
  { id: 'u1', title: 'Oppdatere fremdriftsplan Siljan kommune', priority: 'medium' as const },
  { id: 'u2', title: 'Bestille flybilletter til Stavanger', priority: 'low' as const },
  { id: 'u3', title: 'Lese geoteknisk standard NS 8175', priority: 'low' as const },
]

const DEMO_NOTES = 'Husk a sjekke status pa materialbestilling for Byasentunnelen. Ring Ola om samkjoring til Stavanger neste uke.'

const typeColors: Record<string, string> = {
  focus: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
  meeting: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/30',
  admin: 'border-l-gray-400 bg-gray-50 dark:bg-gray-950/30',
  personal: 'border-l-green-500 bg-green-50 dark:bg-green-950/30',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TodayPage() {
  const [focusItems, setFocusItems] = useState(DEMO_FOCUS)
  const [notes, setNotes] = useState(DEMO_NOTES)

  const toggleFocus = (id: string) => {
    setFocusItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">I dag</h1>
            <p className="text-muted-foreground mt-0.5 capitalize">{getTodayFormatted()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Hva er viktigst?
          </Button>
          <Button size="sm" className="gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Plan min dag
          </Button>
        </div>
      </header>

      {/* Top 3 Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Topp 3 fokus i dag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {focusItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => toggleFocus(item.id)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  item.done
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted-foreground/30'
                }`}
              >
                {item.done ? '\u2713' : index + 1}
              </div>
              <span
                className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Two-column layout: Schedule + Sidebar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Time-blocked schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Dagsplan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {DEMO_SCHEDULE.map((block) => (
              <div
                key={block.id}
                className={`flex items-start gap-3 rounded-md border-l-4 p-3 ${typeColors[block.type] ?? ''}`}
              >
                <div className="w-12 shrink-0">
                  <span className="font-mono text-xs text-muted-foreground">{block.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{block.title}</p>
                  <p className="text-xs text-muted-foreground">{block.duration} min</p>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar: unscheduled + notes */}
        <div className="flex flex-col gap-4">
          {/* Unscheduled tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-primary" />
                Uplanlagte oppgaver
                <Badge variant="secondary" className="ml-1 text-xs">
                  {DEMO_UNSCHEDULED.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_UNSCHEDULED.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${priorityColors[task.priority]}`} />
                  <span className="text-sm truncate">{task.title}</span>
                </div>
              ))}
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1">
                <Plus className="h-3.5 w-3.5" />
                Legg til oppgave
              </button>
            </CardContent>
          </Card>

          {/* Day notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-4 w-4 text-primary" />
                Dagens notater
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-md border-0 bg-muted/50 p-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[120px]"
                placeholder="Skriv notater for dagen..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
