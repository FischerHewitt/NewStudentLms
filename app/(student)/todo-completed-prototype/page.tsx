'use client'

// Throwaway prototype: three variants of the student To-Do and Completed lists,
// switchable via `?variant=`, on `/todo-completed-prototype`.

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeSwitcher } from '@/components/PrototypeSwitcher'

type CourseKey = 'BIO111' | 'COMS101' | 'PH'
type WorkStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded'

interface WorkItem {
  id: string
  course: CourseKey
  courseTitle: string
  title: string
  due: string
  points: number
  status: WorkStatus
  grade?: string
}

const variants = [
  { key: 'A', name: 'Focused Week' },
  { key: 'B', name: 'Today First' },
  { key: 'C', name: 'Course Buckets' },
]

const nextWeek: WorkItem[] = [
  {
    id: 'w1',
    course: 'BIO111',
    courseTitle: 'General Biology',
    title: 'Connect Homework 2 - Macromolecules',
    due: 'Mon, Jun 1',
    points: 5,
    status: 'not-started',
  },
  {
    id: 'w2',
    course: 'COMS101',
    courseTitle: 'Public Speaking',
    title: 'Office Visit',
    due: 'Tue, Jun 2',
    points: 10,
    status: 'in-progress',
  },
  {
    id: 'w3',
    course: 'BIO111',
    courseTitle: 'General Biology',
    title: 'Lab Notebook - Microscopy',
    due: 'Thu, Jun 4',
    points: 10,
    status: 'not-started',
  },
  {
    id: 'w4',
    course: 'COMS101',
    courseTitle: 'Public Speaking',
    title: 'Quiz 1 - Speech Structure',
    due: 'Sat, Jun 6',
    points: 15,
    status: 'not-started',
  },
]

const completed: WorkItem[] = [
  {
    id: 'c1',
    course: 'PH',
    courseTitle: 'Pre-Calculus Honors',
    title: 'Assignment 6: Logarithm Exit Reflection',
    due: 'Mar 27',
    points: 20,
    status: 'submitted',
  },
  {
    id: 'c2',
    course: 'COMS101',
    courseTitle: 'Public Speaking',
    title: 'Creating Classroom Community',
    due: 'May 30',
    points: 15,
    status: 'graded',
    grade: '14/15',
  },
  {
    id: 'c3',
    course: 'BIO111',
    courseTitle: 'General Biology',
    title: 'Connect Homework 1 - Chemistry Review',
    due: 'May 28',
    points: 5,
    status: 'graded',
    grade: '5/5',
  },
]

const courseStyle: Record<CourseKey, { pill: string; bar: string; soft: string }> = {
  BIO111: {
    pill: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50',
  },
  COMS101: {
    pill: 'bg-orange-100 text-orange-700',
    bar: 'bg-orange-500',
    soft: 'bg-orange-50',
  },
  PH: {
    pill: 'bg-violet-100 text-violet-700',
    bar: 'bg-violet-500',
    soft: 'bg-violet-50',
  },
}

function CoursePill({ course }: { course: CourseKey }) {
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-bold ${courseStyle[course].pill}`}>
      {course}
    </span>
  )
}

function PrototypeShell({
  current,
  children,
}: {
  current: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Throwaway prototype
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              To-Do and Completed list directions
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              State: showing the next 7 days only, {nextWeek.length} upcoming assignments,
              {completed.length} completed assignments, current variant {current}.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
            <p className="font-semibold text-slate-950">Design rule being tested</p>
            <p className="mt-1 text-slate-600">
              To-Do should feel small and current. Completed should feel crossed off and reassuring.
            </p>
          </div>
        </div>
        {children}
      </div>
      <PrototypeSwitcher variants={variants} current={current} />
    </div>
  )
}

function MiniWeekRail() {
  const days = [
    ['Sun', '31', ''],
    ['Mon', '1', '5pt'],
    ['Tue', '2', '10pt'],
    ['Wed', '3', ''],
    ['Thu', '4', '10pt'],
    ['Fri', '5', ''],
    ['Sat', '6', '15pt'],
  ]

  return (
    <div className="grid grid-cols-7 gap-1 rounded-xl border border-slate-200 bg-white p-2">
      {days.map(([label, date, points]) => (
        <div
          key={`${label}-${date}`}
          className={`min-h-20 rounded-lg px-2 py-3 text-center ${
            label === 'Mon' ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <p className="text-xs font-semibold">{label}</p>
          <p className="mt-1 text-lg font-bold">{date}</p>
          {points && <p className="mt-2 text-xs font-semibold">{points}</p>}
        </div>
      ))}
    </div>
  )
}

