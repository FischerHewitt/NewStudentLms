import Link from 'next/link'
import Image from 'next/image'
import { RoleToggle } from './RoleToggle'
import { AutorunToggle } from './AutorunToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div style={{ filter: 'drop-shadow(0 0 8px rgba(255,59,122,0.35))' }}>
            <Image src="/alumos-icon.png" alt="ALUMOS" width={28} height={28} className="object-contain" />
          </div>
          <span
            className="text-sm font-bold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            ALUMOS
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <AutorunToggle />
          <RoleToggle />
        </div>
      </div>
    </header>
  )
}
