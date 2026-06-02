'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle, Pencil, Check, Sparkles, X } from 'lucide-react'
import {
  computeCourseGrade,
  computeOverallGpa,
  getJustGradedAssignment,
  buildPathToTarget,
  gpaToArcFraction,
  type AssignmentInput,
  type GradeWithFeedback,
  type CourseGradeInput,
  type Milestone,
} from '@/lib/grade-summary'
import { setStudentGoal } from '@/app/actions/grades'
import { assignmentHref } from '@/lib/routes'
import type { StudentDashboardCourse, StudentDashboardAssignment } from '@/app/actions/dashboard'

type CourseColorTokens = {
  accent: string
  border: string
  bar: string
  pill: string
  dot: string
  soft: string
  iconBg: string
  hex: string
}

function gradeTextColor(letter: string): string {
  if (letter.startsWith('A')) return 'text-emerald-600'
  if (letter.startsWith('B')) return 'text-blue-600'
  if (letter.startsWith('C')) return 'text-amber-600'
  return 'text-red-600'
}

function qualityLabel(pct: number): { text: string; classes: string } {
  if (pct >= 90) return { text: 'EXCELLENT', classes: 'bg-emerald-100 text-emerald-700' }
  if (pct >= 75) return { text: 'GOOD', classes: 'bg-blue-100 text-blue-700' }
  return { text: 'NEEDS WORK', classes: 'bg-amber-100 text-amber-700' }
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function courseStatusPhrase(assignments: AssignmentInput[]): string {
  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const imminentAssessment = assignments.find((a) => {
    if (!a.due) return false
    const diff = new Date(a.due).getTime() - now
    return diff > 0 && diff <= sevenDaysMs && /midterm|final/i.test(a.title)
  })
  if (imminentAssessment) {
    return /midterm/i.test(imminentAssessment.title) ? 'Midterm next week' : 'Final next week'
  }
  const pending = assignments.filter(
    (a) => a.status === 'not-started' || a.status === 'in-progress',
  )
  if (pending.length === 0) return 'Up to date'
  return `${pending.length} pending task${pending.length !== 1 ? 's' : ''}`
}

function buildCoachInsight(
  currentGpa: number,
  milestones: Milestone[],
  targetGpa: number | null,
): string {
  if (targetGpa === null) {
    return 'Set a semester GPA goal above to get personalized coaching on how to reach it.'
  }
  if (currentGpa >= targetGpa) {
    return `You're on track! Your current GPA is ${currentGpa.toFixed(1)}, meeting your ${targetGpa.toFixed(1)} goal. Keep it up.`
  }
  const pending = milestones.find((m) => !m.done)
  if (!pending) {
    return `No upcoming high-point assignments found. Check back as your teachers post new work.`
  }
  const assignmentName = pending.label.replace(/ > \d+%$/, '')
  return `To reach your ${targetGpa.toFixed(1)} GPA goal, aim for ${Math.round(pending.requiredPct)}% or higher on your upcoming ${assignmentName}. It carries the most weight — focus your effort there first.`
}

// ---------------------------------------------------------------------------
// CourseGradeCard
// ---------------------------------------------------------------------------

function CourseGradeCard({
  course,
  courseAssignments,
  colorTokens,
  code,
}: {
  course: StudentDashboardCourse
  courseAssignments: AssignmentInput[]
  colorTokens: CourseColorTokens
  code: string
}) {
  const result = computeCourseGrade(courseAssignments)
  const hasGrades = courseAssignments.some((a) => a.status === 'graded')
  const status = courseStatusPhrase(courseAssignments)

  return (
    <article
      className={`rounded-xl border border-l-4 bg-white p-5 shadow-sm ${colorTokens.border}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${colorTokens.pill}`}>
            {code}
          </span>
          <h2 className="mt-2 text-base font-semibold text-slate-950">{course.title}</h2>
          <p className="text-sm text-slate-500">{course.teacherName}</p>
          <p className="mt-1 text-xs text-slate-400">{status}</p>
        </div>
        {hasGrades ? (
          <div className="text-right">
            <p className={`text-2xl font-bold ${gradeTextColor(result.letter)}`}>
              {result.letter}
            </p>
            <p className="text-sm text-slate-500">{result.percentage.toFixed(1)}%</p>
          </div>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            No grades yet
          </span>
        )}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// JustGradedPanel
// ---------------------------------------------------------------------------

function JustGradedPanel({ grade }: { grade: GradeWithFeedback }) {
  const pct = Math.round((grade.finalScore / grade.pointsPossible) * 100)
  const quality = qualityLabel(pct)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-xs font-bold tracking-widest text-violet-600">JUST GRADED</p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{grade.assignmentTitle}</h2>
          <p className="text-sm text-slate-500">
            Graded {relativeTime(grade.approvedAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-950">{pct}%</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${quality.classes}`}
          >
            {quality.text}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-violet-50 p-4">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
          <Sparkles size={12} />
          AI Feedback Summary
        </p>
        <p className="text-sm leading-relaxed text-slate-700">{grade.finalFeedback}</p>
      </div>

      <Link
        href={assignmentHref(grade.courseId, grade.assignmentId)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Review Full Rubric
      </Link>
    </section>
  )
}

// ---------------------------------------------------------------------------
// GpaDonut — pure SVG
// ---------------------------------------------------------------------------

function GpaDonut({
  currentGpa,
  targetGpa,
}: {
  currentGpa: number
  targetGpa: number | null
}) {
  const R = 52
  const C = 2 * Math.PI * R
  const CENTER = 64
  const currentFraction = gpaToArcFraction(currentGpa)

  // Target tick mark position (angle in radians, starting from top = -π/2)
  const targetAngle =
    targetGpa !== null
      ? (gpaToArcFraction(targetGpa) * 2 * Math.PI - Math.PI / 2)
      : null
  const tickInner = R - 7
  const tickOuter = R + 7

  return (
    <svg
      viewBox="0 0 128 128"
      width="160"
      height="160"
      aria-label={`Current GPA: ${currentGpa.toFixed(1)}`}
    >
      {/* Background ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
      />
      {/* Current GPA arc */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${currentFraction * C} ${C}`}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      {/* Target GPA tick mark */}
      {targetAngle !== null && (
        <line
          x1={CENTER + tickInner * Math.cos(targetAngle)}
          y1={CENTER + tickInner * Math.sin(targetAngle)}
          x2={CENTER + tickOuter * Math.cos(targetAngle)}
          y2={CENTER + tickOuter * Math.sin(targetAngle)}
          stroke="#d97706"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {/* Center label */}
      <text
        x={CENTER}
        y={CENTER - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize="22"
        fontWeight="700"
        fill="#0f172a"
      >
        {currentGpa.toFixed(1)}
      </text>
      <text
        x={CENTER}
        y={CENTER + 12}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize="8"
        fontWeight="500"
        fill="#64748b"
        letterSpacing="1"
      >
        CURRENT GPA
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SemesterGoalWidget
// ---------------------------------------------------------------------------

function SemesterGoalWidget({
  currentGpa,
  courseGradeInputs,
  initialTargetGpa,
}: {
  currentGpa: number
  courseGradeInputs: CourseGradeInput[]
  initialTargetGpa: number | null
}) {
  const [targetGpa, setTargetGpa] = useState<number | null>(initialTargetGpa)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const milestones = targetGpa !== null ? buildPathToTarget(courseGradeInputs, targetGpa) : []

  function handleSave() {
    const val = parseFloat(inputVal)
    if (isNaN(val) || val < 0 || val > 4.0) {
      setInputError('Enter a number between 0.0 and 4.0')
      return
    }
    setInputError(null)
    startTransition(async () => {
      await setStudentGoal(val)
      setTargetGpa(val)
      setEditing(false)
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          Semester Goal
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setInputVal(targetGpa !== null ? targetGpa.toFixed(1) : '')
              setEditing(true)
            }}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            <Pencil size={11} />
            Edit Goals
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <GpaDonut currentGpa={currentGpa} targetGpa={targetGpa} />
      </div>

      {targetGpa !== null && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Target: <span className="font-semibold text-slate-700">{targetGpa.toFixed(1)} GPA</span>{' '}
          by end of term
        </p>
      )}

      {editing && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Target GPA (0.0 – 4.0)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. 3.8"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setInputError(null)
              }}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
            >
              <X size={14} />
            </button>
          </div>
          {inputError && <p className="mt-1 text-xs text-red-600">{inputError}</p>}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            Path to Target
          </p>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.assignmentId} className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    m.done ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`text-sm ${
                    m.done ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {targetGpa === null && !editing && (
        <p className="mt-3 text-center text-xs text-slate-400">
          No goal set yet — click Edit Goals to add one.
        </p>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// CoachInsightWidget
// ---------------------------------------------------------------------------

function CoachInsightWidget({
  currentGpa,
  courseGradeInputs,
  targetGpa,
}: {
  currentGpa: number
  courseGradeInputs: CourseGradeInput[]
  targetGpa: number | null
}) {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const milestones = targetGpa !== null ? buildPathToTarget(courseGradeInputs, targetGpa) : []
  const insight = buildCoachInsight(currentGpa, milestones, targetGpa)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <Sparkles size={14} />
        </span>
        <h2 className="text-sm font-semibold text-slate-950">Coach Insight</h2>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{insight}</p>

      <button
        type="button"
        onClick={() => {
          setShowComingSoon(true)
          setTimeout(() => setShowComingSoon(false), 3000)
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-amber-500 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        <Sparkles size={14} />
        Generate Study Plan
      </button>

      {showComingSoon && (
        <p className="mt-2 text-center text-xs text-slate-500">Coming soon — stay tuned!</p>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Helpers for the per-course detail view
// ---------------------------------------------------------------------------

function deriveCourseCode(title: string): string {
  const match = title.match(/[A-Z]{2,}\s*\d{2,}/)
  if (match) return match[0]
  const words = title
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(the|and|for|with|of)$/i.test(w))
  return (words.length ? words : [title])
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 5)
}

function countMissingLate(assignments: StudentDashboardAssignment[]): number {
  const now = Date.now()
  return assignments.filter(
    (a) =>
      a.due !== null &&
      new Date(a.due).getTime() < now &&
      a.status !== 'submitted' &&
      a.status !== 'graded',
  ).length
}

const DEFAULT_PALETTE_TOKENS: CourseColorTokens[] = [
  { accent: 'text-violet-700',  border: 'border-l-violet-500',  bar: 'bg-violet-500',  pill: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  soft: 'bg-violet-50',  iconBg: 'bg-violet-100',  hex: '#7c3aed' },
  { accent: 'text-blue-700',    border: 'border-l-blue-500',    bar: 'bg-blue-500',    pill: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500',    soft: 'bg-blue-50',    iconBg: 'bg-blue-100',    hex: '#2563eb' },
  { accent: 'text-emerald-700', border: 'border-l-emerald-500', bar: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500', soft: 'bg-emerald-50', iconBg: 'bg-emerald-100', hex: '#059669' },
  { accent: 'text-amber-700',   border: 'border-l-amber-500',   bar: 'bg-amber-500',   pill: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500',   soft: 'bg-amber-50',   iconBg: 'bg-amber-100',   hex: '#d97706' },
  { accent: 'text-rose-700',    border: 'border-l-rose-500',    bar: 'bg-rose-500',    pill: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500',    soft: 'bg-rose-50',    iconBg: 'bg-rose-100',    hex: '#e11d48' },
]

const FALLBACK_TOKENS: CourseColorTokens = {
  accent: 'text-slate-700', border: 'border-l-slate-400', bar: 'bg-slate-400',
  pill: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400', soft: 'bg-slate-50',
  iconBg: 'bg-slate-100', hex: '#64748b',
}

const MOCK_CATEGORIES = [
  { label: 'Quizzes', weight: 20, pct: 95, barClass: 'bg-emerald-500' },
  { label: 'Exams',   weight: 50, pct: 88, barClass: 'bg-blue-500' },
  { label: 'Labs',    weight: 30, pct: 92, barClass: 'bg-emerald-400' },
] as const

const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  submitted:     'Submitted',
  graded:        'Graded',
}

const ASSIGNMENT_STATUS_PILL: Record<string, string> = {
  'not-started': 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-amber-100 text-amber-700',
  submitted:     'bg-blue-100 text-blue-700',
  graded:        'bg-emerald-100 text-emerald-700',
}

// ---------------------------------------------------------------------------
// CourseDetailView — per-course breakdown shown when a tab is selected
// ---------------------------------------------------------------------------

function CourseDetailView({
  course,
  courseAssignments,
  colorTokens,
}: {
  course: StudentDashboardCourse
  courseAssignments: StudentDashboardAssignment[]
  colorTokens: CourseColorTokens
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const result = computeCourseGrade(courseAssignments)
  const hasGrades = courseAssignments.some((a) => a.status === 'graded')
  const missingLate = countMissingLate(courseAssignments)

  const filteredAssignments =
    statusFilter === 'all'
      ? courseAssignments
      : courseAssignments.filter((a) => a.status === statusFilter)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{course.title}</h2>
        <p className="text-sm text-slate-500">{course.teacherName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">COURSE STANDING</p>
          {hasGrades ? (
            <>
              <p className={`mt-2 text-4xl font-bold ${gradeTextColor(result.letter)}`}>{result.letter}</p>
              <p className={`text-lg font-semibold ${colorTokens.accent}`}>{result.percentage.toFixed(1)}%</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Grades will appear here once your teacher publishes feedback.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">MISSING / LATE WORK</p>
          {missingLate === 0 ? (
            <div className="mt-3 flex items-start gap-2.5">
              <CheckCircle size={20} className="mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-slate-950">All caught up on work!</p>
                <p className="text-sm text-slate-500">No pending assignments due.</p>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-3xl font-bold text-red-600">{missingLate}</p>
              <p className="text-sm text-slate-500">{missingLate === 1 ? 'assignment' : 'assignments'} past due</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">CATEGORY BREAKDOWN</p>
        <div className="space-y-4">
          {MOCK_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-700">{cat.label} ({cat.weight}%)</span>
                <span className="font-semibold text-slate-950">{cat.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${cat.barClass}`} style={{ width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">Category weights are illustrative — real breakdown coming soon.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">ASSIGNMENT BREAKDOWN</p>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'graded', 'in-progress', 'not-started'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === f
                    ? 'bg-violet-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'All' : ASSIGNMENT_STATUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No assignments match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assignment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Grade</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-950">{a.title}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ASSIGNMENT_STATUS_PILL[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ASSIGNMENT_STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {a.status === 'graded' && a.grade !== undefined
                        ? `${Math.round((a.grade / a.points) * 100)}%`
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {a.status === 'graded' ? (
                        <Link href={assignmentHref(course.id, a.id)} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                          View Feedback
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">No Feedback</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GradesCommandCenter (main export)
// ---------------------------------------------------------------------------

export function GradesCommandCenter({
  courses,
  assignments,
  recentGrades,
  colorTokensByCourse,
  codeByCourse,
  initialTargetGpa,
  initialFilterCourseId = null,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  recentGrades: GradeWithFeedback[]
  colorTokensByCourse?: Record<string, CourseColorTokens>
  codeByCourse?: Record<string, string>
  initialTargetGpa: number | null
  /** Pre-select a course tab on mount (null = All Courses overview). */
  initialFilterCourseId?: string | null
}) {
  const [filterCourseId, setFilterCourseId] = useState<string | null>(initialFilterCourseId)

  const resolvedColors: Record<string, CourseColorTokens> =
    colorTokensByCourse ??
    Object.fromEntries(
      courses.map((c, i) => [c.id, DEFAULT_PALETTE_TOKENS[i % DEFAULT_PALETTE_TOKENS.length]]),
    )

  const resolvedCodes: Record<string, string> =
    codeByCourse ??
    Object.fromEntries(courses.map((c) => [c.id, deriveCourseCode(c.title)]))

  const courseGradeInputs: CourseGradeInput[] = courses.map((course) => {
    const courseAssignments = assignments.filter((a) => a.courseId === course.id)
    return {
      courseId: course.id,
      result: computeCourseGrade(courseAssignments),
      assignments: courseAssignments,
    }
  })

  const currentGpa = computeOverallGpa(courseGradeInputs.map((c) => c.result))
  const justGraded = getJustGradedAssignment(recentGrades)
  const [targetGpa, setTargetGpa] = useState<number | null>(initialTargetGpa)

  const selectedCourse = filterCourseId
    ? (courses.find((c) => c.id === filterCourseId) ?? null)
    : null
  const selectedAssignments = filterCourseId
    ? assignments.filter((a) => a.courseId === filterCourseId)
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-950">Grades Command Center</h1>

      {/* Course filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course filter">
        <button
          role="tab"
          aria-selected={filterCourseId === null}
          onClick={() => setFilterCourseId(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            filterCourseId === null
              ? 'bg-violet-600 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Courses
        </button>
        {courses.map((course) => (
          <button
            key={course.id}
            role="tab"
            aria-selected={filterCourseId === course.id}
            onClick={() => setFilterCourseId(course.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filterCourseId === course.id
                ? 'bg-violet-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {resolvedCodes[course.id] ?? course.title}
          </button>
        ))}
      </div>

      {selectedCourse !== null ? (
        <CourseDetailView
          course={selectedCourse}
          courseAssignments={selectedAssignments}
          colorTokens={resolvedColors[selectedCourse.id] ?? FALLBACK_TOKENS}
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ── Left column ── */}
          <div className="min-w-0 flex-1 space-y-5">
            {courses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No courses enrolled yet. Your grades will appear here once your teacher publishes a course.
              </p>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const input = courseGradeInputs.find((c) => c.courseId === course.id)!
                  return (
                    <CourseGradeCard
                      key={course.id}
                      course={course}
                      courseAssignments={input.assignments}
                      colorTokens={resolvedColors[course.id] ?? FALLBACK_TOKENS}
                      code={resolvedCodes[course.id] ?? ''}
                    />
                  )
                })}
              </div>
            )}
            {justGraded && <JustGradedPanel grade={justGraded} />}
          </div>

          {/* ── Right column ── */}
          <div className="w-full space-y-5 lg:w-80 lg:shrink-0">
            <SemesterGoalWidgetControlled
              currentGpa={currentGpa}
              courseGradeInputs={courseGradeInputs}
              initialTargetGpa={initialTargetGpa}
              onTargetGpaChange={setTargetGpa}
            />
            <CoachInsightWidget
              currentGpa={currentGpa}
              courseGradeInputs={courseGradeInputs}
              targetGpa={targetGpa}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper that lifts targetGpa up to GradesCommandCenter so CoachInsightWidget stays in sync.
function SemesterGoalWidgetControlled({
  currentGpa,
  courseGradeInputs,
  initialTargetGpa,
  onTargetGpaChange,
}: {
  currentGpa: number
  courseGradeInputs: CourseGradeInput[]
  initialTargetGpa: number | null
  onTargetGpaChange: (gpa: number) => void
}) {
  const [targetGpa, setTargetGpa] = useState<number | null>(initialTargetGpa)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const milestones = targetGpa !== null ? buildPathToTarget(courseGradeInputs, targetGpa) : []

  function handleSave() {
    const val = parseFloat(inputVal)
    if (isNaN(val) || val < 0 || val > 4.0) {
      setInputError('Enter a number between 0.0 and 4.0')
      return
    }
    setInputError(null)
    startTransition(async () => {
      await setStudentGoal(val)
      setTargetGpa(val)
      onTargetGpaChange(val)
      setEditing(false)
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          Semester Goal
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setInputVal(targetGpa !== null ? targetGpa.toFixed(1) : '')
              setEditing(true)
            }}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            <Pencil size={11} />
            Edit Goals
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <GpaDonut currentGpa={currentGpa} targetGpa={targetGpa} />
      </div>

      {targetGpa !== null && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Target:{' '}
          <span className="font-semibold text-slate-700">{targetGpa.toFixed(1)} GPA</span> by end
          of term
        </p>
      )}

      {editing && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Target GPA (0.0 – 4.0)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. 3.8"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              aria-label="Save goal"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setInputError(null)
              }}
              aria-label="Cancel"
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
            >
              <X size={14} />
            </button>
          </div>
          {inputError && <p className="mt-1 text-xs text-red-600">{inputError}</p>}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            Path to Target
          </p>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.assignmentId} className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    m.done ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`text-sm ${
                    m.done ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {targetGpa === null && !editing && (
        <p className="mt-3 text-center text-xs text-slate-400">
          No goal set yet — click Edit Goals to add one.
        </p>
      )}
    </section>
  )
}
