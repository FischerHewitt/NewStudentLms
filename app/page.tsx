import { Suspense } from 'react'
import { getAllCourses } from '@/app/actions/course'
import { getStudentDashboardData } from '@/app/actions/dashboard'
import { HomeContent } from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teacherCourses, studentDashboard] = await Promise.all([
    getAllCourses(),
    getStudentDashboardData(),
  ])

  return (
    <Suspense>
      <HomeContent
        teacherCourses={teacherCourses}
        studentDashboard={studentDashboard}
      />
    </Suspense>
  )
}
