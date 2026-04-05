'use client'

import { CheckCircle2, CalendarDays, AlertTriangle, CreditCard } from 'lucide-react'

// DEMO DATA - Replace with API call
const DEMO_STATS = {
  tasksCompletedThisWeek: 12,
  eventsToday: 5,
  overdueCount: 3,
  billsDueThisMonth: 4,
}

const stats = [
  {
    label: 'Oppgaver denne uken',
    value: DEMO_STATS.tasksCompletedThisWeek,
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    label: 'Hendelser i dag',
    value: DEMO_STATS.eventsToday,
    icon: CalendarDays,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Forfalt',
    value: DEMO_STATS.overdueCount,
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
  },
  {
    label: 'Regninger denne mnd',
    value: DEMO_STATS.billsDueThisMonth,
    icon: CreditCard,
    color: 'text-amber-600 dark:text-amber-400',
  },
]

export function StatsBar() {
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
