import Link from 'next/link'
import { RoleToggle } from './RoleToggle'
import { AutorunToggle } from './AutorunToggle'
import { ALUMOSGradientLogo } from './ALUMOSGradientLogo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/studentview" className="transition-opacity hover:opacity-80">
          <ALUMOSGradientLogo iconSize={28} />
        </Link>

        <div className="flex items-center gap-4">
          <AutorunToggle />
          <RoleToggle />
        </div>
      </div>
    </header>
  )
}
