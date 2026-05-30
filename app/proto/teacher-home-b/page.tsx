// PROTOTYPE - throwaway. Delete or absorb after design decision.
// Six variations of teacher-home prototype B, switchable via ?variant=, on /proto/teacher-home-b.

'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeSwitcher } from '@/components/prototype/PrototypeSwitcher'

type CourseHealth = 'steady' | 'watch' | 'urgent'

type PortfolioCourse = {
  id: string
  code: string
  title: string
  students: number
  pendingGrades: number
  submittedRate: number
  nextDue: string
  solutionStatus: 'missing' | 'uploaded' | 'needs-update'
  health: CourseHealth
  color: 'indigo' | 'emerald' | 'amber'
}

const courses: PortfolioCourse[] = [
  {
    id: 'bio-111',
    code: 'BIO 111',
    title: 'Biology and Society',
    students: 28,
    pendingGrades: 11,
    submittedRate: 77,
    nextDue: 'Lab Notebook 2, tomorrow',
    solutionStatus: 'uploaded',
    health: 'urgent',
    color: 'indigo',
  },
  {
    id: 'coms-101',
    code: 'COMS 101',
    title: 'Public Speaking',
    students: 22,
    pendingGrades: 4,
    submittedRate: 83,
    nextDue: 'Delivery Analysis, Friday',
    solutionStatus: 'missing',
    health: 'watch',
    color: 'emerald',
  },
  {
    id: 'math-143',
    code: 'MATH 143',
    title: 'College Algebra',
    students: 31,
    pendingGrades: 2,
    submittedRate: 86,
    nextDue: 'Problem Set 7, Monday',
    solutionStatus: 'needs-update',
    health: 'steady',
    color: 'amber',
  },
]

const activity = [
  { time: '8:15 AM', course: 'BIO 111', title: 'Jordan Kim submitted Lab Notebook 2', action: 'Grade' },
  { time: '9:40 AM', course: 'COMS 101', title: 'Delivery Analysis closes Friday', action: 'Review' },
  { time: '10:30 AM', course: 'MATH 143', title: 'Problem Set 7 solution needs update', action: 'Open' },
  { time: '1:00 PM', course: 'BIO 111', title: 'Section B meets after lunch', action: 'Prep' },
]

const variants = [
  { id: 'a', label: 'Portfolio Gallery' },
  { id: 'b', label: 'Health Board' },
  { id: 'c', label: 'Teaching Timeline' },
  { id: 'd', label: 'Gallery + Stat Bar' },
  { id: 'e', label: 'Gallery + Bento' },
  { id: 'f', label: 'Wide Cards' },
]

function TeacherHomeBPrototype() {
  const params = useSearchParams()
  const variant = params.get('variant') ?? 'a'

  return (
    <div className="min-h-[calc(100vh-9rem)] pb-24">
      {variant === 'b' ? (
        <VariantHealthBoard />
      ) : variant === 'c' ? (
        <VariantTeachingTimeline />
      ) : variant === 'd' ? (
        <VariantGalleryStatBar />
      ) : variant === 'e' ? (
        <VariantGalleryBento />
      ) : variant === 'f' ? (
        <VariantWideCards />
      ) : (
        <VariantPortfolioGallery />
      )}
      <PrototypeSwitcher variants={variants} current={variant} />
    </div>
  )
}

