'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { checkOffAssignment } from '@/app/actions/assignment'
import { filterOpenAssignments } from '@/lib/studentDashboard'
import type {
  StudentDashboardCourse,
  StudentDashboardAssignment,
} from '@/app/actions/dashboard'

// ─── Color palette ────────────────────────────────────────────────────────────

const PALETTE = ['indigo', 'violet', 'emerald', 'amber', 'rose', 'cyan'] as const
type PaletteColor = (typeof PALETTE)[number]

const COLORS: Record<PaletteColor, {
  pill: string; border: string; leftBar: string; leftBarFaint: string
  dot: string; ring: string; bar: string
}> = {
  indigo:  { pill: 'bg-indigo-100 text-indigo-700',   border: 'border-l-indigo-400',  leftBar: 'bg-indigo-400',  leftBarFaint: 'bg-indigo-200',  dot: 'bg-indigo-400',  ring: 'ring-indigo-300',  bar: 'bg-indigo-400' },
  violet:  { pill: 'bg-violet-100 text-violet-700',   border: 'border-l-violet-400',  leftBar: 'bg-violet-400',  leftBarFaint: 'bg-violet-200',  dot: 'bg-violet-400',  ring: 'ring-violet-300',  bar: 'bg-violet-400' },
  emerald: { pill: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-400', leftBar: 'bg-emerald-400', leftBarFaint: 'bg-emerald-200', dot: 'bg-emerald-400', ring: 'ring-emerald-300', bar: 'bg-emerald-400' },
  amber:   { pill: 'bg-amber-100 text-amber-700',     border: 'border-l-amber-400',   leftBar: 'bg-amber-400',   leftBarFaint: 'bg-amber-200',   dot: 'bg-amber-400',   ring: 'ring-amber-300',   bar: 'bg-amber-400' },
  rose:    { pill: 'bg-rose-100 text-rose-700',       border: 'border-l-rose-400',    leftBar: 'bg-rose-400',    leftBarFaint: 'bg-rose-200',    dot: 'bg-rose-400',    ring: 'ring-rose-300',    bar: 'bg-rose-400' },
  cyan:    { pill: 'bg-cyan-100 text-cyan-700',       border: 'border-l-cyan-400',    leftBar: 'bg-cyan-400',    leftBarFaint: 'bg-cyan-200',    dot: 'bg-cyan-400',    ring: 'ring-cyan-300',    bar: 'bg-cyan-400' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assignColor(index: number): PaletteColor {
  return PALETTE[index % PALETTE.length]
}

function courseCode(title: string): string {
  const words = title
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(the|and|for|with|in|of|a|an|to|is)$/i.test(w))
  if (words.length === 0) return title.slice(0, 4).toUpperCase()
  return words.map((w) => w[0].toUpperCase()).join('').slice(0, 5)
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

function gradeTextCls(pct: number): string {
  if (pct >= 90) return 'text-emerald-600'
  if (pct >= 80) return 'text-indigo-600'
  if (pct >= 70) return 'text-amber-600'
  return 'text-red-600'
}

function gradeBarCls(pct: number): string {
  if (pct >= 90) return 'bg-emerald-400'
  if (pct >= 80) return 'bg-indigo-400'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-red-400'
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(due: string): number {
  const today = new Date(todayStr())
  const d = new Date(due)
  return Math.ceil((d.getTime() - today.getTime()) / 86400000)
}

function dateLabel(due: string): string {
  const days = daysUntil(due)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return new Date(due + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })
}

function getCenteredDates(dayOffset: number): { date: string; label: string }[] {
  const today = new Date()
  const center = new Date(today)
  center.setDate(today.getDate() + dayOffset)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(center)
    d.setDate(center.getDate() - 3 + i)
    return { date: d.toISOString().slice(0, 10), label: dayLabels[d.getDay()] }
  })
}

function calcStreak(submittedAts: (string | null)[]): number {
  const days = new Set(
    submittedAts.filter(Boolean).map((s) => s!.slice(0, 10)),
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) streak++
    else break
  }
  return streak
}

