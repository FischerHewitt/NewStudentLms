'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { CourseDashboard } from '@/components/CourseDashboard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { deleteCourse } from '@/app/actions/course'
import {
  getCourseWithModules,
  getStudentSubmissionsForCourse,
  getAllSubmissionsForCourse,
} from '@/app/actions/dashboard'
import type {
  CourseWithModules,
  SubmissionSummary,
  StudentDashboardCourse,
  StudentDashboardAssignment,
} from '@/app/actions/dashboard'
import type { TeacherDashboardData } from '@/lib/teacher-dashboard'

interface Props {
  teacherDashboard: TeacherDashboardData
  studentDashboard: {
    courses: StudentDashboardCourse[]
    assignments: StudentDashboardAssignment[]
  }
}

interface LoadedCourse {
  course: CourseWithModules
  studentSubmissions: SubmissionSummary[]
  allSubmissions: SubmissionSummary[]
}

export function HomeContent({ teacherDashboard, studentDashboard }: Props) {
  const { role } = useRole()
  const router = useRouter()
  const searchParams = useSearchParams()
  // null = Home (gallery); string = open course tab
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('course') ?? null,
  )
  const [loaded, setLoaded] = useState<Record<string, LoadedCourse>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    if (loaded[selectedId]) return
    setLoading(true)
    Promise.all([
      getCourseWithModules(selectedId),
      getStudentSubmissionsForCourse(selectedId),
      getAllSubmissionsForCourse(selectedId),
    ]).then(([course, studentSubmissions, allSubmissions]) => {
      if (course) {
        setLoaded((prev) => ({
          ...prev,
          [selectedId]: { course, studentSubmissions, allSubmissions },
        }))
      }
      setLoading(false)
    })
  }, [selectedId, loaded])

  async function handleDelete(courseId: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteCourse(courseId)
    if (selectedId === courseId) setSelectedId(null)
    router.refresh()
  }

  if (role === 'student') {
    return (
      <StudentDashboard
        courses={studentDashboard.courses}
        assignments={studentDashboard.assignments}
      />
    )
  }

  const courses = teacherDashboard.courses
  const activeCourse = selectedId ? loaded[selectedId] : null

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="overflow-x-auto">
          <div className="flex w-max gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setSelectedId(null)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedId === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedId === c.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 py-8">
        {selectedId === null ? (
          <TeacherDashboard
            data={teacherDashboard}
            onOpenCourse={setSelectedId}
          />
        ) : loading && !activeCourse ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-400">
            Loading…
          </div>
        ) : activeCourse ? (
          <CourseDashboard
            course={activeCourse.course}
            studentSubmissions={activeCourse.studentSubmissions}
            allSubmissions={activeCourse.allSubmissions}
            onDelete={() => handleDelete(activeCourse.course.id, activeCourse.course.title)}
            embedded
          />
        ) : null}
      </div>
    </div>
  )
}
