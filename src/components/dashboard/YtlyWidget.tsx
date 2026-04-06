import Link from 'next/link'
import { Globe, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  backlog: 'outline',
  completed: 'secondary',
}

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  backlog: 'Planlagt',
  completed: 'Fullfort',
}

export async function YtlyWidget() {
  const supabase = await createServerSupabaseClient()

  // Fetch projects belonging to the ytly/business area
  const { data: areas } = await supabase
    .from('areas')
    .select('id')
    .or('slug.eq.ytly,slug.eq.business,name.ilike.%ytly%')
    .limit(1)

  let items: Array<{ id: string; title: string; status: string }> = []

  if (areas && areas.length > 0) {
    const areaId = areas[0].id
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('area_id', areaId)
      .in('status', ['active', 'backlog'])
      .order('status', { ascending: true })
      .limit(5)
    items = projects ?? []
  }

  return (
    <Link href="/ytly" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            ytly.no
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen aktive initiativer</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <p className="text-sm truncate min-w-0">{item.title}</p>
                <Badge
                  variant={statusVariant[item.status] ?? 'outline'}
                  className="text-xs shrink-0"
                >
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