function VariantPortfolioGallery() {
  const [selectedId, setSelectedId] = useState(courses[0].id)
  const selected = courses.find((course) => course.id === selectedId) ?? courses[0]

  return (
    <PrototypeCanvas>
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Portfolio Gallery
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Choose a course, then act
          </h1>
        </div>
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

      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-5">
        <main className="grid grid-cols-3 items-start gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedId(course.id)}
              className={`flex min-h-72 flex-col rounded-lg border bg-white p-5 text-left shadow-sm transition ${
                selected.id === course.id
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className={`mb-5 h-2 rounded-full ${courseAccent(course.color)}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {course.code}
                    </p>
                    <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950">
                      {course.title}
                    </h2>
                  </div>
                  <HealthBadge health={course.health} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Metric label="Students" value={String(course.students)} />
                  <Metric label="Pending" value={String(course.pendingGrades)} />
                  <Metric label="Submitted" value={`${course.submittedRate}%`} />
                  <Metric label="Solution" value={solutionLabel(course.solutionStatus)} compact />
                </div>
              </div>

              <div className="mt-auto rounded-md bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Next Due
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{course.nextDue}</p>
              </div>
            </button>
          ))}
        </main>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Selected Course
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{selected.code}</h2>
            <p className="text-sm text-slate-500">{selected.title}</p>
            <div className="mt-4 space-y-2">
              <ActionButton label="Open course dashboard" />
              <ActionButton label="Review grading queue" />
              <ActionButton label="View uploaded solution" muted={selected.solutionStatus === 'missing'} />
              <ActionButton label="Ask Teacher Coach" />
            </div>
          </section>
          <ActivityPanel />
        </aside>
      </div>
    </PrototypeCanvas>
  )
}

