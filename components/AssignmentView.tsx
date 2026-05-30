'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import { submitAssignment } from '@/app/actions/assignment'
import { publishManualGrade, runSpeedGrader } from '@/app/actions/speedgrader'
import { StudentCoach } from '@/components/StudentCoach'
import {
  getTeacherAssignmentPanelState,
  gradeFormFromGrade,
  markSubmissionGraded,
} from '@/lib/teacherAssignmentPanel'
import type {
  AssignmentWithDetails,
  FileAttachment,
  StudentSubmissionData,
  SubmissionData,
} from '@/app/actions/assignment'
import type { GradeData, PublishedGrade } from '@/app/actions/speedgrader'
import {
  formatAttachmentBytes,
  isImageAttachment,
  SUBMISSION_ATTACHMENT_ACCEPT,
  submissionAttachmentIcon,
} from '@/lib/submission-attachment'

interface Props {
  courseId: string
  assignment: AssignmentWithDetails
  studentSubmission: StudentSubmissionData
  allSubmissions: SubmissionData[]
  publishedGrade?: PublishedGrade
}

export function AssignmentView({
  courseId,
  assignment,
  studentSubmission,
  allSubmissions,
  publishedGrade,
}: Props) {
  const { role } = useRole()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [body, setBody] = useState(studentSubmission.body)
  const [file, setFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [teacherSubmissions, setTeacherSubmissions] = useState(allSubmissions)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    allSubmissions[0]?.id ?? null,
  )
  const [isSubmissionsPanelOpen, setIsSubmissionsPanelOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTeacherSubmissions(allSubmissions)
    setSelectedSubmissionId((current) => current ?? allSubmissions[0]?.id ?? null)
  }, [allSubmissions])

  const teacherPanel = getTeacherAssignmentPanelState(
    teacherSubmissions,
    selectedSubmissionId,
  )

  const updatePublishedSubmission = (submissionId: string, finalScore: number) => {
    setTeacherSubmissions((current) =>
      markSubmissionGraded(current, submissionId, finalScore),
    )
  }

  const isSubmitted =
    studentSubmission.status === 'submitted' ||
    studentSubmission.status === 'graded'

  const canSubmit = body.trim().length > 0 || file !== null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError('')
    setFile(e.target.files?.[0] ?? null)
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = () => {
    setSubmitError('')
    startTransition(async () => {
      let attachment: FileAttachment | undefined

      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) {
          setSubmitError(json.error ?? 'Upload failed. Please try again.')
          return
        }
        attachment = {
          url: json.url,
          fileName: json.fileName,
          fileType: json.fileType,
          fileSize: json.fileSize,
        }
      }

      const result = await submitAssignment(assignment.id, body, attachment)
      if (result.error) {
        setSubmitError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className={`mx-auto ${role === 'teacher' ? 'max-w-6xl' : 'max-w-3xl'}`}>
      {/* Back link */}
      <Link
        href={`/?course=${courseId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
      >
        ← Back to course
      </Link>

      {/* ── Assignment header ────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {assignment.title}
          </h1>
          <span className="flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {assignment.points_possible} pts
          </span>
        </div>
        {assignment.due_date && (
          <p className="mt-1 text-sm text-slate-400">Due {assignment.due_date}</p>
        )}
      </div>

      {/* ── Student: instructions ────────────────────────── */}
      {role === 'student' && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Instructions
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            {assignment.instructions}
          </p>
        </div>
      )}

      {/* ── Student: rubric ──────────────────────────────── */}
      {role === 'student' && assignment.rubric && assignment.rubric.criteria.length > 0 && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Grading Rubric
          </h2>
          <div className="space-y-2">
            {assignment.rubric.criteria.map((c, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-700">{c.description}</p>
                <span className="flex-shrink-0 text-xs font-medium text-slate-500">
                  {c.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Student: AI coach ────────────────────────────── */}
      {role === 'student' && (
        <div className="mb-5">
          <StudentCoach
            assignmentTitle={assignment.title}
            instructions={assignment.instructions}
            rubricCriteria={assignment.rubric?.criteria}
            studentDraft={body}
          />
        </div>
      )}

      {/* ── Student: submission area ──────────────────────── */}
      {role === 'student' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Your Response
          </h2>

          {isSubmitted ? (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {studentSubmission.status === 'graded' ? 'Graded' : 'Submitted'}
                </span>
                {studentSubmission.submitted_at && (
                  <span className="text-xs text-slate-400">
                    {new Date(studentSubmission.submitted_at).toLocaleString()}
                  </span>
                )}
              </div>

              {studentSubmission.body && (
                <div className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  {studentSubmission.body}
                </div>
              )}

              {studentSubmission.attachment && (
                <div className="mt-3">
                  <AttachmentDisplay attachment={studentSubmission.attachment} />
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your response here… (optional if you upload a file)"
                rows={8}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />

              {/* ── File attachment ── */}
              <div className="mt-3">
                {file ? (
                  <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                    <span className="text-lg">{submissionAttachmentIcon(file.type, file.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-indigo-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-indigo-500">{formatAttachmentBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={clearFile}
                      className="flex-shrink-0 text-indigo-400 hover:text-indigo-700"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
                  >
                    <span>📎</span>
                    <span>Attach a file</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={SUBMISSION_ATTACHMENT_ACCEPT}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {submitError && (
                <p className="mt-2 text-sm text-red-600">{submitError}</p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isPending}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? 'Submitting…' : 'Submit →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Student: published grade ──────────────────────── */}
      {role === 'student' && publishedGrade && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Your Grade
          </h2>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              {publishedGrade.final_score}
            </span>
            <span className="text-sm text-emerald-500">
              / {assignment.points_possible} pts
            </span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-800">
            {publishedGrade.final_feedback}
          </p>
        </div>
      )}

      {/* ── Teacher: split-panel Submission view ───────────── */}
      {role === 'teacher' && (
        <div>
          {teacherSubmissions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No submissions yet.</p>
            </div>
          ) : (
            <div
              className={`grid gap-5 transition-all duration-200 ${
                isSubmissionsPanelOpen
                  ? 'lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]'
                  : 'lg:grid-cols-1'
              }`}
            >
              {isSubmissionsPanelOpen && (
                <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Submissions ({teacherSubmissions.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsSubmissionsPanelOpen(false)}
                      className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Hide submissions panel"
                      aria-label="Hide submissions panel"
                    >
                      ◀
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {teacherSubmissions.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition ${
                          teacherPanel.selected?.id === sub.id
                            ? 'bg-indigo-50'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <SubmissionStatusDot status={sub.status} />
                            <span className="truncate text-sm font-medium text-slate-800">
                              {sub.studentName}
                            </span>
                          </span>
                          {sub.submitted_at && (
                            <span className="mt-1 block text-xs text-slate-400">
                              {new Date(sub.submitted_at).toLocaleString()}
                            </span>
                          )}
                          {sub.attachment && (
                            <span className="mt-1 block truncate text-xs text-slate-500">
                              {submissionAttachmentIcon(sub.attachment.fileType, sub.attachment.fileName)} {sub.attachment.fileName}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <SubmissionStatusBadge status={sub.status} />
                          {sub.finalScore != null && (
                            <span className="text-xs font-semibold text-slate-600">
                              {sub.finalScore}/{assignment.points_possible}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              )}

              <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
                {teacherPanel.selected && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        {!isSubmissionsPanelOpen && (
                          <button
                            type="button"
                            onClick={() => setIsSubmissionsPanelOpen(true)}
                            className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Show submissions panel"
                            aria-label="Show submissions panel"
                          >
                            ▶
                          </button>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {teacherPanel.selected.studentName}
                          </p>
                          {teacherPanel.selected.submitted_at && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              Submitted{' '}
                              {new Date(teacherPanel.selected.submitted_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <SubmissionStatusBadge status={teacherPanel.selected.status} />
                    </div>

                    <div className="space-y-5 px-5 py-5">
                      <div>
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                          Student Submission
                        </h2>
                        {teacherPanel.selected.body ? (
                          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                            {teacherPanel.selected.body}
                          </p>
                        ) : !teacherPanel.selected.attachment ? (
                          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm italic text-slate-400">
                            No content submitted.
                          </p>
                        ) : null}

                        {teacherPanel.selected.attachment && (
                          <div className="mt-3">
                            <AttachmentDisplay attachment={teacherPanel.selected.attachment} />
                          </div>
                        )}
                      </div>

                      {assignment.rubric && assignment.rubric.criteria.length > 0 && (
                        <div className="rounded-lg border border-slate-200 p-4">
                          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Grading Rubric
                          </h2>
                          <div className="space-y-2">
                            {assignment.rubric.criteria.map((c, i) => (
                              <div key={i} className="flex items-start justify-between gap-4">
                                <p className="text-sm text-slate-700">{c.description}</p>
                                <span className="shrink-0 text-xs font-medium text-slate-500">
                                  {c.points} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <InlineGradingPanel
                        key={teacherPanel.selected.id}
                        assignment={assignment}
                        submission={teacherPanel.selected}
                        onPublished={updatePublishedSubmission}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                      <div>
                        {teacherPanel.previous && (
                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(teacherPanel.previous!.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            ← {teacherPanel.previous.studentName}
                          </button>
                        )}
                      </div>
                      <div>
                        {teacherPanel.next ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(teacherPanel.next!.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {teacherPanel.next.studentName} →
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">Last submission</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type InlinePanelState = 'idle' | 'running' | 'pending' | 'approved'

function getInlinePanelState(
  submission: SubmissionData,
  grade: SubmissionData['grade'],
): InlinePanelState {
  if (submission.status === 'graded' || grade?.approved_at) return 'approved'
  if (grade) return 'pending'
  return 'idle'
}

function InlineGradingPanel({
  assignment,
  submission,
  onPublished,
}: {
  assignment: AssignmentWithDetails
  submission: SubmissionData
  onPublished: (submissionId: string, finalScore: number) => void
}) {
  const [grade, setGrade] = useState<GradeData | SubmissionData['grade']>(submission.grade)
  const initialForm = submission.grade
    ? gradeFormFromGrade(submission.grade)
    : { score: submission.finalScore ?? 0, feedback: '' }
  const [score, setScore] = useState(initialForm.score)
  const [feedback, setFeedback] = useState(initialForm.feedback)
  const [panelState, setPanelState] = useState<InlinePanelState>(
    getInlinePanelState(submission, submission.grade),
  )
  const [errorMsg, setErrorMsg] = useState('')
  const [isRunning, startRunTransition] = useTransition()
  const [isPublishing, startPublishTransition] = useTransition()

  const handleAiSuggest = () => {
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
        const form = gradeFormFromGrade(result.grade)
        setGrade(result.grade)
        setScore(form.score)
        setFeedback(form.feedback)
        setPanelState('pending')
      }
    })
  }

  const handlePublish = () => {
    setErrorMsg('')
    startPublishTransition(async () => {
      const result = await publishManualGrade(submission.id, score, feedback)
      if (result.error) {
        setErrorMsg(result.error)
        return
      }
      const publishedScore = result.grade?.final_score ?? score
      if (result.grade) setGrade(result.grade)
      setPanelState('approved')
      onPublished(submission.id, publishedScore)
    })
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Grade
        </h2>
        {panelState === 'approved' && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Published
          </span>
        )}
      </div>

      {panelState === 'approved' ? (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Final Score
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {score}
              <span className="ml-1 text-base font-normal text-slate-400">
                / {assignment.points_possible}
              </span>
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Feedback
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {feedback || 'No feedback provided.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {panelState === 'pending' && grade && (
            <div data-testid="ai-suggestion" className="rounded-lg bg-indigo-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                AI Suggestion
              </p>
              <p className="text-lg font-bold text-indigo-700">
                {grade.ai_suggested_score}
                <span className="ml-1 text-sm font-normal text-indigo-400">
                  / {assignment.points_possible}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-indigo-600">
                {grade.ai_suggested_feedback}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Score
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={assignment.points_possible}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                disabled={panelState === 'running'}
                className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
              />
              <span className="text-sm text-slate-400">
                / {assignment.points_possible}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              disabled={panelState === 'running'}
              placeholder="Write feedback for the student..."
              className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isRunning}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPublishing ? 'Publishing...' : 'Publish Grade'}
            </button>
            {panelState === 'idle' && (
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isRunning}
                className="rounded-lg border border-indigo-300 px-4 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
              >
                {isRunning ? 'Analyzing...' : 'AI Suggest'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function AttachmentDisplay({ attachment }: { attachment: FileAttachment }) {
  if (isImageAttachment(attachment)) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="max-h-96 w-full object-contain bg-slate-50"
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
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span className="text-xl">{submissionAttachmentIcon(attachment.fileType, attachment.fileName)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{attachment.fileName}</p>
        <p className="text-xs text-slate-400">{formatAttachmentBytes(attachment.fileSize)}</p>
      </div>
      <span className="flex-shrink-0 text-xs text-slate-400">↗ open</span>
    </a>
  )
}

function SubmissionStatusBadge({
  status,
}: {
  status: 'draft' | 'submitted' | 'graded'
}) {
  if (status === 'submitted') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Submitted
      </span>
    )
  }
  if (status === 'graded') {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Graded
      </span>
    )
  }
  return null
}

function SubmissionStatusDot({
  status,
}: {
  status: 'draft' | 'submitted' | 'graded'
}) {
  const color =
    status === 'graded'
      ? 'bg-emerald-500'
      : status === 'submitted'
        ? 'bg-amber-500'
        : 'bg-slate-300'

  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
    />
  )
}
