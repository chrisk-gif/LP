import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { StatsBar } from '@/components/dashboard/StatsBar'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'God natt'
  if (hour < 12) return 'God morgen'
  if (hour < 17) return 'God ettermiddag'
  return 'God kveld'
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const greeting = getGreeting()
  const todayFormatted = getTodayFormatted()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = 'bruker'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    if (profile?.display_name) {
      displayName = profile.display_name
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}, {displayName}</h1>
        <p className="text-muted-foreground mt-1 capitalize">{todayFormatted}</p>
      </header>

      <Suspense fallback={<StatsBarSkeleton />}>
        <StatsBar />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <DashboardGrid />
      </Suspense>
    </div>
  )
}

function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