function VariantHealthBoard() {
  const groups: { title: string; health: CourseHealth; description: string }[] = [
    { title: 'Needs Action', health: 'urgent', description: 'Open grading load or time-sensitive course work.' },
    { title: 'Watch', health: 'watch', description: 'Healthy, but one or two things could drift.' },
    { title: 'Steady', health: 'steady', description: 'No immediate intervention needed.' },
  ]

  return (
    <PrototypeCanvas>
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_24rem] gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Health Board
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Courses grouped by attention level
          </h1>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Teacher Coach
          </p>
          <p className="mt-2 text-sm font-semibold text-indigo-950">
            “Start with BIO 111. The solution is uploaded and 11 submissions are ready.”
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {groups.map((group) => (
          <section key={group.health} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900">{group.title}</h2>
                <HealthBadge health={group.health} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{group.description}</p>
            </div>
            <div className="space-y-3 p-3">
              {courses
                .filter((course) => course.health === group.health)
                .map((course) => (
                  <article key={course.id} className="rounded-md border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {course.code}
                        </p>
                        <h3 className="mt-1 font-bold text-slate-950">{course.title}</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {course.pendingGrades}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <BoardLine label="Next" value={course.nextDue} />
                      <BoardLine label="Submitted" value={`${course.submittedRate}%`} />
                      <BoardLine label="Solution" value={solutionLabel(course.solutionStatus)} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Open
                      </button>
                      <button className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                        Work
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Solution Coverage</h2>
          <button className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage answer keys
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-md bg-slate-50 px-3 py-3">
              <p className="text-xs font-bold text-slate-900">{course.code}</p>
              <p className="mt-1 text-xs text-slate-500">{solutionSentence(course.solutionStatus)}</p>
            </div>
          ))}
        </div>
      </section>
    </PrototypeCanvas>
  )
}

function VariantTeachingTimeline() {
  const [activeDay, setActiveDay] = useState<'today' | 'week'>('today')

  return (
    <PrototypeCanvas className="grid grid-cols-[19rem_minmax(0,1fr)] gap-5">
      <aside className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Teaching Timeline
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Today across courses
          </h1>
          <div className="mt-4 flex rounded-md border border-slate-200 bg-slate-50 p-1">
            {(['today', 'week'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveDay(value)}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-semibold capitalize ${
                  activeDay === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Course Stack</h2>
          <div className="mt-3 space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-md border border-slate-200 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-slate-900">{course.code}</p>
                  <HealthBadge health={course.health} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{course.nextDue}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <main className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-bold text-slate-900">
              {activeDay === 'today' ? "Today's Teaching Plan" : 'This Week'}
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {activity.map((item) => (
              <div key={`${item.time}-${item.title}`} className="grid grid-cols-[5rem_7rem_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
                <p className="text-xs font-semibold text-slate-400">{item.time}</p>
                <p className="rounded-full bg-slate-100 px-2 py-1 text-center text-xs font-bold text-slate-700">
                  {item.course}
                </p>
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{item.title}</p>
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4">
          {courses.map((course) => (
            <article key={course.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {course.code}
              </p>
              <h3 className="mt-1 min-h-12 text-base font-bold leading-tight text-slate-950">
                {course.title}
              </h3>
              <div className="mt-4 space-y-2">
                <TimelineStat label="Pending grades" value={String(course.pendingGrades)} />
                <TimelineStat label="Solution" value={solutionLabel(course.solutionStatus)} />
                <TimelineStat label="Submissions" value={`${course.submittedRate}%`} />
              </div>
            </article>
          ))}
        </section>
      </main>
    </PrototypeCanvas>
  )
}

function PrototypeCanvas({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative left-1/2 w-[calc(100vw-3rem)] max-w-[82rem] -translate-x-1/2 ${className}`}
    >
      {children}
    </div>
  )
}

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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-slate-950`}>
        {value}
      </p>
    </div>
  )
}

function ActionButton({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <button
      type="button"
      className={`block w-full rounded-md border px-3 py-2 text-left text-sm font-semibold ${
        muted
          ? 'border-slate-200 bg-slate-50 text-slate-400'
          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

function ActivityPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
      <div className="mt-3 space-y-3">
        {activity.slice(0, 3).map((item) => (
          <div key={item.title} className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-900">{item.course}</p>
            <p className="mt-1 text-xs text-slate-500">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function BoardLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-right text-xs font-semibold text-slate-700">{value}</span>
    </div>
  )
}

function TimelineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-900">{value}</span>
    </div>
  )
}

function HealthBadge({ health }: { health: CourseHealth }) {
  const className =
    health === 'urgent'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : health === 'watch'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${className}`}>
      {health}
    </span>
  )
}

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

function courseAccent(color: PortfolioCourse['color']) {
  if (color === 'emerald') return 'bg-emerald-500'
  if (color === 'amber') return 'bg-amber-500'
  return 'bg-indigo-500'
}

function solutionLabel(status: PortfolioCourse['solutionStatus']) {
  if (status === 'uploaded') return 'Uploaded'
  if (status === 'needs-update') return 'Update'
  return 'Missing'
}

function solutionSentence(status: PortfolioCourse['solutionStatus']) {
  if (status === 'uploaded') return 'Solution uploaded and ready for teacher review.'
  if (status === 'needs-update') return 'Solution exists, but should be replaced before grading.'
  return 'No solution uploaded yet.'
}

// ─── Variant D: Gallery + Stat Bar ───────────────────────────────────────────
// Same card grid as A, but adds a top row of aggregate stat widgets and the
// selected-course panel gains a grading queue and Teacher Coach widget.

function VariantGalleryStatBar() {
  const [selectedId, setSelectedId] = useState(courses[0].id)
  const selected = courses.find((c) => c.id === selectedId) ?? courses[0]
  const totalPending = courses.reduce((s, c) => s + c.pendingGrades, 0)
  const solutionGaps = courses.filter((c) => c.solutionStatus !== 'uploaded').length

  return (
    <PrototypeCanvas>
      <header className="mb-5 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Gallery + Stat Bar
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Your courses at a glance
          </h1>
        </div>
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
        <StatWidget label="Pending grades" value={String(totalPending)} accent="rose" note="across all courses" />
        <StatWidget label="AI-ready to grade" value="11" accent="indigo" note="solution uploaded" />
        <StatWidget label="Solution gaps" value={String(solutionGaps)} accent="amber" note="missing or stale" />
        <StatWidget label="Due next" value="Tomorrow" accent="slate" note="Lab Notebook 2 · BIO 111" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-5">
        <main className="grid grid-cols-3 items-start gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedId(course.id)}
              className={`flex min-h-72 flex-col rounded-lg border bg-white p-5 text-left shadow-sm transition ${
                selected.id === course.id
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`mb-5 h-2 rounded-full ${courseAccent(course.color)}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{course.code}</p>
                  <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950">{course.title}</h2>
                </div>
                <HealthBadge health={course.health} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label="Students" value={String(course.students)} />
                <Metric label="Pending" value={String(course.pendingGrades)} />
                <Metric label="Submitted" value={`${course.submittedRate}%`} />
                <Metric label="Solution" value={solutionLabel(course.solutionStatus)} compact />
              </div>
              {/* Submission progress bar */}
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Submission rate</span>
                  <span>{course.submittedRate}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div
                    className={`h-1.5 rounded-full ${courseAccent(course.color)}`}
                    style={{ width: `${course.submittedRate}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </main>

        <aside className="space-y-3">
          {/* Selected course actions */}
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Selected Course</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{selected.code}</h2>
            <p className="text-sm text-slate-500">{selected.title}</p>
            <div className="mt-4 space-y-2">
              <ActionButton label="Open course dashboard" />
              <ActionButton label="Review grading queue" />
              <ActionButton label="View uploaded solution" muted={selected.solutionStatus === 'missing'} />
              <ActionButton label="Ask Teacher Coach" />
            </div>
          </section>

          {/* Grading queue widget */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Grading Queue</h2>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                {selected.pendingGrades} pending
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {activity
                .filter((a) => a.course === selected.code)
                .slice(0, 2)
                .map((a) => (
                  <div key={a.title} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                    <p className="min-w-0 truncate text-xs font-semibold text-slate-700">{a.title}</p>
                    <button className="shrink-0 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white">
                      {a.action}
                    </button>
                  </div>
                ))}
              {activity.filter((a) => a.course === selected.code).length === 0 && (
                <p className="text-xs text-slate-400">No recent activity.</p>
              )}
            </div>
          </section>

          {/* Teacher Coach widget */}
          <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Teacher Coach</p>
            <p className="mt-2 text-sm font-semibold text-indigo-950">
              &ldquo;Start with BIO 111 — solution is uploaded and 11 submissions are waiting.&rdquo;
            </p>
            <button className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">
              Ask a question →
            </button>
          </section>
        </aside>
      </div>
    </PrototypeCanvas>
  )
}

// ─── Variant E: Gallery + Bento ───────────────────────────────────────────────
// Same card grid as A, but the entire right column is a bento grid of four
// distinct widgets: Teacher Coach, grading queue breakdown, solution coverage,
// and upcoming deadlines.

function VariantGalleryBento() {
  const [selectedId, setSelectedId] = useState(courses[0].id)
  const selected = courses.find((c) => c.id === selectedId) ?? courses[0]

  const deadlines = [
    { label: 'Lab Notebook 2', course: 'BIO 111', when: 'Tomorrow', urgent: true },
    { label: 'Delivery Analysis', course: 'COMS 101', when: 'Friday', urgent: false },
    { label: 'Problem Set 7', course: 'MATH 143', when: 'Monday', urgent: false },
  ]

  return (
    <PrototypeCanvas>
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Gallery + Bento</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Choose a course, then act</h1>
        </div>
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

      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-5">
        {/* Course cards */}
        <main className="grid grid-cols-3 items-start gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedId(course.id)}
              className={`flex min-h-72 flex-col rounded-lg border bg-white p-5 text-left shadow-sm transition ${
                selected.id === course.id
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`mb-5 h-2 rounded-full ${courseAccent(course.color)}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{course.code}</p>
                  <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950">{course.title}</h2>
                </div>
                <HealthBadge health={course.health} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Metric label="Students" value={String(course.students)} />
                <Metric label="Pending" value={String(course.pendingGrades)} />
                <Metric label="Submitted" value={`${course.submittedRate}%`} />
                <Metric label="Solution" value={solutionLabel(course.solutionStatus)} compact />
              </div>
              <div className="mt-auto rounded-md bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next Due</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{course.nextDue}</p>
              </div>
            </button>
          ))}
        </main>

        {/* Bento sidebar */}
        <aside className="grid grid-cols-1 gap-3">
          {/* Teacher Coach — full width */}
          <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Teacher Coach</p>
            <p className="mt-2 text-sm font-semibold text-indigo-950">
              &ldquo;Start with BIO 111 — solution is uploaded and 11 submissions are waiting.&rdquo;
            </p>
            <button className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">Ask a question →</button>
          </section>

          {/* 2-up row: grading queue + solution coverage */}
          <div className="grid grid-cols-2 gap-3">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Grading</p>
              <div className="mt-3 space-y-2">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{c.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      c.pendingGrades >= 10 ? 'bg-rose-50 text-rose-600' : c.pendingGrades > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.pendingGrades}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Solutions</p>
              <div className="mt-3 space-y-2">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{c.code}</span>
                    <span className={`text-xs font-semibold ${
                      c.solutionStatus === 'uploaded' ? 'text-emerald-600' : c.solutionStatus === 'needs-update' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {solutionLabel(c.solutionStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Upcoming deadlines */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h2>
            <div className="mt-3 space-y-2">
              {deadlines.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">{d.label}</p>
                    <p className="text-[11px] text-slate-400">{d.course}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    d.urgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {d.when}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Selected course actions */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {selected.code} · Actions
            </p>
            <div className="mt-3 space-y-2">
              <ActionButton label="Open course dashboard" />
              <ActionButton label="Review grading queue" />
              <ActionButton label="View uploaded solution" muted={selected.solutionStatus === 'missing'} />
            </div>
          </section>
        </aside>
      </div>
    </PrototypeCanvas>
  )
}

// ─── Variant F: Wide Cards ────────────────────────────────────────────────────
// Two-column card grid with much richer cards: submission progress bar,
// inline grading queue preview, solution status pill, and per-card action
// buttons. No separate sidebar — everything lives on the card.

function VariantWideCards() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <PrototypeCanvas>
      <header className="mb-5 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Wide Cards</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your courses</h1>
        </div>
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

      {/* Teacher Coach banner */}
      <div className="mb-5 flex items-center gap-4 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Teacher Coach</p>
        <p className="text-sm font-semibold text-indigo-900">
          &ldquo;Start with BIO 111 — solution is uploaded and 11 submissions are waiting.&rdquo;
        </p>
        <button className="ml-auto shrink-0 text-xs font-semibold text-indigo-600 hover:underline">
          Ask a question →
        </button>
      </div>

      <main className="grid grid-cols-2 gap-4">
        {courses.map((course) => {
          const isSelected = selectedId === course.id
          const courseActivity = activity.filter((a) => a.course === course.code)
          return (
            <article
              key={course.id}
              className={`rounded-lg border bg-white shadow-sm transition ${
                isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
              }`}
            >
              {/* Card header */}
              <div className={`h-2 rounded-t-lg ${courseAccent(course.color)}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{course.code}</p>
                    <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">{course.title}</h2>
                  </div>
                  <HealthBadge health={course.health} />
                </div>

                {/* Metrics row */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <Metric label="Students" value={String(course.students)} />
                  <Metric label="Pending" value={String(course.pendingGrades)} />
                  <Metric label="Submitted" value={`${course.submittedRate}%`} />
                  <Metric label="Solution" value={solutionLabel(course.solutionStatus)} compact />
                </div>

                {/* Submission progress bar */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Submission rate</span>
                    <span>{course.submittedRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${courseAccent(course.color)}`}
                      style={{ width: `${course.submittedRate}%` }}
                    />
                  </div>
                </div>

                {/* Grading queue preview */}
                {courseActivity.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recent</p>
                    {courseActivity.slice(0, 2).map((a) => (
                      <div key={a.title} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                        <p className="min-w-0 truncate text-xs text-slate-700">{a.title}</p>
                        <span className="shrink-0 text-[11px] font-semibold text-slate-400">{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next due */}
                <div className="mt-4 rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next Due</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">{course.nextDue}</p>
                </div>

                {/* Action buttons */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedId(isSelected ? null : course.id)}
                    className="rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    Open
                  </button>
                  <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Grade ({course.pendingGrades})
                  </button>
                  <button className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                    course.solutionStatus === 'missing'
                      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    {course.solutionStatus === 'missing' ? 'Upload solution' : 'View solution'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        {/* Add course card */}
        <Link
          href="/generate"
          className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600"
        >
          <span className="text-3xl font-light">+</span>
          <span className="text-sm font-semibold">Create new course</span>
        </Link>
      </main>
    </PrototypeCanvas>
  )
}

export default function ProtoTeacherHomeBPage() {
  return (
    <Suspense>
      <TeacherHomeBPrototype />
    </Suspense>
  )
}
