'use client'

import Link from 'next/link'
import { courseHref } from '@/lib/routes'
import type { TeacherDashboardData, TeacherCourseSummary, AssignmentGradingRow } from '@/lib/teacher-dashboard'
import { teacherCoachHint } from '@/lib/teacher-dashboard'
import type { UpcomingDeadline } from '@/lib/deadlines'

// Luminous Intelligence color tokens — inline until CSS vars / Tailwind tokens are validated in browser
const LI = {
  surface: '#fcf8fa',
  surfaceLow: '#f6f3f5',
  surfaceContainer: '#f0edef',
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  secondary: '#9d4300',
  alumosPurple: '#7C3AED',
  alumosPink: '#EC4899',
  alumosOrange: '#F59E0B',
  successGreen: '#10B981',
  errorRed: '#ba1a1a',
}

const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

const COURSE_ACCENTS = [
  '#7C3AED',
  '#F59E0B',
  '#EC4899',
  '#10B981',
  '#3B82F6',
  '#F97316',
]

type CourseDraft = { courseId: string; title: string; draftKey: string; createdAt: string }

// ─── Root ────────────────────────────────────────────────────────────────────

export function TeacherDashboard({
  data,
  deadlines = [],
  onPublish,
  onUnpublish,
  onOpenCourse: _onOpenCourse,
  onDiscardDraft: _onDiscardDraft,
  drafts: _drafts,
}: {
  data: TeacherDashboardData
  deadlines?: UpcomingDeadline[]
  onPublish?: (courseId: string) => void
  onUnpublish?: (courseId: string) => void
  onOpenCourse?: (courseId: string) => void
  onDiscardDraft?: (courseId: string) => void
  drafts?: CourseDraft[]
}) {
  const { courses } = data
  const hint = teacherCoachHint(courses)

  return (
    <div className="max-w-[1280px]">
      {/* #66 AI Co-pilot Insights banner */}
      <AiBanner hint={hint} />

      {/* Main grid: left 2/3, right 1/3 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* #64 Active Courses Overview */}
          <ActiveCoursesSection
            courses={courses}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
          {/* #65 Needs Grading */}
          <NeedsGradingSection gradingQueue={data.gradingQueue} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* #67 Deadlines */}
          <DeadlinesSection deadlines={deadlines} />
          {/* Upload Solution recommendations */}
          <UploadSolutionSection courses={courses} />
        </div>
      </div>
    </div>
  )
}

// ─── #66 AI Co-pilot Insights Banner ─────────────────────────────────────────

function AiBanner({ hint }: { hint: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: '#fff',
        border: '1px solid ' + LI.outlineVariant,
        borderTop: '3px solid #7C3AED',
        borderLeft: '4px solid #7C3AED',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: AI_GRADIENT }}
            aria-hidden="true"
          >
            ✦
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: LI.onSurfaceVariant }}
            >
              AI Co-pilot Insights
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: LI.onSurface }}>
              {hint}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50"
          style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}
        >
          Review Analytics
        </button>
      </div>
    </div>
  )
}

// ─── #64 Active Courses Overview ─────────────────────────────────────────────

