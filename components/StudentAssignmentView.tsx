'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitAssignment } from '@/app/actions/assignment'
import { MarkdownContent } from '@/components/MarkdownContent'
import { getAssignmentBlocks } from '@/lib/content-blocks'
import { renderContentBlocks } from '@/lib/content-block-renderer'
import { RichTextarea } from '@/components/RichTextarea'
import {
  formatAttachmentBytes,
  SUBMISSION_ATTACHMENT_ACCEPT,
} from '@/lib/submission-attachment'
import type {
  AssignmentWithDetails,
  FileAttachment,
  StudentSubmissionData,
} from '@/app/actions/assignment'
import type { PublishedGrade } from '@/app/actions/speedgrader'

interface StudentAssignmentViewProps {
  courseId: string
  assignment: AssignmentWithDetails
  studentSubmission: StudentSubmissionData
  publishedGrade?: PublishedGrade | null
}

export function StudentAssignmentView({
  courseId: _courseId,
  assignment,
  studentSubmission,
  publishedGrade,
}: StudentAssignmentViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [body, setBody] = useState(studentSubmission.body)
  const [attachment, setAttachment] = useState<FileAttachment | null>(
    studentSubmission.attachment,
  )
  const [submitError, setSubmitError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const isSubmitted =
    studentSubmission.status === 'submitted' ||
    studentSubmission.status === 'graded'

  const handleSubmit = () => {
    setSubmitError('')
    startTransition(async () => {
      const result = await submitAssignment(assignment.id, body, attachment ?? undefined)
      if (result.error) {
        setSubmitError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return

    setUploadError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = (await response.json()) as FileAttachment & { error?: string }

      if (!response.ok || result.error) {
        setUploadError(result.error ?? 'Upload failed. Please try again.')
        return
      }

      setAttachment({
        url: result.url,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
      })
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const canSubmitResponse = body.trim().length > 0 || Boolean(attachment)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/studentview"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
      >
        ← Back to dashboard
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

      {/* ── Content Blocks (instructions, math, downloads) ── */}
      {renderContentBlocks(getAssignmentBlocks({ instructions: assignment.instructions, content_blocks: assignment.content_blocks }))}

      {/* ── Rubric ───────────────────────────────────────── */}
      {assignment.rubric && assignment.rubric.criteria.length > 0 && (
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

      {/* ── Submission area ──────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Your Response
        </h2>

        {isSubmitted ? (
          /* Read-only view after submit */
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
            <div className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
              {studentSubmission.body.trim() ? (
                <MarkdownContent>{studentSubmission.body}</MarkdownContent>
              ) : (
                <span className="text-slate-400">No written response.</span>
              )}
            </div>
            {studentSubmission.attachment && (
              <div className="mt-3">
                <SubmissionAttachmentCard attachment={studentSubmission.attachment} />
              </div>
            )}
          </div>
        ) : (
          /* Draft / first-time submission */
          <div>
            <RichTextarea
              value={body}
              onChange={setBody}
              placeholder="Write your response here…"
              rows={10}
              disabled={isPending}
            />
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Attach work</p>
                  <p className="text-xs text-slate-500">
                    Upload images, PDFs, docs, spreadsheets, code, or archives up to 50 MB.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  {isUploading ? 'Uploading...' : 'Upload a file'}
                  <input
                    type="file"
                    accept={SUBMISSION_ATTACHMENT_ACCEPT}
                    disabled={isUploading || isPending}
                    onChange={(event) => {
                      void handleUpload(event.currentTarget.files?.[0] ?? null)
                      event.currentTarget.value = ''
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
              {attachment && (
                <div className="mt-3 flex items-center gap-2">
                  <SubmissionAttachmentCard attachment={attachment} />
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    disabled={isPending || isUploading}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
            </div>
            {submitError && (
              <p className="mt-2 text-sm text-red-600">{submitError}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canSubmitResponse || isPending || isUploading}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? 'Submitting...' : 'Submit ->'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Published grade ──────────────────────────────── */}
      {publishedGrade && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
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
    </div>
  )
}

function SubmissionAttachmentCard({ attachment }: { attachment: FileAttachment }) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
    >
      <span className="material-symbols-outlined text-[20px] text-slate-500">attach_file</span>
      <span className="min-w-0 flex-1 truncate font-medium">{attachment.fileName}</span>
      <span className="flex-shrink-0 text-xs text-slate-400">
        {formatAttachmentBytes(attachment.fileSize)}
      </span>
    </a>
  )
}
