import { Suspense } from 'react'
import { getStudentDashboardData } from '@/app/actions/dashboard'
import { getTeacherDashboardData } from '@/app/actions/teacher-dashboard'
import { getCourseDrafts } from '@/app/actions/course'
import { HomeContent } from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teacherDashboard, studentDashboard, drafts] = await Promise.all([
    getTeacherDashboardData(),
    getStudentDashboardData(),
    getCourseDrafts(),
  ])

  return (
    <Suspense>
      <HomeContent
        teacherDashboard={teacherDashboard}
        studentDashboard={studentDashboard}
        drafts={drafts}
      />
    </Suspense>
  )
}
