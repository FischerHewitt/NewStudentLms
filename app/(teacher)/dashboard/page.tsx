import { Suspense } from 'react'
import { getTeacherDashboardData, getUpcomingDeadlines } from '@/app/actions/teacher-dashboard'
import { TeacherDashboard } from '@/components/TeacherDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [teacherDashboard, deadlines] = await Promise.all([
    getTeacherDashboardData(),
    getUpcomingDeadlines(),
  ])

  return (
    <Suspense>
      <TeacherDashboard data={teacherDashboard} deadlines={deadlines} />
    </Suspense>
  )
}
