'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import { submitAssignment } from '@/app/actions/assignment'
import type {
  AssignmentWithDetails,
  StudentSubmissionData,
  SubmissionData,
} from '@/app/actions/assignment'
import type { PublishedGrade } from '@/app/actions/speedgrader'

interface Props {
  courseId: string
  assignment: AssignmentWithDetails
  /** Demo student's current submission state */
  studentSubmission: StudentSubmissionData
  /** All submitted/graded submissions — visible to teacher only */
  allSubmissions: SubmissionData[]
  /** Published grade for the student (null if not yet approved) */
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

      {/* ── Student: submission area ──────────────────────── */}
      {role === 'student' && (
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

      {/* ── Teacher: submissions list ─────────────────────── */}
      {role === 'teacher' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Submissions Received
            </h2>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {sub.studentName}
                    </p>
                    {sub.submitted_at && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <SubmissionStatusBadge status={sub.status} />
                    <Link
                      href={`/course/${courseId}/speedgrader/${sub.id}`}
                      className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      SpeedGrader →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
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
