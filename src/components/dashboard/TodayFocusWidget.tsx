'use client'

import Link from 'next/link'
import { Target, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'

// DEMO DATA - Replace with API call
const DEMO_FOCUS_ITEMS = [
  {
    id: '1',
    title: 'Ferdigstille tilbudsgrunnlag E39 Lyngdal-Flekkefjord',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Gjennomgang av geoteknisk rapport Byasentunnelen',
    priority: 'high' as const,
  },
  {
    id: '3',
    title: 'Sende faktura til Statens vegvesen',
    priority: 'medium' as const,
  },
]

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
}

export function TodayFocusWidget() {
  return (
    <Link href="/idag" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Dagens fokus
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_FOCUS_ITEMS.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full {priorityColors[item.priority]}">
                <span className={`h-2 w-2 rounded-full ${priorityColors[item.priority]}`} />
              </span>
              <span className="text-sm leading-snug">
                <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                  {index + 1}.
                </span>
                {item.title}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
