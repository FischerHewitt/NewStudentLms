import { getGradesCommandCenterData, getStudentGoal } from '@/app/actions/grades'
import { StudentDashboard } from '@/components/StudentDashboard'
import { RoleGuard } from '@/components/RoleGuard'

export const dynamic = 'force-dynamic'

export default async function StudentViewPage() {
  const [gradesData, targetGpa] = await Promise.all([
    getGradesCommandCenterData(),
    getStudentGoal(),
  ])

  return (
    <RoleGuard requiredRole="student" redirectTo="/dashboard">
      <StudentDashboard
        courses={gradesData.courses}
        assignments={gradesData.assignments}
        recentGrades={gradesData.recentGrades}
        initialTargetGpa={targetGpa}
      />
    </RoleGuard>
  )
}
