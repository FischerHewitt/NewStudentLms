'use client'

import { useRole } from '@/context/RoleContext'

/**
 * Prominent role toggle — the most important UI element in the demo.
 * Switches between the seeded Teacher and Student identities.
 * Persists selection to localStorage via RoleContext.
 */
export function RoleToggle() {
  const { role, toggleRole, mounted } = useRole()

  if (!mounted) {
    return (
      <div className="h-8 w-32 animate-pulse rounded-full bg-slate-100" />
    )
  }

  const isTeacher = role === 'teacher'

  return (
    <button
      onClick={toggleRole}
      aria-label={`Switch to ${isTeacher ? 'student' : 'teacher'} view`}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-all duration-150 ${
        isTeacher
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      }`}
    >
      {isTeacher ? 'Teacher View' : 'Student View'}
      <span className="text-xs opacity-70">⇄</span>
    </button>
  )
}
