import { getStudentDashboardData } from '@/app/actions/dashboard'
import { StudentDashboard } from '@/components/StudentDashboard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const studentDashboard = await getStudentDashboardData()

  return (
    <StudentDashboard
      courses={studentDashboard.courses}
      assignments={studentDashboard.assignments}
    />
  )
}
