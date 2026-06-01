'use client'

import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { useRole } from '@/context/RoleContext'
import { TeacherHeader } from '@/components/TeacherHeader'
import { TeacherShell } from '@/components/TeacherShell'
import { useSearchParams } from 'next/navigation'

export function CourseRouteChrome({ children }: { children: React.ReactNode }) {
  const { role, mounted } = useRole()
  const searchParams = useSearchParams()
  const requestedView = searchParams.get('view')
  const routeRole =
    requestedView === 'student' || requestedView === 'teacher' ? requestedView : null
  const effectiveRole = routeRole ?? role

  if (!mounted && !routeRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-medium text-slate-500">
        Loading course...
      </div>
    )
  }

  if (effectiveRole === 'student') {
    return (
      <BreadcrumbProvider>
        <main className="min-h-screen bg-slate-50 px-4 py-8">
          {children}
        </main>
      </BreadcrumbProvider>
    )
  }

  return (
    <BreadcrumbProvider>
      <TeacherShell initialCollapsed>
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </TeacherShell>
    </BreadcrumbProvider>
  )
}
