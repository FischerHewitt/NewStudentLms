'use client'

import { FormEvent, useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import type { Role } from '@/lib/constants'
import {
  buildTeacherCoachRequest,
  normalizeTeacherCoachContext,
  type TeacherCoachContext,
} from '@/lib/teacher-coach-context'
import {
  TEACHER_COACH_CONTEXT_EVENT,
  type TeacherCoachContextWindow,
} from '@/components/TeacherCoachContextBridge'

type TeacherCoachMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function TeacherCoachPanel({ role }: { role: Role }) {
  const [open, setOpen] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<TeacherCoachMessage[]>([])
  const [context, setContext] = useState<TeacherCoachContext>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const currentContext = (window as TeacherCoachContextWindow).__teacherCoachContext
    if (currentContext) setContext(currentContext)

    const handleContext = (event: Event) => {
      const detail = (event as CustomEvent<TeacherCoachContext>).detail ?? {}
      setContext(normalizeTeacherCoachContext(detail))
    }

    window.addEventListener(TEACHER_COACH_CONTEXT_EVENT, handleContext)
    return () => window.removeEventListener(TEACHER_COACH_CONTEXT_EVENT, handleContext)
  }, [])

  if (role !== 'teacher') return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = input.trim()
    if (!content) return

    const nextMessages: TeacherCoachMessage[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')

    startTransition(async () => {
      const response = await fetch('/api/teacher-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildTeacherCoachRequest(nextMessages, context)),
      })
      const answer = await response.text()
      setMessages([...nextMessages, { role: 'assistant', content: answer }])
    })
  }

  return (
    <aside className="fixed bottom-5 right-5 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">Teacher Coach</span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="space-y-3 p-4" data-api="/api/teacher-coach">
          <p className="text-sm text-slate-500">What do you need help with?</p>

          {messages.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'ml-8 bg-indigo-600 text-white'
                      : 'mr-8 border border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} action="/api/teacher-coach" className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Teacher Coach..."
              disabled={isPending}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </aside>
  )
}

export function TeacherCoach() {
  const { role } = useRole()
  const pathname = usePathname()
  if (pathname.startsWith('/proto')) return null

  return <TeacherCoachPanel role={role} />
}

// ─── #68 TeacherAiFab — Luminous Intelligence floating AI button ──────────────

const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

type FabMessage = { role: 'user' | 'assistant'; content: string }

export function TeacherAiFab({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [unread, setUnread] = useState(1)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<FabMessage[]>([])
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setOpen(true)
    setUnread(0)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const content = input.trim()
    if (!content) return
    const next: FabMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    startTransition(async () => {
      const res = await fetch('/api/teacher-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const answer = await res.text()
      setMessages([...next, { role: 'assistant', content: answer }])
      setUnread((u) => u + 1)
    })
  }

  if (open) {
    return (
      <aside
        className="fixed bottom-5 right-5 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: '2px solid transparent', backgroundImage: `linear-gradient(white, white), ${AI_GRADIENT}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base ai-gradient-text font-bold">✦</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Luminous Intelligence</p>
              <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close AI assistant"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="max-h-64 flex-1 space-y-2 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm italic text-slate-400">&ldquo;How can I help you with your lesson planning today?&rdquo;</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'ml-8 text-white'
                  : 'mr-8 border border-slate-100 bg-slate-50 text-slate-700'
              }`}
              style={m.role === 'user' ? { background: AI_GRADIENT } : undefined}
            >
              {m.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 p-3">
          <form onSubmit={handleSubmit} action="/api/teacher-coach" className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Luminous Intelligence..."
              disabled={isPending}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: AI_GRADIENT }}
            >
              ↑
            </button>
          </form>
        </div>
      </aside>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open AI assistant"
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{ background: AI_GRADIENT }}
      >
        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: '"FILL" 1' }}>
          auto_awesome
        </span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}
