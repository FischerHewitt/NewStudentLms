'use client'

import { useRole } from '@/context/RoleContext'

/**
 * Student-side role toggle — lives in the global <Header> on student pages.
 * Hard-navigates to /dashboard for teacher view (teacher has its own layout shell).
 */
export function RoleToggle() {
  const { mounted } = useRole()

  if (!mounted) {
    return <div className="h-8 w-32 animate-pulse rounded-full bg-slate-100" />
  }

  function switchToTeacher() {
    localStorage.setItem('lms_active_role', 'teacher')
    window.location.href = '/dashboard'
  }

  return (
    <button
      onClick={switchToTeacher}
      aria-label="Switch to teacher view"
      className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700"
    >
      Teacher View
      <span className="text-xs opacity-70">⇄</span>
    </button>
  )
}
