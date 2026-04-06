import Link from 'next/link'
import { Dumbbell, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return {
    weekStart: monday.toISOString(),
    weekEnd: sunday.toISOString(),
  }
}

export async function TrainingWidget() {
  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()
  const { weekStart, weekEnd } = getWeekBounds()

  const [nextSessionRes, weekPlannedRes, weekCompletedRes] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, title, session_type, planned_at')
      .gte('planned_at', now)
      .is('completed_at', null)
      .order('planned_at', { ascending: true })
      .limit(1),
    supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('planned_at', weekStart)
      .lte('planned_at', weekEnd),
    supabase
      .from('workout_sessions')
      .select('id, duration_minutes', { count: 'exact' })
      .gte('planned_at', weekStart)
      .lte('planned_at', weekEnd)
      .not('completed_at', 'is', null),
  ])

  const nextSession = nextSessionRes.data?.[0]
  const planned = weekPlannedRes.count ?? 0
  const completed = weekCompletedRes.count ?? 0
  const completedSessions = weekCompletedRes.data ?? []
  const totalMinutes = completedSessions.reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0),
    0
  )
  const progressPct = planned > 0 ? Math.round((completed / planned) * 100) : 0

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
            {nextSession ? (
              <>
                <p className="text-sm font-medium">{nextSession.session_type ?? nextSession.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(nextSession.planned_at!).toLocaleTimeString('nb-NO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' '}
                  &middot;{' '}
                  {new Date(nextSession.planned_at!).toLocaleDateString('nb-NO', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen planlagte okter</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground">Denne uken</p>
              <p className="text-xs font-medium">
                {completed}/{planned} okter
              </p>
            </div>
            <Progress value={progressPct} className="h-1.5" />
            {totalMinutes > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {totalMinutes} min totalt
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
