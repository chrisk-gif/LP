import { CheckCircle2, CalendarDays, AlertTriangle, ListTodo } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface StatItem {
  label: string
  value: number
  icon: typeof CheckCircle2
  color: string
}

export async function StatsBar() {
  const supabase = await createServerSupabaseClient()

  const today = new Date().toISOString().split('T')[0]
  const todayStart = `${today}T00:00:00`
  const todayEnd = `${today}T23:59:59`

  const [activeTasksRes, dueTodayRes, eventsTodayRes, overdueRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .not('status', 'in', '("done","archived")'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('due_date', today)
      .not('status', 'in', '("done","archived")'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .lt('due_date', today)
      .not('status', 'in', '("done","archived")'),
  ])

  const stats: StatItem[] = [
    {
      label: 'Aktive oppgaver',
      value: activeTasksRes.count ?? 0,
      icon: ListTodo,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Forfaller i dag',
      value: dueTodayRes.count ?? 0,
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Hendelser i dag',
      value: eventsTodayRes.count ?? 0,
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Forfalt',
      value: overdueRes.count ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
          >
            <Icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
            <div>
              <p className="text-lg font-semibold leading-none tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
