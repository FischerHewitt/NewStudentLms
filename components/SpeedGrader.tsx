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
import { TeacherCoachContextBridge } from '@/components/TeacherCoachContextBridge'
import { MarkdownContent } from '@/components/MarkdownContent'
import { assignmentHref } from '@/lib/routes'

const C = {
  surface: '#F8FAFC', card: '#ffffff', border: '#E2E8F0',
  text: '#1b1b1d', muted: '#64748b',
  purple: '#7C3AED', orange: '#F59E0B', green: '#10B981',
}
const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

interface Props {
  courseId: string
  data: SpeedGraderData
  autorun: boolean
}

type PanelState = 'idle' | 'running' | 'pending' | 'approved'

function getInitialState(grade: GradeData | null): PanelState {
  if (!grade) return 'idle'
  if (grade.approved_at) return 'approved'
  return 'pending'
}

/** Distribute a total AI score proportionally across rubric criteria. */
export function distributeAiScore(
  aiTotal: number,
  criteria: { points: number }[],
  pointsPossible: number,
): number[] {
  if (criteria.length === 0 || pointsPossible === 0) return []
  return criteria.map((c) => Math.round((aiTotal / pointsPossible) * c.points))
}

const QUICK_CHIPS: Record<string, string[]> = {
  default: ['Strong work ✓', 'Needs development', 'See rubric notes', 'Well structured'],
}

function getChips(description: string): string[] {
  const lower = description.toLowerCase()
  if (lower.includes('thesis') || lower.includes('argument')) {
    return ['Strong thesis ✓', 'Needs sharper claim', 'Too broad', 'Good but underdeveloped']
  }
  if (lower.includes('evidence') || lower.includes('source')) {
    return ['Well-integrated quotes', 'Quotes but no analysis', 'Needs more evidence', 'Excellent close reading']
  }
  if (lower.includes('format') || lower.includes('mla') || lower.includes('citation')) {
    return ['Formatting correct ✓', 'Missing page numbers', 'Citations incomplete', 'Mostly correct']
  }
  return QUICK_CHIPS.default
}

