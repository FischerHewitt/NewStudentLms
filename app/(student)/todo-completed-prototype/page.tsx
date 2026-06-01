'use client'

// Throwaway prototype: preserve the current student dashboard work-list structure,
// but vary how far ahead/behind students see and how Completed rows communicate status.

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeSwitcher } from '@/components/PrototypeSwitcher'

type CourseKey = 'BIO111' | 'COMS101' | 'PH'
type WorkStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded'

interface WorkItem {
  id: string
  course: CourseKey
  title: string
  date: string
  label: string
  daysFromToday: number
  points: number
  status: WorkStatus
  grade?: string
}

interface WindowConfig {
  aheadDays: number
  behindDays: number
  description: string
  todoHint: string
  completedHint: string
}

const variants = [
  { key: 'A', name: '7 / 7 Window' },
  { key: 'B', name: '14 / 14 Window' },
  { key: 'C', name: 'Smart Window' },
]

const configs: Record<string, WindowConfig> = {
  A: {
    aheadDays: 7,
    behindDays: 7,
    description: 'Smallest version: next 7 days of work, last 7 days of completed work.',
    todoHint: 'Good if the dashboard should feel calm and immediate.',
    completedHint: 'Shows only recent wins so Completed stays reassuring.',
  },
  B: {
    aheadDays: 14,
    behindDays: 14,
    description: 'Medium version: next 2 weeks visible, last 2 weeks completed.',
    todoHint: 'Good if students need more planning context without seeing the whole course.',
    completedHint: 'Shows enough history to answer “what did I just turn in?”',
  },
  C: {
    aheadDays: 10,
    behindDays: 21,
    description: 'Smart version: next 10 days, plus a compact later-work summary and 3 weeks completed.',
    todoHint: 'Good if you want a focused list with a hint of what is coming later.',
    completedHint: 'Keeps more history, but groups older work so it does not feel like a second task list.',
  },
}

const workItems: WorkItem[] = [
  {
    id: 'todo-0',
    course: 'PH',
    title: 'Assignment 6: Logarithm Exit Reflection',
    date: '2026-05-30',
    label: 'Overdue',
    daysFromToday: -1,
    points: 20,
    status: 'not-started',
  },
  {
    id: 'todo-1',
    course: 'BIO111',
    title: 'Connect Homework 2 - Macromolecules',
    date: '2026-06-01',
    label: 'Tomorrow',
    daysFromToday: 1,
    points: 5,
    status: 'not-started',
  },
  {
    id: 'todo-2',
    course: 'COMS101',
    title: 'Office Visit',
    date: '2026-06-02',
    label: 'Tuesday, Jun 2',
    daysFromToday: 2,
    points: 10,
    status: 'in-progress',
  },
  {
    id: 'todo-3',
    course: 'BIO111',
    title: 'Lab Notebook - Microscopy',
    date: '2026-06-04',
    label: 'Thursday, Jun 4',
    daysFromToday: 4,
    points: 10,
    status: 'not-started',
  },
  {
    id: 'todo-4',
    course: 'COMS101',
    title: 'Quiz 1 - Speech Structure',
    date: '2026-06-06',
    label: 'Saturday, Jun 6',
    daysFromToday: 6,
    points: 15,
    status: 'not-started',
  },
  {
    id: 'todo-5',
    course: 'BIO111',
    title: 'Lab Notebook - Macromolecule Identification',
    date: '2026-06-08',
    label: 'Monday, Jun 8',
    daysFromToday: 8,
    points: 10,
    status: 'not-started',
  },
  {
    id: 'todo-6',
    course: 'COMS101',
    title: 'Quiz 2 - Delivery',
    date: '2026-06-09',
    label: 'Tuesday, Jun 9',
    daysFromToday: 9,
    points: 15,
    status: 'not-started',
  },
  {
    id: 'todo-7',
    course: 'BIO111',
    title: 'Quiz 1 - Cells and Chemistry',
    date: '2026-06-11',
    label: 'Thursday, Jun 11',
    daysFromToday: 11,
    points: 25,
    status: 'not-started',
  },
  {
    id: 'todo-8',
    course: 'COMS101',
    title: 'Specific Purpose & Central Idea - Round 1',
    date: '2026-06-13',
    label: 'Saturday, Jun 13',
    daysFromToday: 13,
    points: 0,
    status: 'not-started',
  },
  {
    id: 'todo-9',
    course: 'BIO111',
    title: 'Midterm 1 - Chemistry and Cells',
    date: '2026-06-15',
    label: 'Monday, Jun 15',
    daysFromToday: 15,
    points: 100,
    status: 'not-started',
  },
]

