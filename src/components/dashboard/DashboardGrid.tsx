'use client'

import { TodayFocusWidget } from './TodayFocusWidget'
import { UpcomingEventsWidget } from './UpcomingEventsWidget'
import { OverdueWidget } from './OverdueWidget'
import { FinanceWidget } from './FinanceWidget'
import { TrainingWidget } from './TrainingWidget'
import { TenderWidget } from './TenderWidget'
import { YtlyWidget } from './YtlyWidget'
import { InboxWidget } from './InboxWidget'

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <TodayFocusWidget />
      <UpcomingEventsWidget />
      <OverdueWidget />
      <FinanceWidget />
      <TenderWidget />
      <TrainingWidget />
      <YtlyWidget />
      <InboxWidget />
    </div>
  )
}
