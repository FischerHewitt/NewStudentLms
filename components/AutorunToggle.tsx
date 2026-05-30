'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import {
  getTeacherAutorunSetting,
  updateSpeedGraderAutorun,
} from '@/app/actions/settings'

/**
 * Teacher-only toggle for the SpeedGrader autorun preference.
 * Fetches the current DB value on mount, then writes on change.
 * Hidden for the student role.
 */
export function AutorunToggle() {
  const pathname = usePathname()
  const { role, mounted } = useRole()
  const [autorun, setAutorun] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fetch current preference on mount
  useEffect(() => {
    if (pathname.startsWith('/proto')) return
    getTeacherAutorunSetting().then((value) => {
      setAutorun(value)
      setLoaded(true)
    })
  }, [pathname])

  // Only render for the teacher role once hydrated
  if (pathname.startsWith('/proto')) return null
  if (!mounted || role !== 'teacher') return null

  const handleToggle = () => {
    const next = !autorun
    setAutorun(next)
    startTransition(async () => {
      await updateSpeedGraderAutorun(next)
    })
  }

  // Loading shell — prevents layout shift while preference is being fetched
  if (!loaded) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Auto-grade</span>
        <div className="h-5 w-9 animate-pulse rounded-full bg-slate-200" />
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
      title={`Auto-run SpeedGrader on open: ${autorun ? 'ON' : 'OFF'}`}
    >
      <span className="select-none">Auto-grade</span>
      {/* Toggle pill */}
      <span
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-150 ${
          autorun ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      >
        <span
          className={`mt-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${
            autorun ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
