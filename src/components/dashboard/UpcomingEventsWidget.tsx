import Link from 'next/link'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function UpcomingEventsWidget() {
  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_time, location')
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(5)

  const items = events ?? []

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
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen kommende hendelser</p>
          ) : (
            items.map((event) => {
              const time = new Date(event.start_time).toLocaleTimeString('nb-NO', {
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-11 shrink-0 pt-0.5">
                    {time}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug truncate">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
