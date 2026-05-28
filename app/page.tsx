import Link from 'next/link'
import { getLatestCourse, getStudentCourse } from '@/app/actions/course'

export const dynamic = 'force-dynamic'

/**
 * Home page — role-aware landing.
 *
 * We render two separate server components and let the client RoleContext
 * decide which to show. Since this is a Server Component we render both
 * and use CSS to hide the inactive one based on a data attribute the
 * RoleToggle writes to <body>. For the hackathon, we use a simpler approach:
 * always show the teacher view content here (teachers start the demo),
 * and the student lands on /course/[id] directly after the teacher saves.
 *
 * In practice during the demo:
 * - Teacher opens "/" → sees "Create course" CTA or their latest course
 * - After saving, both teacher and student go to /course/[id]
 */
export default async function Home() {
  const [teacherCourse, studentCourse] = await Promise.all([
    getLatestCourse(),
    getStudentCourse(),
  ])

  return (
    <div className="mx-auto max-w-2xl py-16">
      {/* ── Teacher card ──────────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
            Teacher view
          </span>
        </div>

        {teacherCourse ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">
              Latest course
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {teacherCourse.title}
            </h2>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/course/${teacherCourse.courseId}`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Open course →
              </Link>
              <Link
                href="/generate"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                + New course
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="mb-1 text-lg font-semibold text-slate-800">
              No courses yet
            </p>
            <p className="mb-5 text-sm text-slate-500">
              Paste your syllabus and let AI build the course structure for you.
            </p>
            <Link
              href="/generate"
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create course from syllabus →
            </Link>
          </div>
        )}
      </section>

      {/* ── Student card ──────────────────────────────────── */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
            Student view
          </span>
        </div>

        {studentCourse ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">
              Your course
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {studentCourse.title}
            </h2>
            <div className="mt-4">
              <Link
                href={`/course/${studentCourse.courseId}`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Go to course →
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No courses yet. Switch to teacher view to create one.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
