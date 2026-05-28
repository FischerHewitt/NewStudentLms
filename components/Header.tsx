import Link from 'next/link'
import { RoleToggle } from './RoleToggle'

/**
 * Persistent top header — present on every page.
 * Contains the LMS brand and the role toggle.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            AI
          </span>
          <span className="text-sm font-semibold tracking-tight">
            AI-Native LMS
          </span>
        </Link>

        {/* Role toggle */}
        <RoleToggle />
      </div>
    </header>
  )
}
