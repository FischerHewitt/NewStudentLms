'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { checkOffAssignment } from '@/app/actions/assignment'
import { filterOpenAssignments } from '@/lib/studentDashboard'
import type {
  StudentDashboardAssignment,
  StudentDashboardCourse,
} from '@/app/actions/dashboard'

type StudentTab = 'overview' | 'grades' | 'messages'
type WorkView = 'todo' | 'completed'

const TODO_AHEAD_DAYS = 10
const TODO_VISIBLE_LIMIT = 9
const COMPLETED_LOOKBACK_DAYS = 21
const COMPLETED_VISIBLE_LIMIT = 9

interface Props {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  initialTab?: StudentTab
  initialCourseId?: string | null
  initialWorkView?: WorkView
}

const PALETTE = ['purple', 'emerald', 'orange', 'pink', 'slate'] as const
type PaletteColor = (typeof PALETTE)[number]

const COLORS: Record<PaletteColor, {
  accent: string
  border: string
  bar: string
  pill: string
  dot: string
  soft: string
}> = {
  purple: {
    accent: 'text-[#7C3AED]',
    border: 'border-l-[#7C3AED]',
    bar: 'bg-[#7C3AED]',
    pill: 'bg-violet-100 text-violet-700',
    dot: 'bg-[#7C3AED]',
    soft: 'bg-violet-50',
  },
  emerald: {
    accent: 'text-emerald-600',
    border: 'border-l-emerald-500',
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50',
  },
  orange: {
    accent: 'text-orange-600',
    border: 'border-l-orange-500',
    bar: 'bg-orange-500',
    pill: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    soft: 'bg-orange-50',
  },
  pink: {
    accent: 'text-pink-600',
    border: 'border-l-pink-500',
    bar: 'bg-pink-500',
    pill: 'bg-pink-100 text-pink-700',
    dot: 'bg-pink-500',
    soft: 'bg-pink-50',
  },
  slate: {
    accent: 'text-slate-600',
    border: 'border-l-slate-500',
    bar: 'bg-slate-500',
    pill: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
    soft: 'bg-slate-50',
  },
}

function assignColor(index: number): PaletteColor {
  return PALETTE[index % PALETTE.length]
}

function courseCode(title: string): string {
  const match = title.match(/[A-Z]{2,}\s*\d{2,}/)
  if (match) return match[0].replace(/\s+/, '')

  const words = title
    .split(/\s+/)
    .filter((word) => word.length > 2 && !/^(the|and|for|with|of)$/i.test(word))

  return (words.length ? words : [title])
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 5)
}

function isOpenAssignment(assignment: StudentDashboardAssignment): boolean {
  return assignment.status === 'not-started' || assignment.status === 'in-progress'
}

function courseGradeStats(assignments: StudentDashboardAssignment[], courseId: string) {
  const graded = assignments.filter(
    (assignment) => assignment.courseId === courseId && assignment.status === 'graded',
  )
  const earned = graded.reduce((sum, assignment) => sum + (assignment.grade ?? 0), 0)
  const total = graded.reduce((sum, assignment) => sum + assignment.points, 0)

  if (total === 0) return null
  return { earned, total, pct: Math.round((earned / total) * 100) }
}

function letterGrade(pct: number): string {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  return 'D'
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(due: string): number {
  const today = new Date(`${todayStr()}T12:00:00`)
  const date = new Date(`${due}T12:00:00`)
  return Math.ceil((date.getTime() - today.getTime()) / 86400000)
}

function dateLabel(due: string): string {
  const days = daysUntil(due)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return new Date(`${due}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function getWeekDates(dayOffset: number): { date: string; label: string }[] {
  const start = new Date(`${todayStr()}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() + dayOffset - 1)
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return {
      date: date.toISOString().slice(0, 10),
      label: labels[date.getUTCDay()],
    }
  })
}

function buildAiCoachInsight(
  courses: StudentDashboardCourse[],
  assignments: StudentDashboardAssignment[],
): string {
  if (courses.length === 0) {
    return 'Once your teacher publishes a Course, I will help you spot what needs attention first.'
  }

  const nextOpen = assignments
    .filter((assignment) => isOpenAssignment(assignment) && assignment.due)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())[0]

  if (!nextOpen) {
    return 'You are caught up on visible work. Use this window to review materials before the next Module opens.'
  }

  const course = courses.find((item) => item.id === nextOpen.courseId)
  return `Your next priority is ${nextOpen.title}${course ? ` in ${course.title}` : ''}. Review the materials before ${dateLabel(nextOpen.due!)} so the assignment does not sneak up on you.`
}

