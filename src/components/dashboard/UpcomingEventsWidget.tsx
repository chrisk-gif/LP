'use client'

import Link from 'next/link'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'

// DEMO DATA - Replace with API call
const DEMO_EVENTS = [
  { id: '1', title: 'Prosjektmote Byasentunnelen', time: '09:00', location: 'Teams' },
  { id: '2', title: 'Lunsj med Kjetil (SVV)', time: '11:30', location: 'Olivia Aker Brygge' },
  { id: '3', title: 'Intern tilbudsgjennomgang', time: '13:00', location: 'Rom 3.14' },
  { id: '4', title: 'Trening - styrke', time: '16:30', location: 'SATS Nydalen' },
  { id: '5', title: 'Middag med familien', time: '18:00', location: 'Hjemme' },
]

export function UpcomingEventsWidget() {
  return (
    <Link href="/kalender" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-primary" />
            Kommende hendelser
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_EVENTS.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <span className="font-mono text-xs text-muted-foreground w-11 shrink-0 pt-0.5">
                {event.time}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground truncate">{event.location}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
