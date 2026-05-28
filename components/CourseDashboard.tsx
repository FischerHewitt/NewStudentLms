'use client'

import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import type {
  CourseWithModules,
  SubmissionSummary,
} from '@/app/actions/dashboard'

interface Props {
  course: CourseWithModules
  /** Demo student's submissions — drives status badges in student view */
  studentSubmissions: SubmissionSummary[]
  /** All submissions across all students — drives count badges in teacher view */
  allSubmissions: SubmissionSummary[]
}

export function CourseDashboard({
  course,
  studentSubmissions,
  allSubmissions,
}: Props) {
  const { role } = useRole()

  // Build lookup maps once
  const studentSubMap = Object.fromEntries(
    studentSubmissions.map((s) => [s.assignment_id, s]),
  )
  const submissionCountMap: Record<string, number> = {}
  for (const sub of allSubmissions) {
    submissionCountMap[sub.assignment_id] =
      (submissionCountMap[sub.assignment_id] ?? 0) + 1
  }

  const allAssignments = course.modules.flatMap((m) => m.assignments)
  const upcomingAssignments = allAssignments
    .filter((a) => a.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Course header ──────────────────────────────── */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
          {course.teacherName}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {course.title}
        </h1>

        {role === 'teacher' && (
          <div className="mt-4 flex gap-3">
            <Link
              href={`/course/${course.id}/gradebook`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Gradebook →
            </Link>
          </div>
        )}
      </div>

      {/* ── Upcoming assignments (teacher view only) ───── */}
      {role === 'teacher' && upcomingAssignments.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Upcoming Assignments
          </h2>
          <div className="space-y-2">
            {upcomingAssignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <Link
                  href={`/course/${course.id}/assignment/${a.id}`}
                  className="text-sm font-medium text-slate-800 hover:text-indigo-600"
                >
                  {a.title}
                </Link>
                <div className="flex items-center gap-3">
                  {a.due_date && (
                    <span className="text-xs text-slate-400">{a.due_date}</span>
                  )}
                  <SubmissionCountBadge
                    count={submissionCountMap[a.id] ?? 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Module list ─────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Modules
        </h2>

        {course.modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              No modules yet. Generate a course to populate the structure.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Module header */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <span className="flex-shrink-0 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    Week {mod.week_number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{mod.title}</p>
                    {mod.description && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/course/${course.id}/module/${mod.id}`}
                    className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    View →
                  </Link>
                </div>

                {/* Assignments */}
                {mod.assignments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {mod.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <Link
                          href={`/course/${course.id}/assignment/${a.id}`}
                          className="text-sm font-medium text-slate-800 hover:text-indigo-600"
                        >
                          {a.title}
                        </Link>
                        <div className="flex items-center gap-3">
                          {a.due_date && (
                            <span className="text-xs text-slate-400">
                              {a.due_date}
                            </span>
                          )}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-5 py-3 text-xs text-slate-400">
                    No assignments in this module.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Badge sub-components ────────────────────────────────────────────────────

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
  // graded
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Graded
    </span>
  )
}