function groupOpenAssignments(assignments: StudentDashboardAssignment[]) {
  const groups: Record<string, StudentDashboardAssignment[]> = {}
  for (const assignment of assignments) {
    if (!assignment.due) continue
    const key = assignment.due
    groups[key] = groups[key] ? [...groups[key], assignment] : [assignment]
  }
  return Object.keys(groups)
    .sort()
    .map((date) => ({ date, label: dateLabel(date), assignments: groups[date] }))
}

function isInTodoWindow(assignment: StudentDashboardAssignment): boolean {
  if (!assignment.due) return false
  return daysUntil(assignment.due) <= TODO_AHEAD_DAYS
}

function completedReferenceDate(assignment: StudentDashboardAssignment): string | null {
  return assignment.submittedAt?.slice(0, 10) ?? assignment.due
}

function isInCompletedWindow(assignment: StudentDashboardAssignment): boolean {
  const date = completedReferenceDate(assignment)
  if (!date) return false

  const daysAgo = -daysUntil(date)
  return daysAgo >= 0 && daysAgo <= COMPLETED_LOOKBACK_DAYS
}

function switchToTeacher() {
  localStorage.setItem('lms_active_role', 'teacher')
  window.location.href = '/dashboard'
}

function StudentSidebar() {
  const navItems = [
    ['dashboard', 'Dashboard'],
    ['school', 'My Courses'],
    ['assignment', 'Assignments'],
    ['psychology', 'AI Coach'],
    ['calendar_month', 'Calendar'],
    ['local_library', 'Library'],
  ]

  return (
    <aside className="flex border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-r">
      <div className="hidden h-full flex-col p-6 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/alumos-icon.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <span className="font-heading text-2xl font-bold text-slate-950">Alumos</span>
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
            <span className="material-symbols-outlined text-slate-700">person</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">Alex Rivers</p>
            <p className="text-xs text-slate-500">Computer Science Year 2</p>
          </div>
        </div>

        <nav className="space-y-2" aria-label="Student">
          {navItems.map(([icon, label], index) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                index === 0
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            Ask AI Coach
          </button>
          <button
            type="button"
            onClick={switchToTeacher}
            className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Teacher View
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/alumos-icon.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <div>
            <span className="text-xl font-bold leading-tight text-slate-950">Alumos</span>
            <p className="text-xs font-semibold text-slate-500">Alex Rivers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={switchToTeacher}
          className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Teacher View
        </button>
      </div>
    </aside>
  )
}

function StudentTopBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: StudentTab
  setActiveTab: (tab: StudentTab) => void
}) {
  const tabs: { id: StudentTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'grades', label: 'Grades' },
    { id: 'messages', label: 'Messages' },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-[#F8FAFC]/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex h-full items-center gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative h-full px-1 text-sm font-semibold transition sm:text-base ${
              activeTab === tab.id ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <button type="button" aria-label="Notifications" className="rounded-full p-2 text-slate-700 hover:bg-white">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" aria-label="Theme" className="rounded-full p-2 text-slate-700 hover:bg-white">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button type="button" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
          Check In
        </button>
      </div>
    </header>
  )
}

