'use client'

import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import { StudentAssignmentView } from '@/components/StudentAssignmentView'
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

  if (role === 'student') {
    return (
      <StudentAssignmentView
        courseId={courseId}
        assignment={assignment}
        studentSubmission={studentSubmission}
        publishedGrade={publishedGrade}
      />
    )
  }

  // ── Teacher view ─────────────────────────────────────────────────────────────
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

      {/* ── Teacher: submissions list ─────────────────────── */}
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