function ActiveCoursesSection({
  courses,
  onPublish,
  onUnpublish,
}: {
  courses: TeacherCourseSummary[]
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
}) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: LI.onSurfaceVariant }}
        >
          <span>☰</span> Active Courses Overview
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)' }}
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add Course
          </Link>
          <Link
            href="/courses"
            className="text-xs font-semibold transition hover:underline"
            style={{ color: LI.alumosPurple }}
          >
            View All
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm" style={{ color: LI.onSurfaceVariant }}>
          No active courses yet.{' '}
          <Link href="/generate" style={{ color: LI.alumosPurple }}>
            Create one →
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              accentColor={COURSE_ACCENTS[i % COURSE_ACCENTS.length]}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CourseCard({
  course,
  accentColor,
  onPublish,
  onUnpublish,
}: {
  course: TeacherCourseSummary
  accentColor: string
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
}) {
  return (
    <div
      className="relative flex flex-col gap-3 rounded-xl p-4"
      style={{ background: LI.surfaceLow, border: '1px solid ' + LI.outlineVariant }}
    >
      {/* Overlay link — covers whole card; buttons sit on z-10 above it */}
      <Link href={courseHref(course.id)} className="absolute inset-0 rounded-xl" aria-label={`Open ${course.title}`} />
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold" style={{ color: LI.onSurface }}>
            {course.title}
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: LI.onSurfaceVariant }}>
            {course.students} Students
          </p>
        </div>
        <div className="shrink-0">
          {course.status === 'draft' ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: LI.surfaceContainer, color: LI.onSurfaceVariant }}
            >
              Draft
            </span>
          ) : (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
              style={{
                background:
                  course.health === 'urgent'
                    ? 'rgba(186,26,26,0.1)'
                    : course.health === 'watch'
                      ? 'rgba(245,158,11,0.1)'
                      : 'rgba(16,185,129,0.1)',
                color:
                  course.health === 'urgent'
                    ? LI.errorRed
                    : course.health === 'watch'
                      ? LI.alumosOrange
                      : LI.successGreen,
              }}
            >
              {course.health}
            </span>
          )}
        </div>
      </div>

      {/* Class average + progress bar */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: LI.onSurfaceVariant }}>
            Class Average
          </span>
          <span className="text-xs font-bold" style={{ color: LI.onSurface }}>
            {course.classAverage !== null ? `${course.classAverage}%` : '—'}
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: LI.outlineVariant }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: course.classAverage !== null ? `${course.classAverage}%` : '0%',
              background: accentColor,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      {onPublish && course.status === 'draft' && (
        <button
          type="button"
          onClick={() => onPublish(course.id)}
          className="relative z-10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          style={{ background: LI.alumosPurple }}
        >
          Publish course
        </button>
      )}
      {onUnpublish && course.status === 'published' && (
        <button
          type="button"
          onClick={() => onUnpublish(course.id)}
          className="relative z-10 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50"
          style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}
        >
          Unpublish
        </button>
      )}
    </div>
  )
}

// ─── #65 Needs Grading ────────────────────────────────────────────────────────