function InsightBanner({
  courses,
  assignments,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
}) {
  return (
    <section className="rounded-2xl border-2 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 p-[3px]">
      <div className="flex flex-col gap-5 rounded-[14px] bg-white p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-white shadow-lg">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-950">AI Coach Insights</h2>
            <span className="material-symbols-outlined text-[20px] text-violet-600">auto_awesome</span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            {buildAiCoachInsight(courses, assignments)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700">
            Accept Schedule
          </button>
          <button type="button" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Dismiss
          </button>
        </div>
      </div>
    </section>
  )
}

function CourseCards({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
  setSelectedCourseId,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
  setSelectedCourseId: (courseId: string | null) => void
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Courses</h2>
        {selectedCourseId && (
          <button type="button" onClick={() => setSelectedCourseId(null)} className="text-sm font-semibold text-violet-600">
            All courses
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        {courses.map((course) => {
          const color = COLORS[colorByCourse[course.id]]
          const stats = courseGradeStats(assignments, course.id)
          const openCount = assignments.filter(
            (assignment) => assignment.courseId === course.id && isOpenAssignment(assignment),
          ).length
          const selected = selectedCourseId === course.id

          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(selected ? null : course.id)}
              className={`min-w-0 rounded-xl border border-l-4 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${color.border} ${
                selected ? 'ring-2 ring-violet-300' : ''
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${color.pill}`}>
                  {codeByCourse[course.id]}
                </span>
                {stats ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{letterGrade(stats.pct)}</p>
                    <p className="text-xs text-slate-600">{stats.pct}%</p>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-500">No grades</p>
                )}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-slate-950">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{course.teacherName}</p>
              {stats && (
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.pct}%` }} />
                </div>
              )}
              <p className="mt-6 text-sm font-semibold text-orange-600">{openCount} open</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function WeekStrip({
  assignments,
  colorByCourse,
  dayFilter,
  setDayFilter,
  workView,
  setWorkView,
  openCount,
  completedCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  dayFilter: string | null
  setDayFilter: (day: string | null) => void
  workView: WorkView
  setWorkView: (view: WorkView) => void
  openCount: number
  completedCount: number
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const week = getWeekDates(weekOffset)
  const today = todayStr()

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-950">This Week</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setWeekOffset((value) => value - 7)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button type="button" onClick={() => setWeekOffset(0)} className="rounded-full px-3 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50">
            Today
          </button>
          <button type="button" onClick={() => setWeekOffset((value) => value + 7)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div
        aria-label="Weekly assignment status"
        className="mb-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        <button
          type="button"
          aria-label={`To-Do ${openCount}`}
          onClick={() => setWorkView('todo')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            workView === 'todo'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          To-Do
          <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
            workView === 'todo' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {openCount}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Completed ${completedCount}`}
          onClick={() => setWorkView('completed')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            workView === 'completed'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          Completed
          <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
            workView === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {completedCount}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {week.map(({ date, label }) => {
          const items = assignments.filter(
            (assignment) => assignment.due === date && isOpenAssignment(assignment),
          )
          const active = dayFilter === date
          const isToday = date === today
          const totalPoints = items.reduce((sum, assignment) => sum + assignment.points, 0)

          return (
            <button
              key={date}
              type="button"
              onClick={() => setDayFilter(active ? null : date)}
              className={`min-h-24 rounded-lg px-2 py-3 text-center transition ${
                active
                  ? 'bg-violet-600 text-white'
                  : isToday
                    ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                    : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-medium">{label}</span>
              <span className="mt-1 block text-xl font-semibold">{new Date(`${date}T12:00:00`).getDate()}</span>
              <span className="mt-3 flex justify-center gap-1">
                {items.slice(0, 3).map((assignment) => (
                  <span
                    key={assignment.id}
                    className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : COLORS[colorByCourse[assignment.courseId]].dot}`}
                  />
                ))}
              </span>
              {totalPoints > 0 && (
                <span className={`mt-1 block text-xs font-semibold ${active ? 'text-white' : 'text-emerald-600'}`}>
                  {totalPoints}pt
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function AssignmentChecklist({
  assignments,
  colorByCourse,
  codeByCourse,
  hiddenCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  hiddenCount: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [checkingOff, setCheckingOff] = useState<string | null>(null)
  const groups = groupOpenAssignments(assignments)

  function handleCheckOff(event: React.MouseEvent, assignmentId: string) {
    event.preventDefault()
    event.stopPropagation()
    setCheckingOff(assignmentId)
    startTransition(async () => {
      await checkOffAssignment(assignmentId)
      router.refresh()
      setCheckingOff(null)
    })
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        All caught up. New work will appear here when a Course opens it.
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className={`mb-3 text-sm font-semibold ${group.label === 'Overdue' ? 'text-red-600' : group.label === 'Tomorrow' ? 'text-orange-600' : 'text-slate-950'}`}>
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.assignments.map((assignment) => {
              const color = COLORS[colorByCourse[assignment.courseId]]
              const isCheckingThis = checkingOff === assignment.id

              return (
                <div key={assignment.id} className={`flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${color.soft}`}>
                  <Link
                    href={`/course/${assignment.courseId}/assignment/${assignment.id}?view=student`}
                    className="flex min-w-0 flex-1 items-center gap-4 bg-white px-5 py-4 hover:bg-slate-50"
                  >
                    <span className={`h-7 rounded-md px-2 py-1 text-xs font-bold ${color.pill}`}>
                      {codeByCourse[assignment.courseId]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-950">{assignment.title}</p>
                      <p className="text-sm text-slate-600">{assignment.due} - {assignment.points}pts</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => handleCheckOff(event, assignment.id)}
                    disabled={isPending}
                    title="Mark as turned in (paper / in-class)"
                    className="flex w-14 flex-shrink-0 items-center justify-center border-l border-slate-200 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingThis ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          {hiddenCount} later assignment{hiddenCount === 1 ? '' : 's'} summarized below the fold
        </button>
      )}
    </section>
  )
}

function CompletedChecklist({
  assignments,
  colorByCourse,
  codeByCourse,
  hiddenCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  hiddenCount: number
}) {
  const visibleAssignments = assignments.slice(0, COMPLETED_VISIBLE_LIMIT)
  const tuckedCount = Math.max(0, assignments.length - visibleAssignments.length)
  const groups = groupOpenAssignments(visibleAssignments)

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        Nothing completed yet. Finished and submitted Assignments will show up here.
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="mb-3 text-sm font-semibold text-slate-950">{group.label}</h3>
          <div className="space-y-3">
            {group.assignments.map((assignment) => {
              const color = COLORS[colorByCourse[assignment.courseId]]
              const isGraded = assignment.status === 'graded' && assignment.grade !== undefined

              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-500 shadow-sm"
                >
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    <span className="material-symbols-outlined text-[18px]">{isGraded ? 'done' : 'hourglass_top'}</span>
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className={`h-7 rounded-md px-2 py-1 text-xs font-bold ${color.pill}`}>
                      {codeByCourse[assignment.courseId]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-500 line-through decoration-slate-400 decoration-2">{assignment.title}</p>
                      <p className="text-sm text-slate-600">{assignment.due} - {assignment.points}pts</p>
                    </div>
                  </div>
                  {isGraded ? (
                    <span className="flex-shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Completed - {assignment.grade}/{assignment.points}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Grade pending
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {tuckedCount > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {tuckedCount} older completed assignment{tuckedCount === 1 ? '' : 's'} tucked away.
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Show {hiddenCount} older completed assignment{hiddenCount === 1 ? '' : 's'}
        </button>
      )}
    </section>
  )
}

function OverviewPanel({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
  setSelectedCourseId,
  initialWorkView,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
  setSelectedCourseId: (courseId: string | null) => void
  initialWorkView: WorkView
}) {
  const [dayFilter, setDayFilter] = useState<string | null>(null)
  const [workView, setWorkView] = useState<WorkView>(initialWorkView)
  const visibleAssignments = selectedCourseId
    ? assignments.filter((assignment) => assignment.courseId === selectedCourseId)
    : assignments
  const allOpenAssignments = filterOpenAssignments(visibleAssignments, null, dayFilter)
  const openWindowAssignments = allOpenAssignments.filter(isInTodoWindow)
  const openAssignments = openWindowAssignments.slice(0, TODO_VISIBLE_LIMIT)
  const allCompletedAssignments = visibleAssignments
    .filter(
      (assignment) => assignment.status === 'graded' || assignment.status === 'submitted',
    )
    .sort((a, b) => {
      const aDate = completedReferenceDate(a) ?? ''
      const bDate = completedReferenceDate(b) ?? ''
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  const completedAssignments = allCompletedAssignments.filter(
    (assignment) =>
      isInCompletedWindow(assignment) && (!dayFilter || assignment.due === dayFilter),
  )
  const hiddenOpenCount = allOpenAssignments.length - openAssignments.length
  const hiddenCompletedCount = allCompletedAssignments.length - completedAssignments.length
  const openCount = openAssignments.length
  const completedCount = Math.min(completedAssignments.length, COMPLETED_VISIBLE_LIMIT)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xl font-semibold text-slate-950">Welcome back, Alex.</p>
        <p className="mt-3 text-lg text-slate-700">Here is your academic compass for the week.</p>
      </div>

      <InsightBanner courses={courses} assignments={assignments} />

      <div className="grid min-w-0 gap-8 xl:grid-cols-[370px_minmax(0,1fr)]">
        <CourseCards
          courses={courses}
          assignments={assignments}
          colorByCourse={colorByCourse}
          codeByCourse={codeByCourse}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />

        <div className="min-w-0 space-y-8">
          <WeekStrip
            assignments={visibleAssignments}
            colorByCourse={colorByCourse}
            dayFilter={dayFilter}
            setDayFilter={setDayFilter}
            workView={workView}
            setWorkView={setWorkView}
            openCount={openCount}
            completedCount={completedCount}
          />
          {workView === 'todo' ? (
            <AssignmentChecklist
              assignments={openAssignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              hiddenCount={hiddenOpenCount}
            />
          ) : (
            <CompletedChecklist
              assignments={completedAssignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              hiddenCount={hiddenCompletedCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function GradesPanel({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
}) {
  const visibleCourses = selectedCourseId
    ? courses.filter((course) => course.id === selectedCourseId)
    : courses

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Grades</h1>
        <p className="mt-2 text-sm text-slate-600">
          Only Published Grades are shown here. Submitted work stays private until your teacher publishes the Final Grade.
        </p>
      </div>

      {visibleCourses.map((course) => {
        const color = COLORS[colorByCourse[course.id]]
        const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id)
        const completed = courseAssignments.filter(
          (assignment) => assignment.status === 'graded' || assignment.status === 'submitted',
        )
        const stats = courseGradeStats(assignments, course.id)

        return (
          <article key={course.id} className={`rounded-xl border border-l-4 bg-white p-5 shadow-sm ${color.border}`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${color.pill}`}>
                  {codeByCourse[course.id]}
                </span>
                <h2 className="mt-3 text-lg font-semibold text-slate-950">{course.title}</h2>
                <p className="text-sm text-slate-600">{course.teacherName}</p>
              </div>
              {stats ? (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{letterGrade(stats.pct)}</p>
                  <p className="text-sm text-slate-600">{stats.earned}/{stats.total} pts - {stats.pct}%</p>
                </div>
              ) : (
                <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">No grades yet</p>
              )}
            </div>

            {completed.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No submitted or graded Assignments yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {completed.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{assignment.title}</p>
                      <p className="text-xs text-slate-500">{assignment.due} - {assignment.points}pts</p>
                    </div>
                    {assignment.status === 'graded' && assignment.grade !== undefined ? (
                      <p className="text-sm font-bold text-emerald-600">{assignment.grade}/{assignment.points}</p>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        Awaiting grade
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

function MessagesPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
        <span className="material-symbols-outlined">mail</span>
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">Messages are coming soon</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Course messages will live here once messaging is connected. For now, keep using Assignments and AI Coach to stay oriented.
      </p>
      <button type="button" className="mt-6 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
        Back to current work
      </button>
    </section>
  )
}

export function StudentDashboard({
  courses,
  assignments,
  initialTab = 'overview',
  initialCourseId = null,
  initialWorkView = 'todo',
}: Props) {
  const [activeTab, setActiveTab] = useState<StudentTab>(initialTab)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId)

  const colorByCourse = useMemo(
    () => Object.fromEntries(courses.map((course, index) => [course.id, assignColor(index)])) as Record<string, PaletteColor>,
    [courses],
  )
  const codeByCourse = useMemo(
    () => Object.fromEntries(courses.map((course) => [course.id, courseCode(course.title)])) as Record<string, string>,
    [courses],
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <StudentSidebar />

      <div className="min-w-0">
        <StudentTopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
          {activeTab === 'overview' && (
            <OverviewPanel
              courses={courses}
              assignments={assignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              initialWorkView={initialWorkView}
            />
          )}

          {activeTab === 'grades' && (
            <GradesPanel
              courses={courses}
              assignments={assignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              selectedCourseId={selectedCourseId}
            />
          )}

          {activeTab === 'messages' && <MessagesPanel />}
        </main>
      </div>
    </div>
  )
}
