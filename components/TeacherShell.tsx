'use client'

import { useState } from 'react'
import { TeacherSidebar } from './TeacherSidebar'

export function TeacherShell({ children, initialCollapsed = false }: { children: React.ReactNode; initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div
        className="flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 64 : 220 }}
      >
        {children}
      </div>
    </div>
  )
}
