'use client'

import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// DEMO DATA - Replace with API call
const DEMO_OVERDUE = [
  { id: '1', title: 'Levere fremdriftsrapport Div40 november', dueDate: '2026-03-28', project: 'Div40' },
  { id: '2', title: 'Oppdatere CV i Doffin-profil', dueDate: '2026-04-01', project: 'Admin' },
  { id: '3', title: 'Signere underleverandoravtale Ramboll', dueDate: '2026-04-03', project: 'E39' },
]

function daysOverdue(dateStr: string): number {
  const due = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function OverdueWidget() {
  return (
    <Link href="/oppgaver?filter=forfalt" className="block">
      <Card className="transition-shadow hover:shadow-md h-full border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Forfalt
            <Badge variant="destructive" className="ml-1 text-xs">
              {DEMO_OVERDUE.length}
            </Badge>
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_OVERDUE.map((item) => {
            const days = daysOverdue(item.dueDate)
            return (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm leading-snug truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.project}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400">
                  {days}d
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </Link>
  )
}
