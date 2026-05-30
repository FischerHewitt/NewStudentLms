import { Suspense } from 'react'
import { getStudentDashboardData } from '@/app/actions/dashboard'
import { getTeacherDashboardData } from '@/app/actions/teacher-dashboard'
import { HomeContent } from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teacherDashboard, studentDashboard] = await Promise.all([
    getTeacherDashboardData(),
    getStudentDashboardData(),
  ])

  return (
    <Suspense>
      <HomeContent
        teacherDashboard={teacherDashboard}
        studentDashboard={studentDashboard}
      />
    </Suspense>
  )
}
