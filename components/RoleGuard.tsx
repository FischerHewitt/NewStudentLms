'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'

interface Props {
  requiredRole: 'teacher' | 'student'
  redirectTo: string
  children: React.ReactNode
}

export function RoleGuard({ requiredRole, redirectTo, children }: Props) {
  const { role, mounted } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (mounted && role !== requiredRole) {
      router.replace(redirectTo)
    }
  }, [mounted, role, requiredRole, redirectTo, router])

  if (!mounted || role !== requiredRole) return null
  return <>{children}</>
}
