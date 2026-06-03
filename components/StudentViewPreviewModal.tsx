'use client'

/**
 * Shared Student View Preview modal.
 * Used by TeacherAssignmentView and GenerateFlow panel Preview tab.
 * Issue #125: extracted to a single shared component.
 */

import 'katex/dist/katex.min.css'
import { renderContentBlocks } from '@/lib/content-block-renderer'
import type { ContentBlock } from '@/lib/content-blocks'

interface Props {
  title: string
  dueDate?: string | null
  pointsPossible: number
  instructions: string
  contentBlocks: ContentBlock[]
  courseName?: string
  weekNumber?: number
  onClose: () => void
}

const C = {
  border: '#e2e8f0',
  text: '#1b1b1d',
  muted: '#45464d',
  purple: '#7C3AED',
  purpleBg: '#7C3AED10',
  surface: '#f6f3f5',
}

function formatDue(due: string | null | undefined): string {
  if (!due) return ''
  try {
    return new Date(due + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  } catch {
    return due
  }
}

export function StudentViewPreviewModal({
  title,
  dueDate,
  pointsPossible,
  instructions: _instructions,
  contentBlocks,
  courseName,
  weekNumber,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '90vh', border: `1px solid ${C.border}` }}
      >
        {/* Browser chrome */}
        <div
          className="flex flex-shrink-0 items-center gap-2 rounded-t-2xl border-b px-4 py-3"
          style={{ background: '#f8f8f8', borderColor: C.border }}
        >
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div
            className="mx-auto flex items-center gap-2 rounded-md border bg-white px-3 py-1 text-xs text-slate-400"
            style={{ borderColor: C.border }}
          >
            alumos.app / assignment / a1
          </div>
          <button
            onClick={onClose}
            className="ml-auto cursor-pointer text-xs text-slate-400 hover:text-slate-600"
          >
            ✕ Close
          </button>
        </div>

        {/* Banner */}
        <div
          className="flex-shrink-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest"
          style={{ background: C.purpleBg, borderBottom: `1px solid ${C.border}`, color: C.purple }}
        >
          Student View Preview — content in block order
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Breadcrumb */}
          {(courseName || weekNumber) && (
            <div className="mb-4 flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
              {courseName && <span>{courseName}</span>}
              {courseName && weekNumber && <span>›</span>}
              {weekNumber && <span>Week {weekNumber}</span>}
              {(courseName || weekNumber) && <span>›</span>}
              <span>{title}</span>
            </div>
          )}

          <h1 className="mb-1 text-xl font-bold" style={{ color: C.text }}>{title}</h1>
          <div className="mb-6 flex items-center gap-4 text-xs" style={{ color: C.muted }}>
            {dueDate && <span>Due {formatDue(dueDate)}</span>}
            {dueDate && <span>·</span>}
            <span>{pointsPossible} points</span>
          </div>

          {/* Content blocks */}
          <div className="mb-6">
            {renderContentBlocks(contentBlocks)}
          </div>

          {/* Submit area */}
          <textarea
            readOnly
            placeholder="Write your response here…"
            rows={4}
            className="mb-4 w-full resize-none rounded-xl border p-4 text-sm text-slate-400 focus:outline-none"
            style={{ borderColor: C.border }}
          />
          <button
            className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: C.purple }}
          >
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  )
}