export function SpeedGrader({ courseId, data, autorun }: Props) {
  const router = useRouter()
  const { submission, assignment } = data
  const criteria = assignment.rubric?.criteria ?? []

  // Per-criterion scores — initialised from AI suggestion if available
  const [criteriaScores, setCriteriaScores] = useState<number[]>(() => {
    if (criteria.length === 0) return []
    const aiTotal = data.grade?.ai_suggested_score ?? 0
    return distributeAiScore(aiTotal, criteria, assignment.points_possible)
  })

  const totalScore = criteriaScores.reduce((s, v) => s + v, 0)

  const [feedback, setFeedback] = useState(
    data.grade?.final_feedback ?? data.grade?.ai_suggested_feedback ?? '',
  )
  const [panelState, setPanelState] = useState<PanelState>(getInitialState(data.grade))
  const [grade, setGrade] = useState<GradeData | null>(data.grade)
  const [errorMsg, setErrorMsg] = useState('')
  const [isRunning, startRunTransition] = useTransition()
  const [isPublishing, startPublishTransition] = useTransition()

  // Fallback single score for assignments without rubric
  const [singleScore, setSingleScore] = useState<number>(
    data.grade?.final_score ?? data.grade?.ai_suggested_score ?? 0,
  )
  const finalScore = criteria.length > 0 ? totalScore : singleScore

  const handleRunSpeedGrader = () => {
    setErrorMsg('')
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
        setFeedback(result.grade.final_feedback ?? result.grade.ai_suggested_feedback)
        if (criteria.length > 0) {
          setCriteriaScores(
            distributeAiScore(result.grade.ai_suggested_score, criteria, assignment.points_possible),
          )
        } else {
          setSingleScore(result.grade.ai_suggested_score)
        }
        setPanelState('pending')
      }
    })
  }

  const handlePublish = () => {
    setErrorMsg('')
    startPublishTransition(async () => {
      const result = await publishManualGrade(submission.id, finalScore, feedback)
      if (result.error) { setErrorMsg(result.error); return }
      if (result.grade) setGrade(result.grade)
      setPanelState('approved')
      router.refresh()
    })
  }

  useEffect(() => {
    if (autorun && panelState === 'idle') handleRunSpeedGrader()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TeacherCoachContextBridge context={{ submissionId: submission.id }} />

      {/* Published banner */}
      {panelState === 'approved' && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span>✓</span>
          <span>Grade published — student can now see their final score and feedback.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' }}>

        {/* LEFT: Submission */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, margin: '0 0 2px' }}>Student Submission</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{submission.studentName}</p>
            </div>
            <Link
              href={assignmentHref(courseId, assignment.id)}
              style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}
            >
              ← {assignment.title}
            </Link>
          </div>
          <div style={{ padding: '16px 18px', minHeight: 300 }}>
            {submission.body ? (
              <MarkdownContent>{submission.body}</MarkdownContent>
            ) : !submission.attachment ? (
              <p style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>No content submitted.</p>
            ) : null}
            {submission.attachment && <SubmissionAttachment attachment={submission.attachment} />}
          </div>
        </div>

        {/* RIGHT: Grading panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* AI suggestion banner */}
          {panelState === 'pending' && grade && (
            <div style={{ background: `${C.purple}0d`, border: `1px solid ${C.purple}33`, borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: C.purple }}>auto_awesome</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  AI Suggested · {grade.ai_suggested_score}/{assignment.points_possible}
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                {grade.ai_suggested_feedback?.slice(0, 140)}{(grade.ai_suggested_feedback?.length ?? 0) > 140 ? '…' : ''}
              </p>
            </div>
          )}

          {panelState === 'approved' ? (
            /* Read-only approved view */
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, margin: '0 0 12px' }}>Final Grade</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>
                {grade?.final_score}<span style={{ fontSize: 16, fontWeight: 400, color: C.muted }}>/{assignment.points_possible}</span>
              </p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{grade?.final_feedback}</p>
            </div>
          ) : (
            <>
              {/* Rubric scoring */}
              {criteria.length > 0 ? (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, margin: 0 }}>Rubric Scoring</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{totalScore}/{assignment.points_possible}</span>
                  </div>
                  {criteria.map((c, i) => (
                    <div key={i} style={{ borderBottom: i < criteria.length - 1 ? `1px solid ${C.border}` : undefined, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>{c.description}</p>
                          <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{c.points} pts possible</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
                          <input
                            type="number"
                            min={0}
                            max={c.points}
                            value={criteriaScores[i] ?? 0}
                            onChange={(e) => {
                              const val = Math.min(c.points, Math.max(0, Number(e.target.value)))
                              setCriteriaScores((prev) => prev.map((s, j) => j === i ? val : s))
                            }}
                            disabled={panelState === 'running'}
                            style={{ width: 56, padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, textAlign: 'center', fontSize: 14, fontWeight: 700, color: C.text, outline: 'none' }}
                          />
                          <span style={{ fontSize: 12, color: C.muted }}>/{c.points}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((criteriaScores[i] ?? 0) / c.points) * 100}%`, background: GRADIENT, borderRadius: 99 }} />
                      </div>
                      {/* Quick chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {getChips(c.description).map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setFeedback((f) => f ? `${f}\n\n[${c.description}] ${chip}` : `[${c.description}] ${chip}`)}
                            style={{ padding: '3px 10px', borderRadius: 99, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 11, fontWeight: 500, color: C.muted, cursor: 'pointer' }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* No rubric — single score input */
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, margin: '0 0 10px' }}>Score</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={assignment.points_possible}
                      value={singleScore}
                      onChange={(e) => setSingleScore(Math.min(assignment.points_possible, Math.max(0, Number(e.target.value))))}
                      disabled={panelState === 'running'}
                      style={{ width: 72, padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, textAlign: 'center', fontSize: 18, fontWeight: 700, color: C.text, outline: 'none' }}
                    />
                    <span style={{ fontSize: 14, color: C.muted }}>/ {assignment.points_possible}</span>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, margin: 0 }}>Feedback to Student</p>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  placeholder="Write feedback for the student…"
                  disabled={panelState === 'running'}
                  style={{ width: '100%', padding: 14, fontSize: 13, color: C.text, border: 'none', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                />
              </div>

              {errorMsg && <p style={{ fontSize: 13, color: 'red', margin: 0 }}>{errorMsg}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                {panelState === 'idle' && (
                  <button
                    onClick={handleRunSpeedGrader}
                    disabled={isRunning}
                    style={{ padding: '9px 18px', border: `1px solid ${C.purple}`, background: 'transparent', borderRadius: 8, fontSize: 13, fontWeight: 600, color: C.purple, cursor: 'pointer', opacity: isRunning ? 0.6 : 1 }}
                  >
                    {isRunning ? 'Analyzing…' : '✦ AI Suggest'}
                  </button>
                )}
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || isRunning}
                  style={{ flex: 1, padding: '10px 0', background: C.green, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: isPublishing || isRunning ? 0.6 : 1 }}
                >
                  {isPublishing ? 'Publishing…' : 'Publish & Next →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

type Attachment = NonNullable<SpeedGraderData['submission']['attachment']>

function SubmissionAttachment({ attachment }: { attachment: Attachment }) {
  if (isImageAttachment(attachment)) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.url} alt={attachment.fileName} className="max-h-64 w-full object-contain bg-slate-50" />
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
