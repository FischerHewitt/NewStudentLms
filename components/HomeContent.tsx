'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import { TeacherDashboard } from '@/components/TeacherDashboard'
import { CourseDashboard } from '@/components/CourseDashboard'
import { StudentDashboard } from '@/components/StudentDashboard'
import { deleteCourse, publishCourse, unpublishCourse } from '@/app/actions/course'
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

type CourseDraft = { courseId: string; title: string; draftKey: string; createdAt: string }

interface Props {
  teacherDashboard: TeacherDashboardData
  studentDashboard: {
    courses: StudentDashboardCourse[]
    assignments: StudentDashboardAssignment[]
  }
  drafts: CourseDraft[]
}

interface LoadedCourse {
  course: CourseWithModules
  studentSubmissions: SubmissionSummary[]
  allSubmissions: SubmissionSummary[]
}

const BRAND_GRADIENT = 'linear-gradient(135deg, #FFAA00 0%, #FF3B7A 55%, #7B2FFF 100%)'

export function HomeContent({ teacherDashboard, studentDashboard, drafts }: Props) {
  const { role } = useRole()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('course') ?? null,
  )
  const [loaded, setLoaded] = useState<Record<string, LoadedCourse>>({})
  const [loading, setLoading] = useState(false)

  // Dark body when in teacher mode
  useEffect(() => {
    if (role === 'teacher') {
      document.body.style.backgroundColor = '#090B18'
    } else {
      document.body.style.backgroundColor = ''
    }
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [role])

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

  async function handleDiscardDraft(courseId: string) {
    await deleteCourse(courseId)
    router.refresh()
  }

  async function handlePublish(courseId: string) {
    await publishCourse(courseId)
    router.refresh()
  }

  async function handleUnpublish(courseId: string) {
    await unpublishCourse(courseId)
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
    // Escape the max-w-6xl px-6 py-8 container to go full-bleed dark
    <div
      style={{
        marginLeft: '-1.5rem',
        marginRight: '-1.5rem',
        marginTop: '-2rem',
        minHeight: 'calc(100vh - 3.5rem)',
      }}
    >
      {/* Dark tab bar */}
      <div
        className="border-b px-6 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="overflow-x-auto">
          <div
            className="flex w-max gap-1 rounded-xl p-1"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
              style={
                selectedId === null
                  ? { background: BRAND_GRADIENT, color: 'white' }
                  : { color: 'rgba(238,240,255,0.45)' }
              }
            >
              Home
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                style={
                  selectedId === c.id
                    ? { background: BRAND_GRADIENT, color: 'white' }
                    : { color: 'rgba(238,240,255,0.45)' }
                }
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {selectedId === null ? (
          <TeacherDashboard
            data={teacherDashboard}
            drafts={drafts}
            onOpenCourse={setSelectedId}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onDiscardDraft={handleDiscardDraft}
          />
        ) : loading && !activeCourse ? (
          <div
            className="flex items-center justify-center py-24 text-sm"
            style={{ color: 'rgba(238,240,255,0.35)' }}
          >
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
