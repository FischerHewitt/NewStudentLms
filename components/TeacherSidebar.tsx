'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const SURFACE = '#fcf8fa'
const SURFACE_CONTAINER_LOW = '#f6f3f5'
const OUTLINE_VARIANT = '#c6c6cd'
const ON_SURFACE_VARIANT = '#45464d'
const SECONDARY = '#9d4300'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Courses', href: '/courses', icon: 'school' },
  { label: 'Gradebook', href: '/gradebook', icon: 'analytics' },
  { label: 'AI Assistant', href: '/ai-assistant', icon: 'auto_awesome' },
] as const

const BOTTOM_LINKS = [
  { label: 'Settings', href: '#', icon: 'settings' },
  { label: 'Help Center', href: '#', icon: 'help' },
] as const

interface TeacherSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function TeacherSidebar({ collapsed, onToggle }: TeacherSidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed left-0 top-0 hidden h-full flex-col py-6 md:flex transition-[width] duration-300 ease-in-out overflow-hidden"
      style={{
        width: collapsed ? 64 : 220,
        background: SURFACE,
        borderRight: `1px solid ${OUTLINE_VARIANT}`,
      }}
    >
      {/* Logo + collapse toggle */}
      <div className={`mb-8 flex items-center px-4 ${collapsed ? 'flex-col gap-3' : 'gap-1.5'}`}>
        <Image src="/alumos-icon.png" alt="Alumos" width={26} height={26} className="shrink-0 object-contain" />
        {!collapsed && (
          <h1
            className="text-lg font-bold leading-none"
            style={{
              fontFamily: 'var(--font-syne, system-ui)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            lumos
          </h1>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{ color: ON_SURFACE_VARIANT }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SURFACE_CONTAINER_LOW }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Primary nav */}
      <div className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_LINKS.map(({ label, href, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-lg py-2 text-sm transition-colors ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
              style={
                active
                  ? {
                      background: SURFACE_CONTAINER_LOW,
                      borderRight: collapsed ? undefined : `4px solid ${SECONDARY}`,
                      color: '#000000',
                      fontWeight: 700,
                    }
                  : { color: ON_SURFACE_VARIANT }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = SURFACE_CONTAINER_LOW
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span
                className="material-symbols-outlined shrink-0 text-[20px]"
                style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
              >
                {icon}
              </span>
              {!collapsed && label}
            </Link>
          )
        })}
      </div>

      {/* Bottom links + toggle */}
      <div
        className="flex flex-col gap-0.5 px-2 pt-4"
        style={{ borderTop: `1px solid ${OUTLINE_VARIANT}` }}
      >
        {BOTTOM_LINKS.map(({ label, href, icon }) => (
          <Link
            key={label}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center rounded-lg py-2 text-sm transition-colors ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}`}
            style={{ color: ON_SURFACE_VARIANT }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = SURFACE_CONTAINER_LOW
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span className="material-symbols-outlined shrink-0 text-[20px]">{icon}</span>
            {!collapsed && label}
          </Link>
        ))}

      </div>
    </nav>
  )
}
