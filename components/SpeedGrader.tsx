'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { runSpeedGrader, approveGrade } from '@/app/actions/speedgrader'
import type { SpeedGraderData, GradeData } from '@/app/actions/speedgrader'

interface Props {
  courseId: string
  data: SpeedGraderData
  /**
   * When true and no Grade exists yet, the SpeedGrader fires automatically
   * on mount. Controlled by the teacher's `speedgrader_autorun` preference.
   */
  autorun: boolean
}

type PanelState = 'idle' | 'running' | 'pending' | 'approved'

function getInitialState(grade: GradeData | null): PanelState {
  if (!grade) return 'idle'
  if (grade.approved_at) return 'approved'
  return 'pending'
}

export function SpeedGrader({ courseId, data, autorun }: Props) {
  const router = useRouter()
  const { submission, assignment } = data

  const [grade, setGrade] = useState<GradeData | null>(data.grade)
  const [finalScore, setFinalScore] = useState<number>(
    data.grade?.final_score ?? data.grade?.ai_suggested_score ?? 0,
  )
  const [finalFeedback, setFinalFeedback] = useState(
    data.grade?.final_feedback ?? data.grade?.ai_suggested_feedback ?? '',
  )
  const [panelState, setPanelState] = useState<PanelState>(
    getInitialState(data.grade),
  )
  const [errorMsg, setErrorMsg] = useState('')
  const [isRunning, startRunTransition] = useTransition()
  const [isApproving, startApproveTransition] = useTransition()

  const handleRunSpeedGrader = () => {
    setErrorMsg('')
    startRunTransition(async () => {
      setPanelState('running')
      const result = await runSpeedGrader(submission.id)
      if (result.error) {
        setErrorMsg(result.error)
        setPanelState('idle')
        return
      }
      if (result.grade) {
        setGrade(result.grade)
        setFinalScore(result.grade.ai_suggested_score)
        setFinalFeedback(result.grade.ai_suggested_feedback)
        setPanelState('pending')
      }
    })
  }

  const handleApprove = () => {
    if (!grade) return
    setErrorMsg('')
    startApproveTransition(async () => {
      const result = await approveGrade(grade.id, finalScore, finalFeedback)
      if (result.error) {
        setErrorMsg(result.error)
        return
      }
      setPanelState('approved')
      router.refresh()
    })
  }

  // Autorun: if the teacher has enabled autorun and no grade exists yet,
  // fire the SpeedGrader automatically on mount. Intentionally mount-only —
  // panelState and handleRunSpeedGrader must NOT be in the dep array.
  useEffect(() => {
    if (autorun && panelState === 'idle') {
      handleRunSpeedGrader()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/course/${courseId}/assignment/${assignment.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
        >
          ← Back to assignment
        </Link>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          AI SpeedGrader
        </span>
      </div>

      {/* Grade published banner */}
      {panelState === 'approved' && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span>✓</span>
          <span>Grade published — student can now see their final score and feedback.</span>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: student submission ─────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Student Submission
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">
              {submission.studentName}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {submission.body || (
                <span className="italic text-slate-400">No content submitted.</span>
              )}
            </p>
          </div>
        </div>

        {/* ── Right: SpeedGrader panel ──────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Assignment details quick-view */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {assignment.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">{assignment.points_possible} pts</p>
            {assignment.rubric && assignment.rubric.criteria.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                {assignment.rubric.criteria.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-500">
                    <span>{c.description}</span>
                    <span className="ml-2 flex-shrink-0 font-medium">{c.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SpeedGrader controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Idle: no grade yet */}
            {panelState === 'idle' && (
              <div className="text-center">
                <p className="mb-4 text-sm text-slate-500">
                  Run the AI SpeedGrader to generate a suggested score and feedback draft.
                </p>
                <button
                  onClick={handleRunSpeedGrader}
                  disabled={isRunning}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  Run AI SpeedGrader →
                </button>
              </div>
            )}

            {/* Running: AI in progress */}
            {panelState === 'running' && (
              <div className="flex items-center justify-center gap-3 py-6">
                <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span className="text-sm text-slate-600">Analyzing submission…</span>
              </div>
            )}

            {/* Pending or approved: show grade */}
            {(panelState === 'pending' || panelState === 'approved') && grade && (
              <div className="space-y-4">
                {/* AI suggested score (read-only) */}
                <div className="rounded-lg bg-indigo-50 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    AI Suggested Score
                  </p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {grade.ai_suggested_score}
                    <span className="ml-1 text-base font-normal text-indigo-400">
                      / {assignment.points_possible}
                    </span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-indigo-600">
                    {grade.ai_suggested_feedback}
                  </p>
                </div>

                {/* Final score + feedback (editable or read-only) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Final Score
                  </label>
                  {panelState === 'approved' ? (
                    <p className="text-2xl font-bold text-slate-900">
                      {grade.final_score}
                      <span className="ml-1 text-base font-normal text-slate-400">
                        / {assignment.points_possible}
                      </span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={assignment.points_possible}
                        value={finalScore}
                        onChange={(e) => setFinalScore(Number(e.target.value))}
                        className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <span className="text-sm text-slate-400">
                        / {assignment.points_possible}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Final Feedback
                  </label>
                  {panelState === 'approved' ? (
                    <p className="text-sm leading-relaxed text-slate-700">
                      {grade.final_feedback}
                    </p>
                  ) : (
                    <textarea
                      value={finalFeedback}
                      onChange={(e) => setFinalFeedback(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  )}
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}

                {panelState === 'pending' && (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || !finalFeedback.trim()}
                    className="w-full rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isApproving ? 'Publishing…' : 'Approve & Publish Grade →'}
                  </button>
                )}
              </div>
            )}

            {errorMsg && panelState === 'idle' && (
              <p className="mt-3 text-center text-sm text-red-600">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
