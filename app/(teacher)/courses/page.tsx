import { getTeacherDashboardData } from '@/app/actions/teacher-dashboard'
import { TeacherCoursesPage } from '@/components/TeacherCoursesPage'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const { courses } = await getTeacherDashboardData()
  return <TeacherCoursesPage courses={courses} />
}
