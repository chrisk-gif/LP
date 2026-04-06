import Link from 'next/link'
import { Inbox, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const sourceLabels: Record<string, string> = {
  manual: 'Manuell',
  voice: 'Stemme',
  ai: 'AI',
}

const sourceColors: Record<string, string> = {
  manual: 'text-blue-500',
  voice: 'text-purple-500',
  ai: 'text-amber-500',
}

export async function InboxWidget() {
  const supabase = await createServerSupabaseClient()

  const [countRes, recentRes] = await Promise.all([
    supabase
      .from('inbox_items')
      .select('id', { count: 'exact', head: true })
      .eq('processed', false),
    supabase
      .from('inbox_items')
      .select('id, content, source, created_at')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const unprocessedCount = countRes.count ?? 0
  const recentItems = recentRes.data ?? []

  return (
    <Link href="/innboks" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="h-4 w-4 text-primary" />
            Innboks
            {unprocessedCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unprocessedCount}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Innboksen er tom</p>
          ) : (
            recentItems.map((item) => {
              const timeAgo = formatTimeAgo(item.created_at)
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 text-xs font-medium ${sourceColors[item.source] ?? ''}`}>
                    {sourceLabels[item.source] ?? item.source}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug truncate">{item.content}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
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

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min siden`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}t siden`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'I gar'
  return `${days} dager siden`
}
