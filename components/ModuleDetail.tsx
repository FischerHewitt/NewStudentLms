'use client'

import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import type {
  ModuleWithAssignments,
  SubmissionSummary,
} from '@/app/actions/dashboard'

interface Props {
  courseId: string
  module: ModuleWithAssignments
  /** Demo student's submissions for the assignments in this module */
  studentSubmissions: SubmissionSummary[]
  /** All submissions for the assignments in this module (teacher view) */
  allSubmissions: SubmissionSummary[]
}

export function ModuleDetail({
  courseId,
  module: mod,
  studentSubmissions,
  allSubmissions,
}: Props) {
  const { role } = useRole()

  const studentSubMap = Object.fromEntries(
    studentSubmissions.map((s) => [s.assignment_id, s]),
  )
  const submissionCountMap: Record<string, number> = {}
  for (const sub of allSubmissions) {
    submissionCountMap[sub.assignment_id] =
      (submissionCountMap[sub.assignment_id] ?? 0) + 1
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href={role === 'student' ? `/course/${courseId}?view=student` : `/course/${courseId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
      >
        ← Back to course
      </Link>

      {/* Module header */}
      <div className="mb-6">
        <span className="mb-2 inline-block rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          Week {mod.week_number}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {mod.title}
        </h1>
        {mod.description && (
          <p className="mt-2 text-slate-500">{mod.description}</p>
        )}
      </div>

      {/* Assignments */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Assignments
        </h2>

        {mod.assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              No assignments in this module.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mod.assignments.map((a) => (
              <Link
                key={a.id}
                href={
                  role === 'student'
                    ? `/course/${courseId}/assignment/${a.id}?view=student`
                    : `/course/${courseId}/assignment/${a.id}`
                }
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  {a.due_date && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Due {a.due_date}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {a.points_possible} pts
                  </span>
                  {role === 'teacher' ? (
                    <SubmissionCountBadge
                      count={submissionCountMap[a.id] ?? 0}
                    />
                  ) : (
                    <StudentStatusBadge
                      submission={studentSubMap[a.id] ?? null}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SubmissionCountBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        No submissions
      </span>
    )
  }
  return (
    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
      {count} submitted
    </span>
  )
}

function StudentStatusBadge({
  submission,
}: {
  submission: SubmissionSummary | null
}) {
  if (!submission || submission.status === 'draft') {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        Not submitted
      </span>
    )
  }
  if (submission.status === 'submitted') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Submitted
      </span>
    )
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Graded
    </span>
  )
}
