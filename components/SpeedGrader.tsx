'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { runSpeedGrader, publishManualGrade } from '@/app/actions/speedgrader'
import type { SpeedGraderData, GradeData } from '@/app/actions/speedgrader'
import {
  formatAttachmentBytes,
  isImageAttachment,
  submissionAttachmentIcon,
} from '@/lib/submission-attachment'

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
  // Snapshot of score/feedback before AI populated the fields — enables revert
  const [preAiSnapshot, setPreAiSnapshot] = useState<{ score: number; feedback: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isRunning, startRunTransition] = useTransition()
  const [isPublishing, startPublishTransition] = useTransition()

  const handleRunSpeedGrader = () => {
    setErrorMsg('')
    // Save what the teacher typed before AI overwrites the fields
    setPreAiSnapshot({ score: finalScore, feedback: finalFeedback })
    startRunTransition(async () => {
      setPanelState('running')
      const result = await runSpeedGrader(submission.id)
      if (result.error) {
        setErrorMsg(result.error)
        setPanelState(grade ? 'pending' : 'idle')
        return
      }
      if (result.grade) {
        setGrade(result.grade)
        setFinalScore(result.grade.ai_suggested_score)
        setFinalFeedback(result.grade.final_feedback ?? result.grade.ai_suggested_feedback)
        setPanelState('pending')
      }
    })
  }

  const handleRevertToPreAi = () => {
    if (!preAiSnapshot) return
    setFinalScore(preAiSnapshot.score)
    setFinalFeedback(preAiSnapshot.feedback)
    setPreAiSnapshot(null)
  }

  const handlePublish = () => {
    setErrorMsg('')
    startPublishTransition(async () => {
      const result = await publishManualGrade(submission.id, finalScore, finalFeedback)
      if (result.error) {
        setErrorMsg(result.error)
        return
      }
      if (result.grade) setGrade(result.grade)
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
          <div className="px-5 py-4 space-y-3">
            {submission.body ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {submission.body}
              </p>
            ) : !submission.attachment ? (
              <p className="italic text-slate-400 text-sm">No content submitted.</p>
            ) : null}

            {submission.attachment && (
              <SubmissionAttachment attachment={submission.attachment} />
            )}
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

          {/* Grading panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {panelState === 'approved' ? (
              /* ── Approved: read-only ── */
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Final Score</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {grade?.final_score}
                    <span className="ml-1 text-base font-normal text-slate-400">/ {assignment.points_possible}</span>
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Final Feedback</p>
                  <p className="text-sm leading-relaxed text-slate-700">{grade?.final_feedback}</p>
                </div>
              </div>
            ) : (
              /* ── Editable: idle / running / pending ── */
              <div className="space-y-4">
                {/* AI suggestion box — shown after AI runs */}
                {panelState === 'pending' && grade && (
                  <div className="rounded-lg bg-indigo-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                      AI Suggestion
                    </p>
                    <p className="text-lg font-bold text-indigo-700">
                      {grade.ai_suggested_score}
                      <span className="ml-1 text-sm font-normal text-indigo-400">/ {assignment.points_possible}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-600">
                      {grade.ai_suggested_feedback}
                    </p>
                  </div>
                )}

                {/* Score input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Score
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={assignment.points_possible}
                      value={finalScore}
                      onChange={(e) => setFinalScore(Number(e.target.value))}
                      disabled={panelState === 'running'}
                      className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                    />
                    <span className="text-sm text-slate-400">/ {assignment.points_possible}</span>
                  </div>
                </div>

                {/* Feedback textarea */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Feedback
                    </label>
                    <div className="flex gap-2">
                      {preAiSnapshot && (
                        <button
                          type="button"
                          onClick={handleRevertToPreAi}
                          className="text-xs text-slate-400 hover:text-indigo-600"
                        >
                          ↩ Revert to original
                        </button>
                      )}
                      {finalFeedback && (
                        <button
                          type="button"
                          onClick={() => setFinalFeedback('')}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={finalFeedback}
                    onChange={(e) => setFinalFeedback(e.target.value)}
                    rows={5}
                    disabled={panelState === 'running'}
                    placeholder="Write feedback for the student…"
                    className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                  />
                </div>

                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || isRunning}
                    className="flex-1 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isPublishing ? 'Publishing…' : 'Publish Grade →'}
                  </button>
                  {panelState === 'idle' && (
                    <button
                      onClick={handleRunSpeedGrader}
                      disabled={isRunning}
                      className="rounded-lg border border-indigo-300 px-4 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
                    >
                      {isRunning ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                          Analyzing…
                        </span>
                      ) : 'AI Suggest'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type Attachment = NonNullable<SpeedGraderData['submission']['attachment']>

function SubmissionAttachment({ attachment }: { attachment: Attachment }) {
  if (isImageAttachment(attachment)) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="max-h-64 w-full object-contain bg-slate-50"
        />
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
          {attachment.fileName} · {formatAttachmentBytes(attachment.fileSize)}
        </div>
      </div>
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
    >
      <span className="text-xl">{submissionAttachmentIcon(attachment.fileType, attachment.fileName)}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{attachment.fileName}</span>
      <span className="flex-shrink-0 text-xs text-slate-400">{formatAttachmentBytes(attachment.fileSize)}</span>
      <span className="flex-shrink-0 text-xs text-slate-400">↗ open</span>
    </a>
  )
}
