'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Variant = {
  id: string
  label: string
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  )
}

export function PrototypeSwitcher({
  variants,
  current,
}: {
  variants: Variant[]
  current: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.id === current),
  )

  const navigate = (direction: -1 | 1) => {
    const nextIndex = (index + direction + variants.length) % variants.length
    const params = new URLSearchParams(searchParams.toString())
    params.set('variant', variants[nextIndex].id)
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft') navigate(-1)
      if (event.key === 'ArrowRight') navigate(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (process.env.NODE_ENV === 'production') return null

  const active = variants[index]

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-white shadow-2xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Previous prototype variant"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm font-bold hover:bg-white/10"
      >
        {'<'}
      </button>
      <div className="min-w-48 px-2 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Prototype
        </p>
        <p className="text-sm font-semibold">
          {active.id.toUpperCase()} - {active.label}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate(1)}
        aria-label="Next prototype variant"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm font-bold hover:bg-white/10"
      >
        {'>'}
      </button>
    </div>
  )
}
