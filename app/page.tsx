'use client'

import { useRole } from '@/context/RoleContext'

export default function Home() {
  const { role } = useRole()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
        AI
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        AI-Native LMS
      </h1>
      <p className="mt-3 max-w-md text-slate-500">
        {role === 'teacher'
          ? 'Create a course from your syllabus, grade faster with AI.'
          : 'View your courses, submit work, and get AI-powered help.'}
      </p>
      <p className="mt-8 text-xs font-medium uppercase tracking-widest text-indigo-400">
        Course dashboard coming soon — issue #5
      </p>
    </div>
  )
}
