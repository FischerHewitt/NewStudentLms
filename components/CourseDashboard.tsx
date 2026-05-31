'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { useRole } from '@/context/RoleContext'
import { Gradebook } from '@/components/Gradebook'
import { getGradebookData } from '@/app/actions/gradebook'
import { publishCourse, unpublishCourse, updateCourseSyllabus } from '@/app/actions/course'
import { RosterPanel } from '@/components/RosterPanel'
import { MarkdownContent } from '@/components/MarkdownContent'
import { RichTextarea } from '@/components/RichTextarea'
import { assignmentHref } from '@/lib/routes'
import { TeacherCourseDashboard } from '@/components/TeacherCourseDashboard'
import type {
  CourseWithModules,
  SubmissionSummary,
} from '@/app/actions/dashboard'
import type { GradebookData } from '@/app/actions/gradebook'
import type { EnrolledStudent } from '@/app/actions/enrollment'

type TeacherTab = 'modules' | 'queue' | 'syllabus' | 'gradebook' | 'roster'
type StudentTab = 'modules' | 'syllabus'

interface Props {
  course: CourseWithModules
  studentSubmissions: SubmissionSummary[]
  allSubmissions: SubmissionSummary[]
  enrolledStudents?: EnrolledStudent[]
  embedded?: boolean
  onDelete?: () => void
}