function NeedsGradingSection({ gradingQueue }: { gradingQueue: AssignmentGradingRow[] }) {
  const totalGraded = gradingQueue.reduce((s, r) => s + r.gradedCount, 0)
  const totalSubmissions = gradingQueue.reduce((s, r) => s + r.totalSubmissions, 0)
  const overallPct = totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0

  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: LI.onSurfaceVariant }}
        >
          <span>≡</span> Needs Grading
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:bg-slate-50"
            style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}
          >
            <span className="material-symbols-outlined text-[14px]">edit_note</span>
            Manual
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: AI_GRADIENT }}
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI Grade
          </button>
          <Link
            href="/gradebook"
            className="text-xs font-semibold transition hover:underline"
            style={{ color: LI.alumosPurple }}
          >
            View All
          </Link>
        </div>
      </div>

      {gradingQueue.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-2xl" aria-hidden="true">
            ✓
          </span>
          <p className="text-sm font-semibold" style={{ color: LI.successGreen }}>
            All caught up
          </p>
          <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>
            No assignments need grading right now.
          </p>
        </div>
      ) : (
        <>
          {/* Overall progress bar */}
          <div
            className="mb-4 rounded-xl p-4"
            style={{ background: LI.surfaceLow, border: '1px solid ' + LI.outlineVariant }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>
                Total Assignments Graded —{' '}
                <span className="font-semibold" style={{ color: LI.onSurface }}>
                  {totalGraded}/{totalSubmissions} total
                </span>
              </p>
              <span className="text-sm font-bold" style={{ color: LI.alumosPurple }}>
                {overallPct}%
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full"
              style={{ background: LI.outlineVariant }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPct}%`, background: LI.alumosPurple }}
              />
            </div>
          </div>

          {/* Per-assignment rows */}
          <div className="divide-y" style={{ borderColor: LI.outlineVariant }}>
            {gradingQueue.map((row) => (
              <GradingRow key={row.id} row={row} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function GradingRow({ row }: { row: AssignmentGradingRow }) {
  const isStarted = row.gradedCount > 0

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: LI.onSurface }}>
          {row.title}
        </p>
        <p className="mt-0.5 truncate text-xs" style={{ color: LI.onSurfaceVariant }}>
          {row.courseName}
          {row.dueDateLabel ? ` • ${row.dueDateLabel}` : ''}
        </p>
      </div>

      <div className="shrink-0 text-right text-xs">
        <p className="font-semibold" style={{ color: LI.onSurface }}>
          {row.gradedCount}/{row.totalSubmissions} Graded
        </p>
        <p style={{ color: LI.onSurfaceVariant }}>{row.gradedPct}%</p>
      </div>

      <Link
        href={`/course/${row.courseId}`}
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition hover:opacity-90"
        style={
          isStarted
            ? {
                background: LI.surfaceLow,
                border: '1px solid ' + LI.outlineVariant,
                color: LI.onSurfaceVariant,
              }
            : {
                background: LI.secondary,
                color: '#fff',
              }
        }
      >
        {isStarted ? 'Resume' : 'Grade Now'}
      </Link>
    </div>
  )
}

// ─── #67 Deadlines ────────────────────────────────────────────────────────────

function DeadlinesSection({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: LI.onSurfaceVariant }}
        >
          <span>📅</span> Deadlines
        </h2>
        <button
          type="button"
          className="rounded p-1 text-sm transition hover:bg-slate-100"
          style={{ color: LI.onSurfaceVariant }}
          aria-label="Deadline options"
        >
          ···
        </button>
      </div>

      {deadlines.length === 0 ? (
        <p className="text-sm" style={{ color: LI.onSurfaceVariant }}>
          No upcoming deadlines
        </p>
      ) : (
        <ul className="space-y-3">
          {deadlines.map((d, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    d.daysUntilDue === 0
                      ? LI.errorRed
                      : d.daysUntilDue <= 2
                        ? LI.alumosOrange
                        : LI.alumosPurple,
                }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: LI.onSurface }}>
                  {d.assignmentTitle}
                </p>
                <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>
                  {d.courseName}
                  {' · '}
                  {d.daysUntilDue === 0
                    ? 'Due today'
                    : d.daysUntilDue === 1
                      ? 'Tomorrow'
                      : `In ${d.daysUntilDue} days`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="mt-5 w-full rounded-lg border py-2 text-xs font-semibold transition hover:bg-slate-50"
        style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}
      >
        View Calendar
      </button>
    </section>
  )
}

// ─── Upload Solution recommendations ─────────────────────────────────────────

function UploadSolutionSection({ courses }: { courses: TeacherCourseSummary[] }) {
  const missing = courses.filter((c) => c.solutionStatus !== 'uploaded' && c.status === 'published')
  if (missing.length === 0) return null

  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]" style={{ color: LI.alumosOrange }}>
          upload_file
        </span>
        <h2
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: LI.onSurfaceVariant }}
        >
          Upload Solution
        </h2>
      </div>

      <p className="mb-4 text-xs leading-relaxed" style={{ color: LI.onSurfaceVariant }}>
        Upload answer keys to enable AI-assisted grading for these courses.
      </p>

      <ul className="space-y-2">
        {missing.map((course) => (
          <li
            key={course.id}
            className="flex items-center justify-between gap-3 rounded-xl p-3"
            style={{ background: LI.surfaceLow, border: '1px solid ' + LI.outlineVariant }}
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: LI.onSurface }}>
                {course.title}
              </p>
              <p className="text-[10px]" style={{ color: LI.onSurfaceVariant }}>
                {course.students} students
                {course.solutionStatus === 'needs-update' ? ' · needs update' : ' · no solution'}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white transition hover:opacity-90"
              style={{ background: LI.alumosOrange }}
            >
              Upload
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
