'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import { useBreadcrumb } from '@/context/BreadcrumbContext'

export function TeacherHeader() {
  const { mounted } = useRole()
  const { items: breadcrumbs } = useBreadcrumb()

  function switchToStudent() {
    localStorage.setItem('lms_active_role', 'student')
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open teacher navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:hidden"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1" aria-label="Breadcrumb">
            {breadcrumbs.map((item, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        ) : (
          <div className="relative hidden w-72 sm:block">
            <input
              type="text"
              placeholder="Search students, courses..."
              className="w-full rounded-full border border-outline-variant bg-white/70 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-alumos-purple focus:outline-none focus:ring-2 focus:ring-alumos-purple/30"
            />
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Announcement — icon only */}
        <button
          type="button"
          aria-label="Quick Announcement"
          title="Quick Announcement"
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        {mounted && (
          <button
            onClick={switchToStudent}
            aria-label="Switch to student view"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:ring-2 hover:ring-alumos-purple/30"
          >
            <Image
              src="/alumos-icon.png"
              alt="Teacher profile"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          </button>
        )}
      </div>
    </header>
  )
}
