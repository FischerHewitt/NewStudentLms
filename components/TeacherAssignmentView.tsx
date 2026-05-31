'use client'

import Link from 'next/link'
import { speedgraderHref } from '@/lib/routes'
import type { AssignmentWithDetails, SubmissionData } from '@/app/actions/assignment'

const LI = {
  surface: '#F8FAFC',
  card: '#ffffff',
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  alumosPurple: '#7C3AED',
  alumosOrange: '#F59E0B',
  successGreen: '#10B981',
  warningAmber: '#F59E0B',
}
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

interface Props {
  courseId: string
  assignment: AssignmentWithDetails
  allSubmissions: SubmissionData[]
}

export function TeacherAssignmentView({ courseId, assignment, allSubmissions }: Props) {
  const criteria = assignment.rubric?.criteria ?? []
  const submitted = allSubmissions.filter((s) => s.status === 'submitted').length
  const graded = allSubmissions.filter((s) => s.status === 'graded').length

  return (
    <div className="min-h-screen" style={{ background: LI.surface }}>
      <div className="mx-auto max-w-[1280px] px-8 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1
              className="mb-2 text-3xl font-bold"
              style={{ color: LI.onSurface, fontFamily: 'var(--font-hanken, system-ui)' }}
            >
              {assignment.title}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: '#e4e2e4', color: LI.onSurfaceVariant }}
              >
                Draft
              </span>
              <span className="text-sm" style={{ color: LI.onSurfaceVariant }}>
                {submitted} submitted · {graded} graded
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/course/${courseId}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
              style={{ borderColor: LI.outlineVariant, color: LI.onSurface }}
            >
              ← Back
            </Link>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm"
              style={{ background: LI.alumosOrange }}
            >
              Publish Assignment
            </button>
          </div>
        </div>

        {/* Command Center Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Left: Core Settings + Rubric (8 cols) */}
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-8">

            {/* Core Settings */}
            <section
              className="rounded-xl p-6 shadow-sm"
              style={{ background: LI.card, border: `1px solid ${LI.outlineVariant}` }}
            >
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: LI.onSurfaceVariant }}
              >
                Core Settings
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: LI.onSurface }}>
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    defaultValue={assignment.title}
                    readOnly
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{
                      background: LI.surface,
                      border: `1px solid ${LI.outlineVariant}`,
                      color: LI.onSurface,
                    }}
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-end justify-between">
                    <label className="text-sm font-medium" style={{ color: LI.onSurface }}>
                      Description &amp; Prompt
                    </label>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-medium transition hover:opacity-70"
                      style={{ color: LI.alumosPurple }}
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      Refine with AI
                    </button>
                  </div>
                  <div
                    className="overflow-hidden rounded-lg"
                    style={{ border: `1px solid ${LI.outlineVariant}` }}
                  >
                    <div
                      className="flex items-center gap-1 border-b p-2"
                      style={{ background: LI.surface, borderColor: LI.outlineVariant }}
                    >
                      {['format_bold', 'format_italic', 'format_underlined', 'format_list_bulleted', 'link'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className="rounded p-1 transition hover:bg-slate-100"
                          style={{ color: LI.onSurfaceVariant }}
                        >
                          <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      defaultValue={assignment.instructions}
                      readOnly
                      rows={6}
                      className="w-full resize-y p-4 text-sm focus:outline-none"
                      style={{ background: 'transparent', color: LI.onSurface }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: LI.onSurface }}>
                      Points Possible
                    </label>
                    <input
                      type="number"
                      defaultValue={assignment.points_possible}
                      readOnly
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                      style={{ background: LI.surface, border: `1px solid ${LI.outlineVariant}`, color: LI.onSurface }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: LI.onSurface }}>
                      Due Date
                    </label>
                    <input
                      type="text"
                      defaultValue={assignment.due_date ?? '—'}
                      readOnly
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                      style={{ background: LI.surface, border: `1px solid ${LI.outlineVariant}`, color: LI.onSurface }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Evaluation Rubric */}
            <section
              className="overflow-hidden rounded-xl shadow-sm"
              style={{ background: LI.card, border: `1px solid ${LI.outlineVariant}` }}
            >
              <div
                className="flex items-center justify-between border-b p-6"
                style={{ borderColor: LI.outlineVariant }}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: LI.onSurfaceVariant }}>
                    fact_check
                  </span>
                  <h2
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: LI.onSurfaceVariant }}
                  >
                    Evaluation Rubric
                  </h2>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: LI.alumosPurple }}
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add
                </button>
              </div>
              <div className="space-y-3 p-6">
                {criteria.length === 0 ? (
                  <p className="text-sm" style={{ color: LI.onSurfaceVariant }}>No rubric criteria defined.</p>
                ) : (
                  criteria.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-4"
                      style={{ background: LI.surface, border: `1px solid ${LI.outlineVariant}` }}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold" style={{ color: LI.onSurface }}>{c.description}</p>
                        <span
                          className="shrink-0 rounded px-2 py-0.5 text-xs font-medium tabular-nums"
                          style={{ background: '#f0edef', color: LI.onSurfaceVariant }}
                        >
                          {c.points} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right: AI Co-Pilot + Submissions (4 cols) */}
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">

            {/* AI Co-Pilot */}
            <section
              className="overflow-hidden rounded-xl shadow-sm"
              style={{ background: LI.card, border: `1px solid ${LI.outlineVariant}` }}
            >
              {/* Gradient top accent */}
              <div style={{ height: 2, background: AI_GRADIENT }} />
              <div className="border-b p-6" style={{ borderColor: LI.outlineVariant }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: LI.alumosPurple }}>
                    smart_toy
                  </span>
                  <h2
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: LI.onSurfaceVariant }}
                  >
                    AI Co-Pilot
                  </h2>
                </div>
              </div>
              <div className="space-y-5 p-6">
                {/* Grade prediction */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: LI.onSurfaceVariant }}>
                      Grade Prediction
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{
                        background: AI_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      84–92%
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{ background: '#e4e2e4' }}
                  >
                    <div className="h-full w-[88%] rounded-full" style={{ background: AI_GRADIENT }} />
                  </div>
                </div>

                {/* Insight */}
                <div
                  className="flex items-start gap-3 rounded-lg p-3"
                  style={{ background: LI.surface, border: `1px solid ${LI.outlineVariant}` }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: LI.alumosPurple }}>
                    lightbulb
                  </span>
                  <p className="text-sm" style={{ color: LI.onSurfaceVariant }}>
                    Students may struggle with this topic based on past submission patterns.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg py-2 text-sm font-semibold transition"
                  style={{
                    background: `${LI.alumosPurple}1a`,
                    color: LI.alumosPurple,
                  }}
                >
                  View Full AI Analysis
                </button>

                {/* Chat */}
                <div className="border-t pt-5" style={{ borderColor: LI.outlineVariant }}>
                  <p
                    className="mb-3 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: LI.onSurfaceVariant }}
                  >
                    Chat
                  </p>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                      style={{ background: AI_GRADIENT }}
                    >
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    </div>
                    <div
                      className="flex-1 rounded-lg rounded-tl-none p-4 shadow-sm"
                      style={{ background: LI.surface, border: `1px solid ${LI.outlineVariant}` }}
                    >
                      <p className="mb-3 text-sm" style={{ color: LI.onSurface }}>
                        <strong className="font-medium">AI Suggestion:</strong> Consider adding a sentence
                        requiring students to cite at least three secondary scholarly sources.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                          style={{ background: AI_GRADIENT }}
                        >
                          <span className="material-symbols-outlined text-[14px]">done</span>
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1.5 text-xs transition"
                          style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-4">
                    <input
                      type="text"
                      placeholder="Ask AI to refine..."
                      className="w-full rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none"
                      style={{
                        background: LI.card,
                        border: `1px solid ${LI.outlineVariant}`,
                        color: LI.onSurface,
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-purple-50"
                      style={{ color: LI.alumosPurple }}
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Submissions */}
            <section
              className="overflow-hidden rounded-xl shadow-sm"
              style={{ background: LI.card, border: `1px solid ${LI.outlineVariant}` }}
            >
              <div className="border-b p-5" style={{ borderColor: LI.outlineVariant }}>
                <h2
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: LI.onSurfaceVariant }}
                >
                  Submissions · {allSubmissions.length}
                </h2>
              </div>
              {allSubmissions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm" style={{ color: LI.onSurfaceVariant }}>No submissions yet.</p>
                </div>
              ) : (
                <ul className="divide-y" style={{ borderColor: LI.outlineVariant }}>
                  {allSubmissions.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LI.onSurface }}>
                          {sub.studentName}
                        </p>
                        {sub.submitted_at && (
                          <p className="mt-0.5 text-xs" style={{ color: LI.onSurfaceVariant }}>
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={sub.status} />
                        <Link
                          href={speedgraderHref(courseId, sub.id)}
                          className="rounded-lg px-3 py-1 text-xs font-bold text-white"
                          style={{ background: AI_GRADIENT }}
                        >
                          Grade
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: 'draft' | 'submitted' | 'graded' }) {
  if (status === 'submitted') {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
        Submitted
      </span>
    )
  }
  if (status === 'graded') {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
        Graded
      </span>
    )
  }
  return null
}