const completedItems: WorkItem[] = [
  {
    id: 'done-1',
    course: 'COMS101',
    title: 'Creating Classroom Community',
    date: '2026-05-30',
    label: 'Yesterday',
    daysFromToday: -1,
    points: 15,
    status: 'graded',
    grade: '14/15',
  },
  {
    id: 'done-2',
    course: 'BIO111',
    title: 'Connect Homework 1 - Chemistry Review',
    date: '2026-05-28',
    label: 'Wednesday, May 28',
    daysFromToday: -3,
    points: 5,
    status: 'graded',
    grade: '5/5',
  },
  {
    id: 'done-3',
    course: 'PH',
    title: 'Assignment 5: Trig Exit Reflection',
    date: '2026-05-26',
    label: 'Monday, May 26',
    daysFromToday: -5,
    points: 20,
    status: 'submitted',
  },
  {
    id: 'done-4',
    course: 'COMS101',
    title: 'Speech Outline Checkpoint',
    date: '2026-05-21',
    label: 'Wednesday, May 21',
    daysFromToday: -10,
    points: 10,
    status: 'submitted',
  },
  {
    id: 'done-5',
    course: 'BIO111',
    title: 'Lab Safety Contract',
    date: '2026-05-17',
    label: 'Saturday, May 17',
    daysFromToday: -14,
    points: 5,
    status: 'graded',
    grade: '5/5',
  },
  {
    id: 'done-6',
    course: 'PH',
    title: 'Assignment 4: Exponential Practice',
    date: '2026-05-10',
    label: 'Saturday, May 10',
    daysFromToday: -21,
    points: 20,
    status: 'graded',
    grade: '18/20',
  },
]

const courseStyle: Record<CourseKey, { pill: string; bar: string; dot: string; soft: string }> = {
  BIO111: {
    pill: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50',
  },
  COMS101: {
    pill: 'bg-orange-100 text-orange-700',
    bar: 'bg-orange-500',
    dot: 'bg-orange-500',
    soft: 'bg-orange-50',
  },
  PH: {
    pill: 'bg-violet-100 text-violet-700',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
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
  config,
  visibleTodoCount,
  visibleCompletedCount,
  children,
}: {
  current: string
  config: WindowConfig
  visibleTodoCount: number
  visibleCompletedCount: number
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
              Existing work-list style, different windows
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Variant {current}: {config.description}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-950">Visible state</p>
            <p className="mt-1 text-slate-600">
              To-Do: {visibleTodoCount} rows. Completed: {visibleCompletedCount} rows.
            </p>
          </div>
        </div>
        {children}
      </div>
      <PrototypeSwitcher variants={variants} current={current} />
    </div>
  )
}

