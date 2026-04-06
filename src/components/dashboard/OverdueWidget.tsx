import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function daysOverdue(dateStr: string): number {
  const due = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export async function OverdueWidget() {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: overdueTasks } = await supabase
    .from('tasks')
    .select('id, title, due_date, project_id, projects(title)')
    .lt('due_date', today)
    .not('status', 'in', '("done","archived")')
    .order('due_date', { ascending: true })
    .limit(5)

  const items = overdueTasks ?? []

  return (
    <Link href="/oppgaver?filter=forfalt" className="block">
      <Card className="transition-shadow hover:shadow-md h-full border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Forfalt
            {items.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {items.length}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen forfalte oppgaver</p>
          ) : (
            items.map((item) => {
              const days = item.due_date ? daysOverdue(item.due_date) : 0
              const projectData = item.projects as unknown as { title: string } | null
              const projectTitle = projectData?.title
              return (
                <div key={item.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm leading-snug truncate">{item.title}</p>
                    {projectTitle && (
                      <p className="text-xs text-muted-foreground">{projectTitle}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400">
                    {days}d
                  </span>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
