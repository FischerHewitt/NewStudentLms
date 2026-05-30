'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'

interface RubricCriterion {
  description: string
  points: number
}

interface Props {
  assignmentTitle: string
  instructions: string
  rubricCriteria?: RubricCriterion[]
  studentDraft?: string
}

export function StudentCoach({ assignmentTitle, instructions, rubricCriteria, studentDraft }: Props) {
  const [open, setOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/student-coach',
    body: { assignmentTitle, instructions, rubricCriteria, studentDraft },
  })

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 shadow-sm">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold text-indigo-800">AI Learning Coach</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
            Helps you think — won&apos;t write your answer
          </span>
        </div>
        <span className="text-indigo-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-indigo-100 px-5 pb-4">
          {/* Message list */}
          <div className="mb-3 max-h-72 overflow-y-auto space-y-3 pt-3">
            {messages.length === 0 && (
              <p className="text-sm text-indigo-400 italic">
                Ask anything about this assignment — I&apos;ll help you think it through.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 border border-indigo-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm text-slate-400">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question…"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
