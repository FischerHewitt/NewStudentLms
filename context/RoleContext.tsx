'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { ROLE_USER_ID, type Role } from '@/lib/constants'

interface RoleContextValue {
  /** The currently active role: 'teacher' or 'student' */
  role: Role
  /** The seeded UUID for the active role */
  userId: string
  /** Toggle between teacher and student */
  toggleRole: () => void
  /** True once the context has hydrated from localStorage */
  mounted: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

const STORAGE_KEY = 'lms_active_role'

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Default to 'teacher' for SSR — localStorage is read after mount
  const [role, setRole] = useState<Role>('teacher')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'teacher' || stored === 'student') {
      setRole(stored)
    }
    setMounted(true)
  }, [])

  const toggleRole = useCallback(() => {
    setRole((current) => {
      const next: Role = current === 'teacher' ? 'student' : 'teacher'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <RoleContext.Provider
      value={{ role, userId: ROLE_USER_ID[role], toggleRole, mounted }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within a RoleProvider')
  return ctx
}
