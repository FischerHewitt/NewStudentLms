'use client'

import { useState } from 'react'
import Link from 'next/link'
import { courseHref } from '@/lib/routes'
import type { TeacherCourseSummary } from '@/lib/teacher-dashboard'

const LI = {
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  alumosPurple: '#7C3AED',
}

const HEALTH_ORDER = { urgent: 0, watch: 1, steady: 2 } as const
const HEALTH_COLOR = { urgent: '#ba1a1a', watch: '#b45309', steady: '#065f46' }
const HEALTH_BG = { urgent: '#ba1a1a18', watch: '#F59E0B18', steady: '#10B98118' }
const HEALTH_DOT = { urgent: '#ba1a1a', watch: '#F59E0B', steady: '#10B981' }

type SortKey = 'name' | 'health' | 'grading'
type SortDir = 'asc' | 'desc'

function sorted(courses: TeacherCourseSummary[], key: SortKey, dir: SortDir) {
  return [...courses].sort((a, b) => {
    let cmp = 0
    if (key === 'name') {
      cmp = a.title.localeCompare(b.title)
    } else if (key === 'health') {
      cmp = HEALTH_ORDER[a.health] - HEALTH_ORDER[b.health]
    } else if (key === 'grading') {
      cmp = b.pendingGrades - a.pendingGrades
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="material-symbols-outlined text-[14px] opacity-30">unfold_more</span>
  return (
    <span className="material-symbols-outlined text-[14px]" style={{ color: LI.alumosPurple }}>
      {dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
    </span>
  )
}

function TH({
  children,
  sortKey,
  currentKey,
  dir,
  onSort,
  right = false,
}: {
  children: React.ReactNode
  sortKey?: SortKey
  currentKey: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  right?: boolean
}) {
  const isActive = sortKey === currentKey
  const base = 'py-3 text-[10px] font-bold uppercase tracking-widest select-none'
  const align = right ? 'pr-4 text-right' : 'px-3 text-left'

  if (!sortKey) {
    return (
      <th scope="col" className={`${base} ${align} text-slate-400`}>
        {children}
      </th>
    )
  }

  return (
    <th
      scope="col"
      className={`${base} ${align} cursor-pointer`}
      style={{ color: isActive ? LI.alumosPurple : LI.onSurfaceVariant }}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <SortIcon active={isActive} dir={dir} />
      </span>
    </th>
  )
}

function HealthPill({ health, status }: { health: TeacherCourseSummary['health']; status: string }) {
  if (status === 'draft') return <span className="text-xs text-slate-400">Draft</span>
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: HEALTH_BG[health], color: HEALTH_COLOR[health] }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: HEALTH_DOT[health] }} />
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  )
}

function Row({ course, i }: { course: TeacherCourseSummary; i: number }) {
  const ACCENTS = ['#7C3AED', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#F97316']
  const accent = ACCENTS[i % ACCENTS.length]

  return (
    <tr className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: accent }} />
          <Link href={courseHref(course.id)} className="group">
            <p className="text-sm font-semibold text-slate-900 group-hover:underline">{course.title}</p>
            {course.status === 'draft' && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Draft</span>
            )}
          </Link>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-slate-600">{course.students}</td>
      <td className="px-3 py-3">
        <HealthPill health={course.health} status={course.status} />
      </td>
      <td className="px-3 py-3 font-mono text-sm font-semibold text-slate-700">
        {course.classAverage !== null ? `${course.classAverage}%` : <span className="text-slate-400">—</span>}
      </td>
      <td className="px-3 py-3">
        {course.pendingGrades > 0
          ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{course.pendingGrades} pending</span>
          : <span className="text-xs text-slate-400">—</span>}
      </td>
      <td className="px-3 py-3 text-xs text-slate-500">{course.nextDue ?? '—'}</td>
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={courseHref(course.id)}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Open
          </Link>
          {course.pendingGrades > 0 && (
            <Link
              href={courseHref(course.id)}
              className="rounded-md px-2.5 py-1 text-xs font-bold text-white"
              style={{ background: LI.alumosPurple }}
            >
              Grade
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}

export function TeacherCoursesPage({ courses }: { courses: TeacherCourseSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('health')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rows = sorted(courses, sortKey, sortDir)
  const published = courses.filter(c => c.status === 'published')
  const urgent = courses.filter(c => c.health === 'urgent').length
  const totalPending = courses.reduce((s, c) => s + c.pendingGrades, 0)

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: LI.onSurface }}>Courses</h1>
          <div className="mt-1.5 flex gap-4 text-sm" style={{ color: LI.onSurfaceVariant }}>
            <span>{published.length} active</span>
            {courses.length > published.length && <span>{courses.length - published.length} draft</span>}
            {urgent > 0 && <span className="font-semibold text-red-700">{urgent} urgent</span>}
            {totalPending > 0 && <span className="font-semibold text-amber-700">{totalPending} to grade</span>}
          </div>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899, #7C3AED)' }}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <span className="material-symbols-outlined text-[40px] text-slate-300">school</span>
          <p className="text-sm font-semibold text-slate-500">No courses yet</p>
          <Link href="/generate" className="text-sm font-semibold underline" style={{ color: LI.alumosPurple }}>
            Create your first course →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: LI.outlineVariant }}>
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <TH sortKey="name" currentKey={sortKey} dir={sortDir} onSort={handleSort}>Course</TH>
                <TH sortKey={undefined} currentKey={sortKey} dir={sortDir} onSort={handleSort}>Students</TH>
                <TH sortKey="health" currentKey={sortKey} dir={sortDir} onSort={handleSort}>Health</TH>
                <TH sortKey={undefined} currentKey={sortKey} dir={sortDir} onSort={handleSort}>Class Avg</TH>
                <TH sortKey="grading" currentKey={sortKey} dir={sortDir} onSort={handleSort}>Grading</TH>
                <TH sortKey={undefined} currentKey={sortKey} dir={sortDir} onSort={handleSort}>Next Due</TH>
                <TH sortKey={undefined} currentKey={sortKey} dir={sortDir} onSort={handleSort} right>Actions</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((course, i) => <Row key={course.id} course={course} i={i} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
