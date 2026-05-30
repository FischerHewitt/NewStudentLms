'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
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

interface Props {
  teacherCourses: { courseId: string; title: string; createdAt: string }[]
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

export function HomeContent({ teacherCourses, studentDashboard }: Props) {
  const { role } = useRole()
  const router = useRouter()
  const searchParams = useSearchParams()
  // null = Home tab; pre-select from ?course= when returning from an assignment
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
            {teacherCourses.map((c) => (
              <button
                key={c.courseId}
                onClick={() => setSelectedId(c.courseId)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedId === c.courseId
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
          /* Home view */
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Courses</h2>
              <Link
                href="/generate"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                + New course
              </Link>
            </div>

            {teacherCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <p className="mb-1 text-lg font-semibold text-slate-800">No courses yet</p>
                <p className="mb-5 text-sm text-slate-500">
                  Paste your syllabus and let AI build the course structure for you.
                </p>
                <Link
                  href="/generate"
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Create course from syllabus →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {teacherCourses.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{course.title}</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedId(course.courseId)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        Open →
                      </button>
                      <button
                        onClick={() => handleDelete(course.courseId, course.title)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : loading && !activeCourse ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-400">
            Loading…
          </div>
        ) : activeCourse ? (
          <CourseDashboard
            course={activeCourse.course}
            studentSubmissions={activeCourse.studentSubmissions}
            allSubmissions={activeCourse.allSubmissions}
            embedded
          />
        ) : null}
      </div>
    </div>
  )
}
