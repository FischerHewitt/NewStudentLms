'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitAssignment } from '@/app/actions/assignment'
import type {
  AssignmentWithDetails,
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
  courseId,
  assignment,
  studentSubmission,
  publishedGrade,
}: StudentAssignmentViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [body, setBody] = useState(studentSubmission.body)
  const [submitError, setSubmitError] = useState('')

  const isSubmitted =
    studentSubmission.status === 'submitted' ||
    studentSubmission.status === 'graded'

  const handleSubmit = () => {
    setSubmitError('')
    startTransition(async () => {
      const result = await submitAssignment(assignment.id, body)
      if (result.error) {
        setSubmitError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href={`/course/${courseId}`}
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

      {/* ── Instructions ─────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Instructions
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {assignment.instructions}
        </p>
      </div>

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
              {studentSubmission.body}
            </div>
          </div>
        ) : (
          /* Draft / first-time submission */
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your response here…"
              rows={10}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {submitError && (
              <p className="mt-2 text-sm text-red-600">{submitError}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!body.trim() || isPending}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? 'Submitting…' : 'Submit →'}
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
