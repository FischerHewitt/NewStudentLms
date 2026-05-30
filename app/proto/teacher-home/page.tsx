// PROTOTYPE - throwaway. Delete or absorb after design decision.
// Three variants of the teacher home page, switchable via ?variant=, on /proto/teacher-home.

'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeSwitcher } from '@/components/prototype/PrototypeSwitcher'

type Course = {
  id: string
  code: string
  title: string
  term: string
  students: number
  modules: number
  assignments: number
  submitted: number
  totalExpected: number
  pendingGrades: number
  nextDue: string
  health: 'steady' | 'watch' | 'urgent'
}

type QueueItem = {
  id: string
  courseCode: string
  assignment: string
  student: string
  submitted: string
  type: 'grade' | 'review' | 'missing'
}

type Insight = {
  id: string
  title: string
  detail: string
  tone: 'blue' | 'amber' | 'rose' | 'green'
}

const courses: Course[] = [
  {
    id: 'bio-111',
    code: 'BIO 111',
    title: 'Biology and Society',
    term: 'Spring 2026',
    students: 28,
    modules: 8,
    assignments: 14,
    submitted: 173,
    totalExpected: 224,
    pendingGrades: 11,
    nextDue: 'Lab Notebook 2, tomorrow',
    health: 'urgent',
  },
  {
    id: 'coms-101',
    code: 'COMS 101',
    title: 'Public Speaking',
    term: 'Spring 2026',
    students: 22,
    modules: 7,
    assignments: 12,
    submitted: 146,
    totalExpected: 176,
    pendingGrades: 4,
    nextDue: 'Delivery Analysis, Friday',
    health: 'watch',
  },
  {
    id: 'math-143',
    code: 'MATH 143',
    title: 'College Algebra',
    term: 'Spring 2026',
    students: 31,
    modules: 9,
    assignments: 18,
    submitted: 241,
    totalExpected: 279,
    pendingGrades: 2,
    nextDue: 'Midterm Reflection, Monday',
    health: 'steady',
  },
]

const queue: QueueItem[] = [
  {
    id: 'q1',
    courseCode: 'BIO 111',
    assignment: 'Lab Notebook 2',
    student: 'Jordan Kim',
    submitted: '18 min ago',
    type: 'grade',
  },
  {
    id: 'q2',
    courseCode: 'BIO 111',
    assignment: 'Course Reflection',
    student: 'Alex Rivera',
    submitted: '42 min ago',
    type: 'grade',
  },
  {
    id: 'q3',
    courseCode: 'COMS 101',
    assignment: 'Written Evaluation Round 1',
    student: 'Morgan Lee',
    submitted: '1 hr ago',
    type: 'review',
  },
  {
    id: 'q4',
    courseCode: 'MATH 143',
    assignment: 'Problem Set 6',
    student: 'Six missing',
    submitted: 'due tonight',
    type: 'missing',
  },
]

const insights: Insight[] = [
  {
    id: 'i1',
    title: 'BIO 111 grading queue is building',
    detail: '11 pending submissions, mostly Lab Notebook 2.',
    tone: 'rose',
  },
  {
    id: 'i2',
    title: 'COMS 101 speech feedback is consistent',
    detail: 'Average rubric spread is within your usual range.',
    tone: 'green',
  },
  {
    id: 'i3',
    title: 'MATH 143 has a missing-work cluster',
    detail: '6 students are missing Problem Set 6 before tonight.',
    tone: 'amber',
  },
]

const variants = [
  { id: 'a', label: 'Action Center' },
  { id: 'b', label: 'Course Portfolio' },
  { id: 'c', label: 'Operations Table' },
]

function TeacherHomePrototype() {
  const params = useSearchParams()
  const variant = params.get('variant') ?? 'a'

  return (
    <div className="min-h-[calc(100vh-9rem)] pb-24">
      {variant === 'b' ? (
        <VariantCoursePortfolio />
      ) : variant === 'c' ? (
        <VariantOperationsTable />
      ) : (
        <VariantActionCenter />
      )}
      <PrototypeSwitcher variants={variants} current={variant} />
    </div>
  )
}