function courseGradeStats(assignments: StudentDashboardAssignment[], courseId: string) {
  const graded = assignments.filter((a) => a.courseId === courseId && a.status === 'graded')
  const earned = graded.reduce((s, a) => s + (a.grade ?? 0), 0)
  const total = graded.reduce((s, a) => s + a.points, 0)
  return total > 0 ? { pct: Math.round((earned / total) * 100), earned, total } : null
}

// ─── CourseGradeCards (left pane) ─────────────────────────────────────────────

interface CourseGradeCardsProps {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  filter: string | null
  setFilter: (id: string | null) => void
}

function CourseGradeCards({
  courses, assignments, colorByCourse, codeByCourse, filter, setFilter,
}: CourseGradeCardsProps) {
  return (
    <div className="w-56 flex-shrink-0 space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Courses</p>
        {filter && (
          <button onClick={() => setFilter(null)} className="text-xs text-indigo-600 hover:underline">
            All
          </button>
        )}
      </div>

      {courses.map((c) => {
        const color = colorByCourse[c.id]
        const col = COLORS[color]
        const g = courseGradeStats(assignments, c.id)
        const openCount = assignments.filter(
          (a) => a.courseId === c.id && (a.status === 'not-started' || a.status === 'in-progress'),
        ).length
        const isActive = filter === c.id

        return (
          <button
            key={c.id}
            onClick={() => setFilter(isActive ? null : c.id)}
            className={`w-full rounded-2xl border border-l-4 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md ${col.border} ${isActive ? `ring-2 ${col.ring}` : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.pill}`}>
                  {codeByCourse[c.id]}
                </span>
                <p className="mt-1 text-sm font-bold leading-tight text-slate-800">{c.title}</p>
                <p className="truncate text-xs text-slate-400">{c.teacherName}</p>
              </div>
              {g ? (
                <div className="flex-shrink-0 text-right">
                  <p className={`text-xl font-bold leading-none ${gradeTextCls(g.pct)}`}>
                    {letterGrade(g.pct)}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">{g.pct}%</p>
                </div>
              ) : (
                <p className="flex-shrink-0 text-xs italic text-slate-300">No grades</p>
              )}
            </div>
            {g && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${gradeBarCls(g.pct)}`} style={{ width: `${g.pct}%` }} />
              </div>
            )}
            {openCount > 0 && (
              <p className="mt-1.5 text-xs font-semibold text-amber-600">{openCount} open</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── WeekStrip ────────────────────────────────────────────────────────────────

interface WeekStripProps {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  dayFilter: string | null
  setDayFilter: (d: string | null) => void
}

function WeekStrip({ assignments, colorByCourse, dayFilter, setDayFilter }: WeekStripProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const week = getCenteredDates(weekOffset)
  const today = todayStr()

  const centerDate = week[3].date
  const centerD = new Date(centerDate + 'T12:00:00')
  const weekLabel = centerD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Nav row */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 7)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{weekLabel}</span>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 7)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          ›
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-1">
        {week.map(({ date, label }) => {
          const items = assignments.filter(
            (a) => a.due === date && a.status !== 'graded' && a.status !== 'submitted',
          )
          const isToday = date === today
          const isPast = daysUntil(date) < 0
          const isActive = dayFilter === date
          const totalPts = items.reduce((s, a) => s + a.points, 0)

          return (
            <button
              key={date}
              onClick={() => setDayFilter(isActive ? null : date)}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition ${
                isActive ? 'bg-indigo-600 text-white'
                : isToday ? 'bg-indigo-50'
                : 'hover:bg-slate-50'
              }`}
            >
              <span className={`text-xs font-semibold ${isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                {label}
              </span>
              <span className={`text-sm font-bold ${isActive ? 'text-white' : isToday ? 'text-indigo-600' : isPast ? 'text-slate-300' : 'text-slate-800'}`}>
                {new Date(date + 'T12:00:00').getDate()}
              </span>
              <div className="flex gap-0.5">
                {items.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white/70' : COLORS[colorByCourse[a.courseId]].dot}`}
                  />
                ))}
              </div>
              {totalPts > 0 && (
                <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  {totalPts}pt
                </span>
              )}
            </button>
          )
        })}
      </div>

      {dayFilter && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-xs text-slate-500">Showing {dateLabel(dayFilter)}</span>
          <button onClick={() => setDayFilter(null)} className="text-xs text-indigo-600 hover:underline">
            Show all
          </button>
        </div>
      )}
    </div>
  )
}

