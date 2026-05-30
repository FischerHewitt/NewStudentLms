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
      <div className="mx-auto max-w-4xl">
        {/* Hamburger */}
        {!embedded && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="mb-5 flex flex-col gap-1 p-1"
            aria-label="Open navigation"
          >
            <span className="block h-0.5 w-5 rounded bg-slate-600" />
            <span className="block h-0.5 w-5 rounded bg-slate-600" />
            <span className="block h-0.5 w-5 rounded bg-slate-600" />
          </button>
        )}

        {/* Drawer */}
        {drawerOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setDrawerOpen(false)} />
            <div className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <span className="text-sm font-bold text-slate-800">Navigation</span>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                <DrawerLink href={`/course/${course.id}`} onClick={() => setDrawerOpen(false)} label="Modules & Assignments" icon="✦" />
                <DrawerLink href={`/course/${course.id}/gradebook`} onClick={() => setDrawerOpen(false)} label="Gradebook" icon="▦" />
                <DrawerLink href="/" onClick={() => setDrawerOpen(false)} label="All courses" icon="◉" />
              </nav>
            </div>
          </>
        )}

        {/* Draft banner */}
        {courseStatus === 'draft' && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-800">Draft</span>
              <span className="text-sm text-amber-800">This course is not visible to students.</span>
            </div>
            <button
              onClick={handlePublish}
              disabled={publishPending}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {publishPending ? 'Publishing…' : 'Publish Course'}
            </button>
          </div>
        )}
        {courseStatus === 'published' && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800">Published</span>
              <span className="text-sm text-emerald-800">Students can see this course.</span>
            </div>
            <button
              onClick={handleUnpublish}
              disabled={publishPending}
              className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {publishPending ? 'Updating…' : 'Unpublish'}
            </button>
          </div>
        )}

        {/* Course header */}
        <div className="mb-5">
          {!embedded && (
            <Link href="/" className="mb-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600">
              ← All courses
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{course.title}</h1>
          <p className="text-xs text-slate-400">{course.teacherName}</p>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard
            label="Total submissions"
            value={String(totalSubmissions)}
            sub={`across ${allAssignments.length} assignments`}
            color="indigo"
          />
          <StatCard
            label="Pending grades"
            value={String(totalPending)}
            sub="submitted, awaiting review"
            color={totalPending > 0 ? 'amber' : 'slate'}
            action={totalPending > 0 ? { label: 'Go to queue →', tab: 'queue' as TeacherTab, setTab: setTeacherTab } : undefined}
          />
          <StatCard
            label="Modules"
            value={String(course.modules.length)}
            sub={`${allAssignments.length} assignments total`}
            color="slate"
          />
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {([
            ['modules', 'Modules & Assignments'],
            ['queue', `SpeedGrader${totalPending > 0 ? ` (${totalPending})` : ''}`],
            ['syllabus', 'Syllabus'],
            ['gradebook', 'Gradebook'],
            ['roster', `Roster${enrolledStudents.length > 0 ? ` (${enrolledStudents.length})` : ''}`],
          ] as [TeacherTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTeacherTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                teacherTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modules tab */}
        {teacherTab === 'modules' && (
          <ModuleGrid
            course={course}
            renderBadge={(a) => (
              <SubmissionCountBadge
                submitted={submittedByAssignment[a.id] ?? 0}
                pending={pendingByAssignment[a.id] ?? 0}
              />
            )}
          />
        )}

        {/* SpeedGrader queue tab */}
        {teacherTab === 'queue' && (
          <div>
            {queueAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm text-slate-500">No pending submissions — you&apos;re all caught up.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {queueAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-400">
                        {pendingByAssignment[a.id]} ungraded · {a.due_date ? `Due ${a.due_date}` : ''} · {a.points_possible} pts
                      </p>
                    </div>
                    <Link
                      href={`/course/${course.id}/assignment/${a.id}`}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Grade ⚡
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Syllabus tab */}
        {teacherTab === 'syllabus' && (
          <EditableSyllabusPanel
            courseId={course.id}
            syllabus={syllabus}
            onSaved={setSyllabus}
          />
        )}

        {/* Gradebook tab */}
        {teacherTab === 'gradebook' && (
          gradebookLoading || !gradebookData ? (
            <div className="flex items-center justify-center py-24 text-sm text-slate-400">Loading…</div>
          ) : (
            <Gradebook data={gradebookData} embedded />
          )
        )}

        {teacherTab === 'roster' && (
          <RosterPanel courseId={course.id} initialStudents={enrolledStudents} />
        )}

        {/* Danger zone */}
        {onDelete && (
          <div className="mt-10 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Delete course
            </button>
            <p className="mt-1.5 text-xs text-slate-400">Permanently removes this course and all its data.</p>
          </div>
        )}
      </div>
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
