/**
 * Pure block-to-JSX renderer.
 * Used by StudentAssignmentView and the teacher-side Student Preview modal.
 * No component state — accepts blocks, returns a React element.
 */
import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { ContentBlock } from '@/lib/content-blocks'

export function renderContentBlocks(blocks: ContentBlock[]): React.ReactElement {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.kind === 'text') {
          return <TextBlock key={block.id} text={block.label} />
        }

        if (block.kind === 'math') {
          return <MathBlock key={block.id} latex={block.label} />
        }

        if (block.kind === 'download') {
          return (
            <div key={block.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="material-symbols-outlined text-[20px] text-slate-500">download</span>
              <span className="flex-1 text-sm text-slate-700">{block.label}</span>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

// ─── Text block with inline math + Markdown ──────────────────────────────────

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'inline-math'; value: string }
  | { kind: 'display-math'; value: string }

/**
 * Splits text into alternating text/math segments.
 * Handles $$...$$ (display) before $...$ (inline) to avoid ambiguity.
 * An unmatched $ is treated as literal text.
 */
function parseInlineMath(text: string): Segment[] {
  const segments: Segment[] = []

  // First pass: extract $$...$$ display blocks
  const displayParts: Array<{ start: number; end: number; latex: string }> = []
  const displayRe = /\$\$([\s\S]+?)\$\$/g
  let m: RegExpExecArray | null
  while ((m = displayRe.exec(text)) !== null) {
    displayParts.push({ start: m.index, end: m.index + m[0].length, latex: m[1] })
  }

  // Build coarse segment list from display math boundaries
  const coarse: Segment[] = []
  let cursor = 0
  for (const part of displayParts) {
    if (part.start > cursor) coarse.push({ kind: 'text', value: text.slice(cursor, part.start) })
    coarse.push({ kind: 'display-math', value: part.latex })
    cursor = part.end
  }
  if (cursor < text.length) coarse.push({ kind: 'text', value: text.slice(cursor) })

  // Second pass: expand text segments to extract $...$ inline math
  const inlineRe = /\$([^$\n]+?)\$/g
  for (const seg of coarse) {
    if (seg.kind !== 'text') { segments.push(seg); continue }
    let pos = 0
    inlineRe.lastIndex = 0
    while ((m = inlineRe.exec(seg.value)) !== null) {
      if (m.index > pos) segments.push({ kind: 'text', value: seg.value.slice(pos, m.index) })
      segments.push({ kind: 'inline-math', value: m[1] })
      pos = m.index + m[0].length
    }
    if (pos < seg.value.length) segments.push({ kind: 'text', value: seg.value.slice(pos) })
  }

  return segments.filter((s) => s.value !== '')
}

const mdComponents: Components = {
  p: ({ children }) => <span className="text-sm leading-relaxed text-slate-700">{children}</span>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
}

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const katex = require('katex') as typeof import('katex')
    return katex.renderToString(latex, { throwOnError: true, displayMode })
  } catch {
    return ''
  }
}

function TextBlock({ text }: { text: string }) {
  const segments = parseInlineMath(text)
  const hasMath = segments.some((s) => s.kind !== 'text')

  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Instructions
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm leading-relaxed text-slate-700">
        {hasMath ? (
          segments.map((seg, i) => {
            if (seg.kind === 'display-math') {
              const html = renderKatex(seg.value, true)
              return html ? (
                <div key={i} className="my-2 text-center" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <span key={i} className="font-mono text-xs text-slate-400">{`$$${seg.value}$$`}</span>
              )
            }
            if (seg.kind === 'inline-math') {
              const html = renderKatex(seg.value, false)
              return html ? (
                <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <span key={i} className="font-mono text-xs text-slate-400">{`$${seg.value}$`}</span>
              )
            }
            return <ReactMarkdown key={i} components={mdComponents}>{seg.value}</ReactMarkdown>
          })
        ) : (
          <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>
        )}
      </div>
    </div>
  )
}

/** Renders a standalone LaTeX math block in display mode. Invalid LaTeX shows a friendly error. */
function MathBlock({ latex }: { latex: string }) {
  const html = renderKatex(latex, true)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-sm text-amber-600">⚠ Formula could not be rendered</p>
      )}
    </div>
  )
}
