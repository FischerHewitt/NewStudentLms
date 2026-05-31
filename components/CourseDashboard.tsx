'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRole } from '@/context/RoleContext'
import { MarkdownContent } from '@/components/MarkdownContent'
import { TeacherCourseDashboard } from '@/components/TeacherCourseDashboard'
import type {
  CourseWithModules,
  SubmissionSummary,
} from '@/app/actions/dashboard'
import type { EnrolledStudent } from '@/app/actions/enrollment'

type StudentTab = 'modules' | 'syllabus'

interface Props {
  course: CourseWithModules
  studentSubmissions: SubmissionSummary[]
  allSubmissions: SubmissionSummary[]
  enrolledStudents?: EnrolledStudent[]
}

export function CourseDashboard({ course, studentSubmissions, allSubmissions, enrolledStudents = [] }: Props) {
  const { role } = useRole()
  const [studentTab, setStudentTab] = useState<StudentTab>('modules')

  const studentSubMap = Object.fromEntries(studentSubmissions.map((s) => [s.assignment_id, s]))

  if (role === 'teacher') {
    return (
      <TeacherCourseDashboard
        course={course}
        allSubmissions={allSubmissions}
        enrolledStudents={enrolledStudents}
      />
    )
  }

  // ── Student view ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600">
          ← All courses
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
        <p className="text-xs text-slate-400">{course.teacherName}</p>
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {([['modules', 'Assignments'], ['syllabus', 'Syllabus']] as [StudentTab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStudentTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              studentTab === id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {studentTab === 'modules' && (
        <div className="space-y-4">
          {course.modules.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">No modules yet.</p>
            </div>
          )}
          {course.modules.map((mod) => (
            <div key={mod.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex-shrink-0 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Week {mod.week_number}
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{mod.title}</p>
                  {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                </div>
              </div>
              {mod.assignments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {mod.assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3">
                      <Link
                        href={`/course/${course.id}/assignment/${a.id}`}
                        className="text-sm font-medium text-slate-800 hover:text-emerald-600"
                      >
                        {a.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        {a.due_date && <span className="text-xs text-slate-400">{a.due_date}</span>}
                        <StudentStatusBadge submission={studentSubMap[a.id] ?? null} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-3 text-xs text-slate-400">No assignments in this module.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {studentTab === 'syllabus' && <SyllabusPanel syllabus={course.rawSyllabus ?? null} />}
    </div>
  )
}

function SyllabusPanel({ syllabus }: { syllabus: string | null }) {
  if (!syllabus) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No syllabus uploaded for this course.</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <MarkdownContent className="max-w-none">{syllabus}</MarkdownContent>
    </div>
  )
}

function StudentStatusBadge({ submission }: { submission: SubmissionSummary | null }) {
  if (!submission || submission.status === 'draft') return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Not submitted</span>
  if (submission.status === 'submitted') return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Submitted</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Graded</span>
}
