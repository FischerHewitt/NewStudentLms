'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PrototypeVariant {
  key: string
  name: string
}

interface PrototypeSwitcherProps {
  variants: PrototypeVariant[]
  current: string
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  )
}

export function PrototypeSwitcher({ variants, current }: PrototypeSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentIndex = Math.max(0, variants.findIndex((variant) => variant.key === current))
  const active = variants[currentIndex] ?? variants[0]

  function go(direction: -1 | 1) {
    const nextIndex = (currentIndex + direction + variants.length) % variants.length
    const params = new URLSearchParams(searchParams.toString())
    params.set('variant', variants[nextIndex].key)
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-white shadow-2xl">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous prototype variant"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/20"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <p className="min-w-48 text-center text-sm font-semibold">
          {active.key} - {active.name}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next prototype variant"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/20"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
