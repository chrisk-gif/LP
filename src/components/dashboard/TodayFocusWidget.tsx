import Link from 'next/link'
import { Target, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
}

export async function TodayFocusWidget() {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, priority')
    .not('status', 'in', '("done","archived")')
    .or(`due_date.eq.${today},scheduled_date.eq.${today}`)
    .order('priority', { ascending: true })
    .limit(5)

  // Fallback: if no tasks scheduled/due today, show highest priority active tasks
  let focusItems = tasks ?? []
  if (focusItems.length === 0) {
    const { data: topTasks } = await supabase
      .from('tasks')
      .select('id, title, priority')
      .not('status', 'in', '("done","archived")')
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(3)
    focusItems = topTasks ?? []
  }

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
          {focusItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen oppgaver planlagt i dag</p>
          ) : (
            focusItems.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full">
                  <span className={`h-2 w-2 rounded-full ${priorityColors[item.priority] ?? 'bg-gray-400'}`} />
                </span>
                <span className="text-sm leading-snug">
                  <span className="text-muted-foreground mr-1.5 font-mono text-xs">
                    {index + 1}.
                  </span>
                  {item.title}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
