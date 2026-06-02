import { getGradesCommandCenterData, getStudentGoal } from '@/app/actions/grades'
import { StudentDashboard } from '@/components/StudentDashboard'

export const dynamic = 'force-dynamic'

export default async function StudentViewPage() {
  const [gradesData, targetGpa] = await Promise.all([
    getGradesCommandCenterData(),
    getStudentGoal(),
  ])

  return (
    <StudentDashboard
      courses={gradesData.courses}
      assignments={gradesData.assignments}
      recentGrades={gradesData.recentGrades}
      initialTargetGpa={targetGpa}
    />
  )
}