function CompactTodoRow({ item, index }: { item: WorkItem; index: number }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CoursePill course={item.course} />
          {item.status === 'in-progress' && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              In progress
            </span>
          )}
        </div>
        <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
        <p className="text-xs text-slate-500">{item.due} - {item.points}pts</p>
      </div>
      <button
        type="button"
        aria-label={`Mark ${item.title} complete`}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
      >
        <span className="material-symbols-outlined text-[20px]">check</span>
      </button>
    </div>
  )
}

function CompletedCrossOffRow({ item }: { item: WorkItem }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <span className="material-symbols-outlined text-[18px]">done</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <CoursePill course={item.course} />
          <span className="text-xs text-slate-400">{item.due}</span>
        </div>
        <p className="truncate text-sm font-semibold line-through decoration-slate-400 decoration-2">
          {item.title}
        </p>
      </div>
      <p className="text-xs font-semibold text-slate-500">
        {item.grade ?? 'Awaiting grade'}
      </p>
    </div>
  )
}

function VariantA() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">This week only</h2>
              <p className="mt-1 text-sm text-slate-500">Four assignments visible, ordered by urgency.</p>
            </div>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
              View full calendar
            </button>
          </div>
          <MiniWeekRail />
        </div>

        <div className="space-y-3">
          {nextWeek.map((item, index) => (
            <CompactTodoRow key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Completed</h2>
          <p className="mt-1 text-sm text-slate-500">Recent finished work, crossed off.</p>
        </div>
        {completed.map((item) => (
          <CompletedCrossOffRow key={item.id} item={item} />
        ))}
      </aside>
    </div>
  )
}

function VariantB() {
  const now = nextWeek.slice(0, 1)
  const next = nextWeek.slice(1, 3)
  const later = nextWeek.slice(3)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        <PriorityColumn title="Do first" tone="bg-red-50 text-red-700" items={now} />
        <PriorityColumn title="Next few days" tone="bg-orange-50 text-orange-700" items={next} />
        <PriorityColumn title="Later this week" tone="bg-slate-100 text-slate-700" items={later} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Crossed off this week</h2>
            <p className="mt-1 text-sm text-slate-500">A receipt-style list so Completed feels done, not like more work.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {completed.length} finished
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {completed.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">task_alt</span>
              <CoursePill course={item.course} />
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-500 line-through decoration-slate-400 decoration-2">
                {item.title}
              </p>
              <span className="text-xs font-semibold text-slate-500">{item.grade ?? 'Awaiting grade'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PriorityColumn({
  title,
  tone,
  items,
}: {
  title: string
  tone: string
  items: WorkItem[]
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-4 rounded-xl px-3 py-2 text-sm font-bold ${tone}`}>{title}</div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <CoursePill course={item.course} />
              <span className="text-xs font-semibold text-slate-500">{item.points}pts</span>
            </div>
            <p className="text-sm font-semibold leading-5 text-slate-950">{item.title}</p>
            <p className="mt-2 text-xs text-slate-500">{item.due}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VariantC() {
  const grouped = useMemo(() => {
    return nextWeek.reduce<Record<CourseKey, WorkItem[]>>(
      (acc, item) => {
        acc[item.course] = [...(acc[item.course] ?? []), item]
        return acc
      },
      { BIO111: [], COMS101: [], PH: [] },
    )
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Next week by course</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keeps the list short by showing each course as one bucket with its next visible tasks.
          </p>
        </div>
        {Object.entries(grouped)
          .filter(([, items]) => items.length > 0)
          .map(([course, items]) => (
            <div key={course} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-10 w-1 rounded-full ${courseStyle[course as CourseKey].bar}`} />
                  <div>
                    <CoursePill course={course as CourseKey} />
                    <p className="mt-1 text-sm font-semibold text-slate-950">{items[0].courseTitle}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {items.length} this week
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">radio_button_unchecked</span>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.due}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Done list</h2>
        <p className="mt-1 text-sm text-slate-500">Simple crossed-off checklist with grades pushed to the edge.</p>
        <div className="mt-5 space-y-3">
          {completed.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <CoursePill course={item.course} />
                <span className="text-xs font-bold text-slate-500">{item.grade ?? 'Pending'}</span>
              </div>
              <p className="text-sm font-semibold text-slate-500 line-through decoration-slate-400 decoration-2">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function TodoCompletedPrototypeContent() {
  const searchParams = useSearchParams()
  const requested = searchParams.get('variant')?.toUpperCase() ?? 'A'
  const current = variants.some((variant) => variant.key === requested) ? requested : 'A'

  return (
    <PrototypeShell current={current}>
      {current === 'A' && <VariantA />}
      {current === 'B' && <VariantB />}
      {current === 'C' && <VariantC />}
    </PrototypeShell>
  )
}

export default function TodoCompletedPrototypePage() {
  return (
    <Suspense>
      <TodoCompletedPrototypeContent />
    </Suspense>
  )
}
