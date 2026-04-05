'use client'

import Link from 'next/link'
import { Dumbbell, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// DEMO DATA - Replace with API call
const DEMO_TRAINING = {
  nextSession: {
    type: 'Styrke - overkropp',
    time: '16:30',
    location: 'SATS Nydalen',
  },
  weekSummary: {
    completed: 3,
    planned: 5,
    totalMinutes: 195,
  },
}

export function TrainingWidget() {
  const { nextSession, weekSummary } = DEMO_TRAINING
  const progressPct = Math.round((weekSummary.completed / weekSummary.planned) * 100)

  return (
    <Link href="/trening" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4 text-primary" />
            Trening
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Neste okt</p>
            <p className="text-sm font-medium">{nextSession.type}</p>
            <p className="text-xs text-muted-foreground">
              {nextSession.time} &middot; {nextSession.location}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground">Denne uken</p>
              <p className="text-xs font-medium">
                {weekSummary.completed}/{weekSummary.planned} okter
              </p>
            </div>
            <Progress value={progressPct} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {weekSummary.totalMinutes} min totalt
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
