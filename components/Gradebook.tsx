'use client'

import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import { STUDENT_ID } from '@/lib/constants'
import type { GradebookData, GradebookCell } from '@/app/actions/gradebook'

interface Props {
  data: GradebookData
  embedded?: boolean
}

export function Gradebook({ data, embedded }: Props) {
  const { role } = useRole()

  // Student view: filter to the demo student's row only
  const visibleStudents =
    role === 'student'
      ? data.students.filter((s) => s.studentId === STUDENT_ID)
      : data.students

  if (data.assignments.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        {!embedded && <GradebookHeader courseId={data.courseId} courseTitle={data.courseTitle} role={role} />}
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            No assignments yet. Generate a course to populate the gradebook.
          </p>
        </div>
      </div>
    )
  }

  if (visibleStudents.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        {!embedded && <GradebookHeader courseId={data.courseId} courseTitle={data.courseTitle} role={role} />}
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            {role === 'teacher'
              ? 'No students enrolled yet.'
              : 'You are not enrolled in this course.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full">
      {!embedded && <GradebookHeader courseId={data.courseId} courseTitle={data.courseTitle} role={role} />}

      {/* Cell-state legend (teacher view) */}
      {role === 'teacher' && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-slate-200" />
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-slate-400" />
            AI Score (draft)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" />
            Final Grade
          </span>
        </div>
      )}

      {/* Gradebook table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="sticky left-0 z-10 min-w-[140px] bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                Student
              </th>
              {data.assignments.map((a) => (
                <th
                  key={a.id}
                  className="min-w-[120px] px-3 py-3 text-center text-xs font-semibold text-slate-700"
                >
                  <div className="truncate" title={a.title}>
                    {a.title}
                  </div>
                  <div className="mt-0.5 text-xs font-normal text-slate-400">
                    {a.points_possible} pts
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStudents.map((row) => (
              <tr key={row.studentId} className="hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">
                  {row.studentName}
                </td>
                {row.cells.map((cell) => (
                  <td
                    key={cell.assignmentId}
                    className="px-3 py-3 text-center"
                  >
                    {role === 'teacher' ? (
                      <TeacherCell
                        cell={cell}
                        courseId={data.courseId}
                      />
                    ) : (
                      <StudentCell
                        cell={cell}
                        courseId={data.courseId}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function GradebookHeader({
  courseId,
  courseTitle,
  role,
}: {
  courseId: string
  courseTitle: string
  role: string
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <Link
          href={`/course/${courseId}`}
          className="text-sm text-slate-500 hover:text-indigo-600"
        >
          ← Back to course
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Gradebook
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">{courseTitle}</p>
      </div>
      {role === 'teacher' && (
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
          Teacher view
        </span>
      )}
    </div>
  )
}

function TeacherCell({
  cell,
  courseId,
}: {
  cell: GradebookCell
  courseId: string
}) {
  if (cell.state === 'blank') {
    return <span className="text-slate-300">—</span>
  }

  const content = (
    <CellBadge state={cell.state} score={cell.score} role="teacher" />
  )

  // Cells with a submission are clickable → SpeedGrader
  if (cell.submissionId) {
    return (
      <Link
        href={`/course/${courseId}/speedgrader/${cell.submissionId}`}
        className="inline-block transition hover:opacity-80"
        title="Open in SpeedGrader"
      >
        {content}
      </Link>
    )
  }

  return content
}

function StudentCell({
  cell,
  courseId,
}: {
  cell: GradebookCell
  courseId: string
}) {
  if (cell.state === 'blank') {
    return <span className="text-xs text-slate-400">—</span>
  }

  // Student sees pending + ai_suggested the same way: "Submitted"
  if (cell.state === 'pending' || cell.state === 'ai_suggested') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Submitted
      </span>
    )
  }

  // Final grade — show score + link to assignment for feedback
  return (
    <Link
      href={`/course/${courseId}/assignment/${cell.assignmentId}`}
      className="inline-flex flex-col items-center gap-0.5 transition hover:opacity-80"
      title="View grade and feedback"
    >
      <CellBadge state={cell.state} score={cell.score} role="student" />
    </Link>
  )
}

function CellBadge({
  state,
  score,
  role,
}: {
  state: GradebookCell['state']
  score: number | null
  role: 'teacher' | 'student'
}) {
  if (state === 'pending') {
    return (
      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
        Pending
      </span>
    )
  }

  if (state === 'ai_suggested' && role === 'teacher') {
    return (
      <span className="rounded-full bg-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600">
        {score ?? '—'}
      </span>
    )
  }

  if (state === 'final') {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
        {score ?? '—'}
      </span>
    )
  }

  return null
}
