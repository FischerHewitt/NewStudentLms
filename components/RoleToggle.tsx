'use client'

import { useRole } from '@/context/RoleContext'

/**
 * Prominent role toggle — the most important UI element in the demo.
 * Switches between the seeded Teacher and Student identities.
 * Persists selection to localStorage via RoleContext.
 */
export function RoleToggle() {
  const { role, toggleRole, mounted } = useRole()

  // Avoid hydration mismatch: render a neutral shell until localStorage is read
  if (!mounted) {
    return (
      <div className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-1">
        <span className="w-20 rounded-full px-4 py-1.5 text-center text-sm font-medium text-slate-400">
          &nbsp;
        </span>
        <span className="w-20 rounded-full px-4 py-1.5 text-center text-sm font-medium text-slate-400">
          &nbsp;
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-1"
      role="group"
      aria-label="Switch role"
    >
      <button
        onClick={() => role !== 'teacher' && toggleRole()}
        aria-pressed={role === 'teacher'}
        className={`w-24 rounded-full px-4 py-1.5 text-center text-sm font-semibold transition-all duration-150 ${
          role === 'teacher'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Teacher
      </button>
      <button
        onClick={() => role !== 'student' && toggleRole()}
        aria-pressed={role === 'student'}
        className={`w-24 rounded-full px-4 py-1.5 text-center text-sm font-semibold transition-all duration-150 ${
          role === 'student'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Student
      </button>
    </div>
  )
}
