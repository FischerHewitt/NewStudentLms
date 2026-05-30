'use client'

import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  /** Applied to the outer wrapper (controls size/layout). */
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

type Action = 'bold' | 'italic' | 'ul' | 'ol'

function applyFormat(ta: HTMLTextAreaElement, action: Action): string {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const selected = value.slice(s, e)

  if (action === 'bold') {
    return value.slice(0, s) + `**${selected || 'bold text'}**` + value.slice(e)
  }
  if (action === 'italic') {
    return value.slice(0, s) + `*${selected || 'italic text'}*` + value.slice(e)
  }

  // Block actions: operate on full lines covered by the selection
  const lineStart = value.lastIndexOf('\n', s - 1) + 1
  const lineEndIdx = value.indexOf('\n', e)
  const blockEnd = lineEndIdx === -1 ? value.length : lineEndIdx
  const lines = value.slice(lineStart, blockEnd).split('\n')

  const prefixed = lines.map((line, i) => {
    if (action === 'ul') {
      return line.startsWith('- ') ? line.slice(2) : `- ${line}`
    }
    const m = line.match(/^\d+\. /)
    return m ? line.slice(m[0].length) : `${i + 1}. ${line}`
  })

  return value.slice(0, lineStart) + prefixed.join('\n') + value.slice(blockEnd)
}

export function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  className = '',
  disabled,
  autoFocus,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleAction = (action: Action) => {
    const ta = ref.current
    if (!ta) return
    onChange(applyFormat(ta, action))
    requestAnimationFrame(() => ta.focus())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      if (e.key === 'b') { e.preventDefault(); handleAction('bold') }
      if (e.key === 'i') { e.preventDefault(); handleAction('italic') }
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 ${className}`}>
      <div className="flex items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1">
        <Btn onActivate={() => handleAction('bold')} title="Bold (⌘B)">
          <strong className="text-xs">B</strong>
        </Btn>
        <Btn onActivate={() => handleAction('italic')} title="Italic (⌘I)">
          <em className="text-xs font-serif">I</em>
        </Btn>
        <div className="mx-1.5 h-3.5 w-px bg-slate-300" />
        <Btn onActivate={() => handleAction('ul')} title="Bullet list">
          <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
            <circle cx="1.5" cy="3.5" r="1.2" />
            <rect x="4" y="2.7" width="9" height="1.7" rx="0.85" />
            <circle cx="1.5" cy="7" r="1.2" />
            <rect x="4" y="6.2" width="9" height="1.7" rx="0.85" />
            <circle cx="1.5" cy="10.5" r="1.2" />
            <rect x="4" y="9.7" width="9" height="1.7" rx="0.85" />
          </svg>
        </Btn>
        <Btn onActivate={() => handleAction('ol')} title="Numbered list">
          <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
            <text x="0" y="5" fontSize="4.5" fontFamily="monospace">1.</text>
            <rect x="5" y="2.7" width="8" height="1.7" rx="0.85" />
            <text x="0" y="8.5" fontSize="4.5" fontFamily="monospace">2.</text>
            <rect x="5" y="6.2" width="8" height="1.7" rx="0.85" />
            <text x="0" y="12" fontSize="4.5" fontFamily="monospace">3.</text>
            <rect x="5" y="9.7" width="8" height="1.7" rx="0.85" />
          </svg>
        </Btn>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full resize-y border-0 bg-white p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:opacity-50"
      />
    </div>
  )
}

function Btn({
  onActivate,
  title,
  children,
}: {
  onActivate: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // keep textarea focus
        onActivate()
      }}
      title={title}
      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
    >
      {children}
    </button>
  )
}
