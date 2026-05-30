'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { TeacherDashboardData, TeacherCourseSummary, CourseHealth, SolutionStatus } from '@/lib/teacher-dashboard'
import { teacherCoachHint } from '@/lib/teacher-dashboard'
import { courseHref } from '@/lib/routes'

const COURSE_COLORS = ['indigo', 'emerald', 'amber', 'violet', 'rose', 'teal'] as const
type CourseColor = typeof COURSE_COLORS[number]

const ACCENT_BAR: Record<CourseColor, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  teal: 'bg-teal-500',
}

const PROGRESS_BAR: Record<CourseColor, string> = {
  indigo: 'bg-indigo-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
  teal: 'bg-teal-400',
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function TeacherDashboard({
  data,
  onOpenCourse,
}: {
  data: TeacherDashboardData
  onOpenCourse?: (courseId: string) => void
}) {
  const { courses, stats } = data
  const [selectedId, setSelectedId] = useState<string>(courses[0]?.id ?? '')
  const selected = courses.find((c) => c.id === selectedId) ?? courses[0] ?? null
  const hint = teacherCoachHint(courses)

  if (courses.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative left-1/2 w-[calc(100vw-3rem)] max-w-[82rem] -translate-x-1/2 pb-10">
      {/* Page header */}
      <header className="mb-5 flex items-end justify-between gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Your courses</h1>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Upload solution
          </button>
          <Link
            href="/generate"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Create course
          </Link>
        </div>
      </header>

      {/* Stat bar */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatWidget
          label="Pending grades"
          value={String(stats.totalPending)}
          note="across all courses"
          accent="rose"
        />
        <StatWidget
          label="AI-ready to grade"
          value={String(stats.aiReady)}
          note="solution uploaded"
          accent="indigo"
        />
        <StatWidget
          label="Solution gaps"
          value={String(stats.solutionGaps)}
          note="missing or stale"
          accent="amber"
        />
        <StatWidget
          label="Due next"
          value={stats.nextDue ? stats.nextDue.split(',')[0] : '—'}
          note={stats.nextDue ? stats.nextDue.split(',').slice(1).join(',').trim() : 'no upcoming deadlines'}
          accent="slate"
        />
      </div>

      {/* Gallery + context panel */}
      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-5">
        {/* Course cards — 3-col normally, 2-col when count doesn't divide evenly into 3 */}
        <main className={`grid items-start gap-4 ${courses.length % 3 === 1 && courses.length > 1 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {courses.map((course, index) => {
            const color = COURSE_COLORS[index % COURSE_COLORS.length]
            return (
              <CourseCard
                key={course.id}
                course={course}
                color={color}
                isSelected={course.id === selectedId}
                onSelect={() => setSelectedId(course.id)}
                onOpenCourse={onOpenCourse}
              />
            )
          })}
        </main>

        {/* Context panel */}
        {selected && (
          <aside className="space-y-3">
            <SelectedCoursePanel course={selected} onOpenCourse={onOpenCourse} />
            <GradingQueueWidget course={selected} onOpenCourse={onOpenCourse} />
            <TeacherCoachWidget hint={hint} />
          </aside>
        )}
      </div>
    </div>
  )
}

// ─── Stat bar ────────────────────────────────────────────────────────────────

function StatWidget({
  label,
  value,
  note,
  accent,
}: {
  label: string
  value: string
  note: string
  accent: 'rose' | 'indigo' | 'amber' | 'slate'
}) {
  const colors = {
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    slate: 'bg-white border-slate-200 text-slate-700',
  }
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${colors[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] font-semibold opacity-60">{note}</p>
    </div>
  )
}

// ─── Course card ─────────────────────────────────────────────────────────────

function CourseCard({
  course,
  color,
  isSelected,
  onSelect,
  onOpenCourse,
}: {
  course: TeacherCourseSummary
  color: CourseColor
  isSelected: boolean
  onSelect: () => void
  onOpenCourse?: (courseId: string) => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-72 w-full flex-col rounded-lg border bg-white p-5 text-left shadow-sm transition ${
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className={`mb-5 h-2 rounded-full ${ACCENT_BAR[color]}`} />

      <div className="flex items-start justify-between gap-4">
        <h2
          onClick={(e) => { e.stopPropagation(); onOpenCourse?.(course.id) }}
          className="text-lg font-bold leading-tight text-slate-950 hover:text-indigo-600 hover:underline cursor-pointer"
        >
          {course.title}
        </h2>
        <HealthBadge health={course.health} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Students" value={String(course.students)} />
        <Metric label="Pending" value={String(course.pendingGrades)} />
        <Metric label="Submitted" value={`${course.submittedRate}%`} />
        <Metric label="Graded" value={`${course.gradedRate}%`} />
      </div>

      {/* Submission progress bar */}
      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-slate-100">
          <div
            className={`h-1.5 rounded-full ${PROGRESS_BAR[color]}`}
            style={{ width: `${course.submittedRate}%` }}
          />
        </div>
      </div>

      {/* Next due */}
      <div className="mt-auto pt-4">
        <div className="rounded-md bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Next Due
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-700">
            {course.nextDue ?? 'No upcoming deadlines'}
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Context panel ────────────────────────────────────────────────────────────

function SelectedCoursePanel({
  course,
  onOpenCourse,
}: {
  course: TeacherCourseSummary
  onOpenCourse?: (courseId: string) => void
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Selected Course
      </p>
      <h2 className="mt-2 text-xl font-bold text-slate-950">{course.title}</h2>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => onOpenCourse?.(course.id)}
          className="block w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open course dashboard
        </button>
        <button
          type="button"
          onClick={() => onOpenCourse?.(course.id)}
          className="block w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Review grading queue
        </button>
        <button
          type="button"
          disabled={course.solutionStatus === 'missing'}
          className={`block w-full rounded-md border px-3 py-2 text-left text-sm font-semibold ${
            course.solutionStatus === 'missing'
              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          View uploaded solution
        </button>
        <button
          type="button"
          className="block w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Ask Teacher Coach
        </button>
      </div>
    </section>
  )
}

function GradingQueueWidget({
  course,
  onOpenCourse,
}: {
  course: TeacherCourseSummary
  onOpenCourse?: (courseId: string) => void
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Grading Queue</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            course.pendingGrades > 0
              ? 'bg-rose-50 text-rose-600'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {course.pendingGrades} pending
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {course.recentSubmissions.length > 0 ? (
          course.recentSubmissions.map((s) => (
            <div
              key={s.submissionId}
              className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
            >
              <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
                {s.assignmentTitle}
              </p>
              <button
                type="button"
                onClick={() => onOpenCourse?.(course.id)}
                className="shrink-0 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
              >
                Grade
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400">No submissions waiting.</p>
        )}
      </div>
    </section>
  )
}

function TeacherCoachWidget({ hint }: { hint: string }) {
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
        Teacher Coach
      </p>
      <p className="mt-2 text-sm font-semibold text-indigo-950">"{hint}"</p>
      <button
        type="button"
        className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
      >
        Ask a question →
      </button>
    </section>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl pt-16 text-center">
      <p className="text-lg font-bold text-slate-800">No courses yet</p>
      <p className="mt-2 text-sm text-slate-500">
        Paste your syllabus and let AI build the course structure for you.
      </p>
      <Link
        href="/generate"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
      >
        Create course from syllabus →
      </Link>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-slate-950`}>{value}</p>
    </div>
  )
}

function HealthBadge({ health }: { health: CourseHealth }) {
  const cls =
    health === 'urgent'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : health === 'watch'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {health}
    </span>
  )
}

function solutionLabel(status: SolutionStatus) {
  if (status === 'uploaded') return 'Uploaded'
  if (status === 'needs-update') return 'Update'
  return 'Missing'
}
