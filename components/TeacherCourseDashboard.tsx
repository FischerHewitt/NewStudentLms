'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { publishCourse, unpublishCourse } from '@/app/actions/course'
import { assignmentHref, speedgraderHref } from '@/lib/routes'
import type { CourseWithModules, SubmissionSummary } from '@/app/actions/dashboard'
import type { EnrolledStudent } from '@/app/actions/enrollment'

const LI = {
  surfaceLow: '#f6f3f5',
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  alumosPurple: '#7C3AED',
  successGreen: '#10B981',
  alumosOrange: '#F59E0B',
}
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const PUBLISH_GRADIENT = 'linear-gradient(135deg, #10B981 0%, #059669 100%)'

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface Props {
  course: CourseWithModules
  allSubmissions: SubmissionSummary[]
  enrolledStudents: EnrolledStudent[]
}

export function TeacherCourseDashboard({ course, allSubmissions, enrolledStudents }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [courseStatus, setCourseStatus] = useState(course.status)
  const [publishPending, startPublishTransition] = useTransition()

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })

  const handlePublish = () => startPublishTransition(async () => {
    await publishCourse(course.id)
    setCourseStatus('published')
  })

  const handleUnpublish = () => startPublishTransition(async () => {
    await unpublishCourse(course.id)
    setCourseStatus('draft')
  })

  const totalAssignments = course.modules.reduce((s, m) => s + m.assignments.length, 0)
  const submittedCount = allSubmissions.filter((s) => s.status !== 'draft').length
  const pendingCount = allSubmissions.filter((s) => s.status === 'submitted').length

  // Per-assignment first pending submission (for SpeedGrader link)
  const pendingSubByAssignment: Record<string, string> = {}
  for (const sub of allSubmissions) {
    if (sub.status === 'submitted' && !pendingSubByAssignment[sub.assignment_id]) {
      pendingSubByAssignment[sub.assignment_id] = sub.id
    }
  }

  // First pending submission across all assignments (for the hero "Grade N Now" button)
  const firstPendingSubId = allSubmissions.find((s) => s.status === 'submitted')?.id ?? null

  // Recent activity feed
  const recentActivity = allSubmissions.slice(0, 5).map((sub, i) => {
    const student = enrolledStudents[i % Math.max(enrolledStudents.length, 1)]
    const assignment = course.modules.flatMap((m) => m.assignments).find((a) => a.id === sub.assignment_id)
    return { student, assignment, status: sub.status }
  })

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* White command bar header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6 shadow-sm">
        <Link href="/courses" className="mb-1 inline-block text-xs text-slate-400 hover:text-violet-600">
          ← Courses
        </Link>
        <div className="flex items-start justify-between gap-6">
          {/* Left: title + metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
              <Link
                href="/coming-soon"
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-violet-600"
                title="Edit course details (coming soon)"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </Link>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{course.teacherName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {(course.startDate || course.endDate) && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                  {course.startDate ? formatDate(course.startDate) : '—'}
                  {' – '}
                  {course.endDate ? formatDate(course.endDate) : '—'}
                </span>
              )}
              {course.section && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">meeting_room</span>
                  {course.section}
                </span>
              )}
              {course.term && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">school</span>
                  {course.term}
                </span>
              )}
            </div>
          </div>

          {/* Right: status + publish CTA */}
          <div className="flex shrink-0 flex-col items-end gap-3">
            {pendingCount > 0 && firstPendingSubId && (
              <Link
                href={speedgraderHref(course.id, firstPendingSubId)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                style={{ background: AI_GRADIENT }}
              >
                Grade {pendingCount} Now →
              </Link>
            )}
            {courseStatus === 'draft' ? (
              <button
                onClick={handlePublish}
                disabled={publishPending}
                className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: PUBLISH_GRADIENT, boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">rocket_launch</span>
                  {publishPending ? 'Publishing…' : 'Publish course'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
                >
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Published
                </span>
                <button
                  onClick={handleUnpublish}
                  disabled={publishPending}
                  className="text-xs text-slate-400 underline hover:text-slate-600 disabled:opacity-50"
                >
                  {publishPending ? 'Unpublishing…' : 'Unpublish'}
                </button>
              </div>
            )}
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={courseStatus === 'published'
                ? { background: 'rgba(16,185,129,0.1)', color: '#059669' }
                : { background: '#FEF3C7', color: '#92400E' }}
            >
              {courseStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6">
        {/* Stat cards */}
        <div className="-mt-5 mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Students', value: enrolledStudents.length, icon: 'group' },
            { label: 'Assignments', value: totalAssignments, icon: 'list_alt' },
            { label: 'Submitted', value: submittedCount, icon: 'assignment_turned_in' },
            { label: 'Pending', value: pendingCount, icon: 'pending_actions' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: LI.alumosPurple }}>{icon}</span>
              <p className="mt-2 text-2xl font-bold" style={{ color: LI.onSurface, fontFamily: 'var(--font-hanken, system-ui)' }}>{value}</p>
              <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Curriculum accordion (2/3) */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
              Curriculum
            </h2>
            <div className="space-y-2">
              {course.modules.map((mod) => {
                const isOpen = expanded.has(mod.id)
                const modPending = mod.assignments.filter((a) => pendingSubByAssignment[a.id]).length
                return (
                  <div key={mod.id} className="overflow-hidden rounded-2xl" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
                    <button
                      onClick={() => toggle(mod.id)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
                    >
                      <span className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold" style={{ background: LI.alumosPurple + '15', color: LI.alumosPurple }}>
                        Wk {mod.week_number}
                      </span>
                      <span className="flex-1 text-sm font-semibold" style={{ color: LI.onSurface }}>{mod.title}</span>
                      {modPending > 0 && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: LI.alumosOrange }}>
                          {modPending} to grade
                        </span>
                      )}
                      <span className="text-xs" style={{ color: LI.onSurfaceVariant }}>{mod.assignments.length} assignments</span>
                      <span
                        className="material-symbols-outlined text-[18px] transition-transform"
                        style={{ color: LI.onSurfaceVariant, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                      >
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid ' + LI.outlineVariant }}>
                        {mod.assignments.map((a) => {
                          const sub = allSubmissions.find((s) => s.assignment_id === a.id)
                          const pendingSubId = pendingSubByAssignment[a.id]
                          return (
                            <div key={a.id} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid ' + LI.surfaceLow }}>
                              <div
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: sub?.status === 'graded' ? LI.successGreen : sub?.status === 'submitted' ? LI.alumosOrange : LI.outlineVariant }}
                              />
                              <Link
                                href={assignmentHref(course.id, a.id)}
                                className="flex-1 text-sm transition hover:underline"
                                style={{ color: LI.onSurface }}
                              >
                                {a.title}
                              </Link>
                              {a.due_date && (
                                <span className="text-xs tabular-nums" style={{ color: LI.onSurfaceVariant }}>{a.due_date}</span>
                              )}
                              <span className="w-10 text-right text-xs" style={{ color: LI.onSurfaceVariant }}>{a.points_possible}pt</span>
                              {pendingSubId ? (
                                <Link
                                  href={speedgraderHref(course.id, pendingSubId)}
                                  className="shrink-0 rounded-lg px-3 py-1 text-xs font-bold text-white"
                                  style={{ background: AI_GRADIENT }}
                                >
                                  Grade
                                </Link>
                              ) : (
                                <span
                                  className="w-20 text-right text-[10px] font-semibold"
                                  style={{ color: sub?.status === 'graded' ? LI.successGreen : LI.onSurfaceVariant }}
                                >
                                  {sub?.status === 'graded' ? '✓ Graded' : 'No submissions'}
                                </span>
                              )}
                            </div>
                          )
                        })}

                        {/* Add Assignment button */}
                        <div className="px-5 py-2" style={{ borderTop: '1px solid ' + LI.surfaceLow }}>
                          <Link
                            href={`/course/${course.id}/assignment/new?moduleId=${mod.id}`}
                            className="flex items-center gap-1 text-xs font-semibold transition hover:opacity-70"
                            style={{ color: LI.alumosPurple }}
                          >
                            <span className="material-symbols-outlined text-[15px]">add</span>
                            Add Assignment
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Activity Feed + Roster (1/3) */}
          <div className="space-y-4">
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="text-sm font-bold"
                  style={{ background: AI_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >✦</span>
                <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
                  Recent Activity
                </h2>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: AI_GRADIENT }}
                      >
                        {item.student?.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold" style={{ color: LI.onSurface }}>{item.student?.name ?? 'Student'}</p>
                        <p className="truncate text-[11px]" style={{ color: LI.onSurfaceVariant }}>
                          {item.status === 'graded' ? 'Graded' : 'Submitted'} · {item.assignment?.title ?? 'Assignment'}
                        </p>
                      </div>
                      <span
                        className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                        style={
                          item.status === 'graded'
                            ? { background: 'rgba(16,185,129,0.1)', color: LI.successGreen }
                            : { background: 'rgba(245,158,11,0.1)', color: LI.alumosOrange }
                        }
                      >
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
                Roster · {enrolledStudents.length}
              </h2>
              {enrolledStudents.length === 0 ? (
                <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>No students enrolled yet.</p>
              ) : (
                <ul className="space-y-2">
                  {enrolledStudents.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: AI_GRADIENT }}
                      >
                        {s.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <span className="flex-1 truncate text-xs font-medium" style={{ color: LI.onSurface }}>{s.name || s.email}</span>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                        style={
                          s.status === 'active'
                            ? { background: 'rgba(16,185,129,0.1)', color: LI.successGreen }
                            : { background: LI.surfaceLow, color: LI.onSurfaceVariant }
                        }
                      >
                        {s.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