function VariantActionCenter() {
  const [activeCourseId, setActiveCourseId] = useState(courses[0].id)
  const activeCourse = courses.find((course) => course.id === activeCourseId) ?? courses[0]
  const activeQueue = queue.filter((item) => item.courseCode === activeCourse.code)

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[18rem_minmax(0,1fr)_20rem] gap-5">
      <aside className="self-start rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between px-2">
          <h1 className="text-sm font-bold text-slate-900">Teacher Home</h1>
          <Link
            href="/generate"
            className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            New
          </Link>
        </div>
        <div className="space-y-1">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setActiveCourseId(course.id)}
              className={`w-full rounded-md px-3 py-2 text-left transition ${
                activeCourse.id === course.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide opacity-70">
                {course.code}
              </span>
              <span className="block truncate text-sm font-semibold">{course.title}</span>
              <span className="mt-1 block text-xs opacity-70">
                {course.pendingGrades} pending grades
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Start Here
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {activeCourse.pendingGrades > 0
                  ? `${activeCourse.pendingGrades} submissions are ready for review`
                  : 'Your grading queue is clear'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeCourse.code} - {activeCourse.nextDue}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Open course
              </button>
              <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Grade with AI
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            <Metric label="Students" value={String(activeCourse.students)} />
            <Metric label="Modules" value={String(activeCourse.modules)} />
            <Metric label="Assignments" value={String(activeCourse.assignments)} />
            <Metric label="Submitted" value={`${submissionRate(activeCourse)}%`} />
          </div>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Work Queue</h3>
            <span className="text-xs text-slate-400">{activeCourse.code}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(activeQueue.length > 0 ? activeQueue : queue.slice(0, 2)).map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Teacher Coach
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ask for a summary of the active course, generate a reminder, or run
            SpeedGrader on the next submission.
          </p>
          <div className="mt-3 space-y-2">
            {['Summarize this course', 'Draft missing-work note', 'Open oldest submission'].map(
              (prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {prompt}
                </button>
              ),
            )}
          </div>
        </div>
        <InsightList />
      </aside>
    </div>
  )
}

function VariantCoursePortfolio() {
  const totalPending = courses.reduce((sum, course) => sum + course.pendingGrades, 0)
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0)

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Spring 2026
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Course Portfolio
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Import roster
          </button>
          <Link
            href="/generate"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Create course
          </Link>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-[1fr_1fr_1fr_1.4fr] gap-4">
        <MetricPanel label="Courses" value={String(courses.length)} detail="active this term" />
        <MetricPanel label="Students" value={String(totalStudents)} detail="across all courses" />
        <MetricPanel label="Pending" value={String(totalPending)} detail="grades to review" />
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Next best action
          </p>
          <p className="mt-2 text-sm font-semibold text-indigo-950">
            Clear BIO 111 Lab Notebook 2 before the next section opens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <article
            key={course.id}
            className="flex min-h-80 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {course.code}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-tight text-slate-950">
                  {course.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">{course.term}</p>
              </div>
              <HealthBadge health={course.health} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Students" value={String(course.students)} />
              <MiniStat label="Pending" value={String(course.pendingGrades)} />
              <MiniStat label="Modules" value={String(course.modules)} />
              <MiniStat label="Submitted" value={`${submissionRate(course)}%`} />
            </div>

            <div className="mt-5 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Coming Up
              </p>
              <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {course.nextDue}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Open
              </button>
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Queue
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_22rem] gap-4">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Submissions</h3>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100">
            <div className="divide-y divide-slate-100">
              {queue.slice(0, 2).map((item) => (
                <QueueRow key={item.id} item={item} compact />
              ))}
            </div>
            <div className="divide-y divide-slate-100">
              {queue.slice(2).map((item) => (
                <QueueRow key={item.id} item={item} compact />
              ))}
            </div>
          </div>
        </section>
        <InsightList />
      </div>
    </div>
  )
}

function VariantOperationsTable() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'pending'>('all')
  const filtered = useMemo(
    () =>
      courses.filter((course) => {
        if (filter === 'urgent') return course.health === 'urgent' || course.health === 'watch'
        if (filter === 'pending') return course.pendingGrades > 0
        return true
      }),
    [filter],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Teacher Operations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Courses, grading load, and AI tasks in one scan-friendly view.
          </p>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          {(['all', 'urgent', 'pending'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded px-3 py-1.5 text-sm font-semibold capitalize ${
                filter === item
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_21rem] gap-4">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="w-[28%] px-4 py-3 text-left">Course</th>
                <th className="px-3 py-3 text-left">Health</th>
                <th className="px-3 py-3 text-right">Students</th>
                <th className="px-3 py-3 text-right">Pending</th>
                <th className="px-3 py-3 text-left">Next Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900">{course.code}</p>
                    <p className="truncate text-xs text-slate-500">{course.title}</p>
                  </td>
                  <td className="px-3 py-4">
                    <HealthBadge health={course.health} />
                  </td>
                  <td className="px-3 py-4 text-right font-medium text-slate-700">
                    {course.students}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="font-semibold text-slate-900">{course.pendingGrades}</span>
                  </td>
                  <td className="px-3 py-4 text-slate-600">{course.nextDue}</td>
                  <td className="px-4 py-4 text-right">
                    <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                      Work
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Grade Queue</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {queue.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {queue.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full rounded-md border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="block text-xs font-semibold text-slate-900">
                    {item.courseCode} - {item.assignment}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {item.student}, {item.submitted}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Coach Scratchpad</h2>
            <textarea
              defaultValue="Ask Teacher Coach to draft feedback themes across BIO 111 Lab Notebook 2."
              className="mt-3 h-28 w-full resize-none rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
            />
            <button className="mt-2 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Send to Coach
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function MetricPanel({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
  )
}

function QueueRow({ item, compact = false }: { item: QueueItem; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-5 ${compact ? 'py-3' : 'py-4'}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {item.assignment}
        </p>
        <p className="truncate text-xs text-slate-500">
          {item.courseCode} - {item.student} - {item.submitted}
        </p>
      </div>
      <button className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        Open
      </button>
    </div>
  )
}

function HealthBadge({ health }: { health: Course['health'] }) {
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

function InsightList() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">AI Signals</h2>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-md border px-3 py-2 ${insightTone(insight.tone)}`}
          >
            <p className="text-xs font-bold">{insight.title}</p>
            <p className="mt-1 text-xs opacity-75">{insight.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function insightTone(tone: Insight['tone']) {
  if (tone === 'rose') return 'border-rose-200 bg-rose-50 text-rose-800'
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (tone === 'green') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return 'border-indigo-200 bg-indigo-50 text-indigo-800'
}

function submissionRate(course: Course) {
  return Math.round((course.submitted / course.totalExpected) * 100)
}

export default function ProtoTeacherHomePage() {
  return (
    <Suspense>
      <TeacherHomePrototype />
    </Suspense>
  )
}
