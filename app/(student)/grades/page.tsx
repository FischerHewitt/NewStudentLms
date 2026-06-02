import { getGradesCommandCenterData, getStudentGoal } from '@/app/actions/grades'
import { GradesCommandCenter } from '@/components/GradesCommandCenter'

export const dynamic = 'force-dynamic'

export default async function GradesPage() {
  const [data, targetGpa] = await Promise.all([
    getGradesCommandCenterData(),
    getStudentGoal(),
  ])

  const firstCourseId = data.courses[0]?.id ?? null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <GradesCommandCenter
          courses={data.courses}
          assignments={data.assignments}
          recentGrades={data.recentGrades}
          initialTargetGpa={targetGpa}
          initialFilterCourseId={firstCourseId}
        />
      </div>
    </div>
  )
}