function WeekStrip({ todoItems }: { todoItems: WorkItem[] }) {
  const days = [
    ['Sun', '31', 0],
    ['Mon', '1', 1],
    ['Tue', '2', 2],
    ['Wed', '3', 3],
    ['Thu', '4', 4],
    ['Fri', '5', 5],
    ['Sat', '6', 6],
  ] as const

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map(([label, date, offset]) => {
        const items = todoItems.filter((item) => item.daysFromToday === offset)
        const totalPoints = items.reduce((sum, item) => sum + item.points, 0)
        const isToday = offset === 0

        return (
          <button
            key={`${label}-${date}`}
            type="button"
            className={`min-h-24 rounded-lg px-2 py-3 text-center transition ${
              isToday
                ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="block text-xs font-medium">{label}</span>
            <span className="mt-1 block text-xl font-semibold">{date}</span>
            <span className="mt-3 flex justify-center gap-1">
              {items.slice(0, 3).map((item) => (
                <span key={item.id} className={`h-1.5 w-1.5 rounded-full ${courseStyle[item.course].dot}`} />
              ))}
            </span>
            {totalPoints > 0 && (
              <span className="mt-1 block text-xs font-semibold text-emerald-600">
                {totalPoints}pt
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function WorkTabs({
  todoCount,
  completedCount,
}: {
  todoCount: number
  completedCount: number
}) {
  return (
    <div aria-label="Weekly assignment status" className="mb-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button type="button" className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm">
        To-Do
        <span className="ml-2 rounded-md bg-white/20 px-2 py-0.5 text-xs text-white">{todoCount}</span>
      </button>
      <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-950">
        Completed
        <span className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{completedCount}</span>
      </button>
    </div>
  )
}

function groupByLabel(items: WorkItem[]) {
  return items.reduce<Array<{ label: string; items: WorkItem[] }>>((groups, item) => {
    const existing = groups.find((group) => group.label === item.label)
    if (existing) existing.items.push(item)
    else groups.push({ label: item.label, items: [item] })
    return groups
  }, [])
}

function TodoList({
  items,
  hiddenCount,
  variant,
}: {
  items: WorkItem[]
  hiddenCount: number
  variant: string
}) {
  const groups = groupByLabel(items)

  return (
    <section className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className={`mb-3 text-sm font-semibold ${group.label === 'Overdue' ? 'text-red-600' : group.label === 'Tomorrow' ? 'text-orange-600' : 'text-slate-950'}`}>
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.items.map((item) => (
              <TodoRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          {variant === 'C'
            ? `${hiddenCount} later assignments summarized below the fold`
            : `Show ${hiddenCount} more later assignments`}
        </button>
      )}
    </section>
  )
}

function TodoRow({ item }: { item: WorkItem }) {
  return (
    <div className={`flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${courseStyle[item.course].soft}`}>
      <div className="flex min-w-0 flex-1 items-center gap-4 bg-white px-5 py-4 hover:bg-slate-50">
        <span className={`h-7 rounded-md px-2 py-1 text-xs font-bold ${courseStyle[item.course].pill}`}>
          {item.course}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-950">{item.title}</p>
            {item.status === 'in-progress' && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                In progress
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{item.date} - {item.points}pts</p>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Mark ${item.title} complete`}
        className="flex w-14 flex-shrink-0 items-center justify-center border-l border-slate-200 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
      >
        <span className="material-symbols-outlined">check_circle</span>
      </button>
    </div>
  )
}

function CompletedList({
  items,
  hiddenCount,
  compactOlder,
}: {
  items: WorkItem[]
  hiddenCount: number
  compactOlder: boolean
}) {
  const recent = compactOlder ? items.slice(0, 4) : items
  const compacted = compactOlder ? items.slice(4) : []

  return (
    <section className="space-y-3">
      {recent.map((item) => (
        <CompletedRow key={item.id} item={item} />
      ))}
      {compacted.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {compacted.length} older completed assignment{compacted.length === 1 ? '' : 's'} tucked away.
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Show {hiddenCount} older completed assignments
        </button>
      )}
    </section>
  )
}

function CompletedRow({ item }: { item: WorkItem }) {
  const isGraded = item.status === 'graded'

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-500 shadow-sm">
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
        <span className="material-symbols-outlined text-[18px]">{isGraded ? 'done' : 'hourglass_top'}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CoursePill course={item.course} />
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
        <p className="truncate text-sm font-semibold line-through decoration-slate-400 decoration-2">
          {item.title}
        </p>
      </div>
      <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${isGraded ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
        {isGraded ? `Completed - ${item.grade}` : 'Grade pending'}
      </span>
    </div>
  )
}

function DashboardWorkPrototype({ current }: { current: string }) {
  const config = configs[current] ?? configs.A
  const isSmart = current === 'C'
  const visibleTodos = workItems.filter((item) => item.daysFromToday <= config.aheadDays)
  const visibleCompleted = completedItems.filter((item) => Math.abs(item.daysFromToday) <= config.behindDays)
  const hiddenTodoCount = workItems.length - visibleTodos.length
  const hiddenCompletedCount = completedItems.length - visibleCompleted.length

  return (
    <PrototypeShell
      current={current}
      config={config}
      visibleTodoCount={visibleTodos.length}
      visibleCompletedCount={visibleCompleted.length}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">This Week</p>
                <p className="mt-1 text-xs text-slate-500">{config.todoHint}</p>
              </div>
              <button type="button" className="rounded-full px-3 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50">
                Today
              </button>
            </div>
            <WorkTabs todoCount={visibleTodos.length} completedCount={visibleCompleted.length} />
            <WeekStrip todoItems={visibleTodos} />
          </section>
          <TodoList items={visibleTodos} hiddenCount={hiddenTodoCount} variant={current} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Completed preview</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{config.completedHint}</p>
          </section>
          <CompletedList
            items={visibleCompleted}
            hiddenCount={hiddenCompletedCount}
            compactOlder={isSmart}
          />
        </aside>
      </div>
    </PrototypeShell>
  )
}

function TodoCompletedPrototypeInner() {
  const searchParams = useSearchParams()
  const requested = searchParams.get('variant')?.toUpperCase() ?? 'A'
  const current = variants.some((variant) => variant.key === requested) ? requested : 'A'
  return <DashboardWorkPrototype current={current} />
}

export default function TodoCompletedPrototypePage() {
  return (
    <Suspense fallback={null}>
      <TodoCompletedPrototypeInner />
    </Suspense>
  )
}