// ─── TodoAgenda ───────────────────────────────────────────────────────────────

interface TodoAgendaProps {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  courseFilter: string | null
  dayFilter: string | null
}

function TodoAgenda({
  assignments, colorByCourse, codeByCourse, courseFilter, dayFilter,
}: TodoAgendaProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [checkingOff, setCheckingOff] = useState<string | null>(null)

  function handleCheckOff(e: React.MouseEvent, assignmentId: string) {
    e.preventDefault()
    e.stopPropagation()
    setCheckingOff(assignmentId)
    startTransition(async () => {
      await checkOffAssignment(assignmentId)
      router.refresh()
      setCheckingOff(null)
    })
  }
  const open = filterOpenAssignments(assignments, courseFilter, dayFilter)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())

  const byDate: Record<string, typeof open> = {}
  for (const a of open) {
    const key = a.due!
    byDate[key] = byDate[key] ? [...byDate[key], a] : [a]
  }
  const dateGroups = Object.keys(byDate).sort()

  if (dateGroups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
        All caught up! 🎉
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {dateGroups.map((date) => {
        const days = daysUntil(date)
        return (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`text-sm font-bold ${days < 0 ? 'text-red-600' : days === 1 ? 'text-amber-700' : 'text-slate-700'}`}>
                {dateLabel(date)}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {byDate[date].map((a) => {
                const col = COLORS[colorByCourse[a.courseId]]
                const isCheckingThis = checkingOff === a.id
                return (
                  <div
                    key={a.id}
                    className="flex items-stretch border-b border-slate-50 last:border-0"
                  >
                    <Link
                      href={`/course/${a.courseId}/assignment/${a.id}`}
                      className="flex flex-1 items-center gap-0 hover:bg-slate-50 transition"
                    >
                      <div className={`w-1 self-stretch flex-shrink-0 ${col.leftBar}`} />
                      <div className="flex flex-1 items-center gap-3 px-3 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${col.pill}`}>
                              {codeByCourse[a.courseId]}
                            </span>
                            {a.status === 'in-progress' && (
                              <span className="text-xs font-medium text-blue-600">In progress</span>
                            )}
                          </div>
                          <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                          <p className="text-xs text-slate-400">
                            {a.due} · {a.points}pts
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleCheckOff(e, a.id)}
                      disabled={isPending}
                      title="Mark as turned in (paper / in-class)"
                      className="flex w-10 flex-shrink-0 items-center justify-center border-l border-slate-100 text-slate-300 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isCheckingThis ? (
                        <span className="text-xs text-slate-400">…</span>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── CompletedList (Strikethrough style — #23) ────────────────────────────────

interface CompletedListProps {
  assignments: StudentDashboardAssignment[]
  courses: StudentDashboardCourse[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  courseFilter: string | null
}

function CompletedList({
  assignments, courses, colorByCourse, codeByCourse, courseFilter,
}: CompletedListProps) {
  const completed = assignments
    .filter((a) =>
      (a.status === 'graded' || a.status === 'submitted')
      && (!courseFilter || a.courseId === courseFilter),
    )
    .sort((a, b) => {
      if (!a.due && !b.due) return 0
      if (!a.due) return 1
      if (!b.due) return -1
      return new Date(b.due).getTime() - new Date(a.due).getTime()
    })

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
        Nothing completed yet.
      </div>
    )
  }

  const visibleCourses = courses.filter(
    (c) => !courseFilter || c.id === courseFilter,
  )

  return (
    <div className="space-y-5">
      {visibleCourses.map((c) => {
        const items = completed.filter((a) => a.courseId === c.id)
        if (items.length === 0) return null
        const col = COLORS[colorByCourse[c.id]]
        const gradedItems = items.filter((a) => a.status === 'graded')
        const earnedPts = gradedItems.reduce((s, a) => s + (a.grade ?? 0), 0)
        const totalPts = gradedItems.reduce((s, a) => s + a.points, 0)
        const pct = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : null

        return (
          <div key={c.id}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${col.pill}`}>
                {codeByCourse[c.id]}
              </span>
              {pct !== null && (
                <span className={`text-xs font-semibold ${gradeTextCls(pct)}`}>
                  {earnedPts}/{totalPts} pts · {pct}%
                </span>
              )}
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {items.map((a) => {
                const isGraded = a.status === 'graded'
                const scorePct =
                  isGraded && a.grade !== undefined
                    ? Math.round((a.grade / a.points) * 100)
                    : null

                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-0 border-b border-slate-50 last:border-0 bg-slate-50/50"
                  >
                    <div className={`w-1 self-stretch flex-shrink-0 opacity-40 ${col.leftBar}`} />
                    <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
                      {/* Status circle */}
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${isGraded ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                        {isGraded ? (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className="text-xs leading-none text-white">…</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-400 line-through decoration-slate-300">
                          {a.title}
                        </p>
                        <p className="text-xs text-slate-300">{a.due} · {a.points}pts</p>
                      </div>

                      {isGraded && scorePct !== null && a.grade !== undefined ? (
                        <div className="flex-shrink-0 text-right">
                          <p className={`text-sm font-bold ${gradeTextCls(scorePct)}`}>
                            {a.grade}/{a.points}
                          </p>
                          <p className={`text-xs font-semibold ${gradeTextCls(scorePct)}`}>
                            {scorePct}%
                          </p>
                        </div>
                      ) : (
                        <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
                          Awaiting grade
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── StudentDashboard (main) ──────────────────────────────────────────────────

interface Props {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
}

export function StudentDashboard({ courses, assignments }: Props) {
  const [courseFilter, setCourseFilter] = useState<string | null>(null)
  const [tab, setTab] = useState<'todo' | 'completed'>('todo')
  const [dayFilter, setDayFilter] = useState<string | null>(null)

  // Deterministic color + code per course
  const colorByCourse: Record<string, PaletteColor> = Object.fromEntries(
    courses.map((c, i) => [c.id, assignColor(i)]),
  )
  const codeByCourse: Record<string, string> = Object.fromEntries(
    courses.map((c) => [c.id, courseCode(c.title)]),
  )

  const openCount = assignments.filter(
    (a) =>
      (a.status === 'not-started' || a.status === 'in-progress')
      && (!courseFilter || a.courseId === courseFilter),
  ).length
  const completedCount = assignments.filter(
    (a) =>
      (a.status === 'graded' || a.status === 'submitted')
      && (!courseFilter || a.courseId === courseFilter),
  ).length

  const streak = calcStreak(assignments.map((a) => a.submittedAt))

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div className="mx-auto flex max-w-5xl gap-6 px-4 py-8">
      {/* Left pane */}
      <CourseGradeCards
        courses={courses}
        assignments={assignments}
        colorByCourse={colorByCourse}
        codeByCourse={codeByCourse}
        filter={courseFilter}
        setFilter={setCourseFilter}
      />

      {/* Right pane */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{dayName}, {dateStr}</p>
            <h1 className="text-lg font-bold text-slate-900">This Week</h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
              <span>🔥</span>
              <p className="text-xs font-bold text-orange-700">{streak} day streak</p>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="mb-4 flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab('todo')}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${tab === 'todo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            To-Do
            {openCount > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${tab === 'todo' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {openCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${tab === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Completed
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${tab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {completedCount}
            </span>
          </button>
        </div>

        {tab === 'todo' ? (
          <>
            <div className="mb-5">
              <WeekStrip
                assignments={courseFilter ? assignments.filter((a) => a.courseId === courseFilter) : assignments}
                colorByCourse={colorByCourse}
                dayFilter={dayFilter}
                setDayFilter={setDayFilter}
              />
            </div>
            <TodoAgenda
              assignments={assignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              courseFilter={courseFilter}
              dayFilter={dayFilter}
            />
          </>
        ) : (
          <CompletedList
            assignments={assignments}
            courses={courses}
            colorByCourse={colorByCourse}
            codeByCourse={codeByCourse}
            courseFilter={courseFilter}
          />
        )}
      </div>
    </div>
  )
}