export function CourseDashboard({ course, studentSubmissions, allSubmissions, enrolledStudents = [], embedded, onDelete }: Props) {
  const { role } = useRole()
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('modules')
  const [studentTab, setStudentTab] = useState<StudentTab>('modules')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [gradebookData, setGradebookData] = useState<GradebookData | null>(null)
  const [gradebookLoading, setGradebookLoading] = useState(false)
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published'>(course.status)
  const [syllabus, setSyllabus] = useState(course.rawSyllabus ?? '')
  const [publishPending, startPublishTransition] = useTransition()

  const handlePublish = () => startPublishTransition(async () => {
    await publishCourse(course.id)
    setCourseStatus('published')
  })

  const handleUnpublish = () => startPublishTransition(async () => {
    await unpublishCourse(course.id)
    setCourseStatus('draft')
  })

  useEffect(() => {
    if (teacherTab !== 'gradebook' || gradebookData) return
    setGradebookLoading(true)
    getGradebookData(course.id).then((data) => {
      setGradebookData(data)
      setGradebookLoading(false)
    })
  }, [teacherTab, gradebookData, course.id])

  const studentSubMap = Object.fromEntries(studentSubmissions.map((s) => [s.assignment_id, s]))

  // Per-assignment submission counts and pending-grade counts
  const submittedByAssignment: Record<string, number> = {}
  const pendingByAssignment: Record<string, number> = {}
  for (const sub of allSubmissions) {
    submittedByAssignment[sub.assignment_id] = (submittedByAssignment[sub.assignment_id] ?? 0) + 1
    if (sub.status === 'submitted') {
      pendingByAssignment[sub.assignment_id] = (pendingByAssignment[sub.assignment_id] ?? 0) + 1
    }
  }

  const totalPending = Object.values(pendingByAssignment).reduce((s, n) => s + n, 0)
  const totalSubmissions = allSubmissions.length
  const allAssignments = course.modules.flatMap((m) => m.assignments)

  // Assignments with at least one ungraded submission — SpeedGrader queue
  const queueAssignments = allAssignments.filter((a) => (pendingByAssignment[a.id] ?? 0) > 0)

  if (role === 'teacher') {
    return (
      <TeacherCourseDashboard
        course={course}
        allSubmissions={allSubmissions}
        enrolledStudents={enrolledStudents}
      />
    )
  }

  // ── Student view ────────────────────────────────────────────────────────────
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
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
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

      {studentTab === 'syllabus' && <SyllabusPanel syllabus={syllabus} />}
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function ModuleGrid({
  course,
  renderBadge,
}: {
  course: CourseWithModules
  renderBadge: (a: { id: string; title: string; due_date: string | null; points_possible: number }) => React.ReactNode
}) {
  if (course.modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No modules yet. Generate a course to populate the structure.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {course.modules.map((mod) => (
        <div key={mod.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Wk {mod.week_number}
              </span>
              <div>
                <p className="font-semibold text-slate-800 leading-tight">{mod.title}</p>
                {mod.description && <p className="text-xs text-slate-400 truncate max-w-[180px]">{mod.description}</p>}
              </div>
            </div>
          </div>
          {mod.assignments.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {mod.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5">
                  <Link
                    href={assignmentHref(course.id, a.id)}
                    className="truncate max-w-[160px] text-sm font-medium text-slate-700 hover:text-indigo-600"
                  >
                    {a.title}
                  </Link>
                  <div className="flex flex-shrink-0 items-center gap-2 ml-2">
                    {a.due_date && <span className="text-xs text-slate-400">{a.due_date}</span>}
                    {renderBadge(a)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-3 text-xs text-slate-400 italic">No assignments yet</p>
          )}
        </div>
      ))}
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

function EditableSyllabusPanel({
  courseId,
  syllabus,
  onSaved,
}: {
  courseId: string
  syllabus: string
  onSaved: (syllabus: string) => void
}) {
  const [isEditing, setIsEditing] = useState(!syllabus)
  const [draft, setDraft] = useState(syllabus)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const hasChanges = draft !== syllabus

  useEffect(() => {
    if (isEditing) return
    setDraft(syllabus)
  }, [isEditing, syllabus])

  const handleSave = () => {
    setMessage('')
    startTransition(async () => {
      try {
        await updateCourseSyllabus(courseId, draft)
        onSaved(draft)
        setIsEditing(false)
        setMessage('Syllabus saved.')
      } catch {
        setMessage('Could not save the syllabus. Please try again.')
      }
    })
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Edit syllabus</h2>
            <p className="text-xs text-slate-400">Changes update this course without changing whether it is published.</p>
          </div>
          <div className="flex items-center gap-2">
            {syllabus && (
              <button
                type="button"
                onClick={() => {
                  setDraft(syllabus)
                  setIsEditing(false)
                  setMessage('')
                }}
                disabled={isPending}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save syllabus'}
            </button>
          </div>
        </div>
        <RichTextarea
          value={draft}
          onChange={setDraft}
          placeholder="Add the course syllabus..."
          rows={18}
          autoFocus
        />
        {message && <p className={`mt-2 text-xs ${message.startsWith('Could') ? 'text-red-600' : 'text-emerald-600'}`}>{message}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setDraft(syllabus)
            setIsEditing(true)
            setMessage('')
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit syllabus
        </button>
      </div>
      <SyllabusPanel syllabus={syllabus} />
      {message && <p className="text-xs text-emerald-600">{message}</p>}
    </div>
  )
}

function StatCard({
  label, value, sub, color, action,
}: {
  label: string
  value: string
  sub: string
  color: 'indigo' | 'amber' | 'emerald' | 'slate'
  action?: { label: string; tab: TeacherTab; setTab: (t: TeacherTab) => void }
}) {
  const styles: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    slate: 'border-slate-200 bg-white',
  }
  const textStyles: Record<string, string> = {
    indigo: 'text-indigo-900',
    amber: 'text-amber-900',
    emerald: 'text-emerald-900',
    slate: 'text-slate-900',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${styles[color]}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest opacity-60 ${textStyles[color]}`}>{label}</p>
      <p className={`mt-1 text-3xl font-bold ${textStyles[color]}`}>{value}</p>
      <p className={`text-xs opacity-60 ${textStyles[color]}`}>{sub}</p>
      {action && (
        <button
          onClick={() => action.setTab(action.tab)}
          className="mt-1 text-xs font-semibold underline opacity-80"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

function DrawerLink({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
    >
      <span className="text-xs">{icon}</span>
      {label}
    </Link>
  )
}

function SubmissionCountBadge({ submitted, pending }: { submitted: number; pending: number }) {
  if (submitted === 0) return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">No submissions</span>
  if (pending > 0) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{pending} to grade</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">All graded</span>
}

function StudentStatusBadge({ submission }: { submission: SubmissionSummary | null }) {
  if (!submission || submission.status === 'draft') return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Not submitted</span>
  if (submission.status === 'submitted') return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Submitted</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Graded</span>
}
