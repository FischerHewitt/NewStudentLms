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
