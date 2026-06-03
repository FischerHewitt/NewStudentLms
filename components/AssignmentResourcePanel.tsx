'use client'

/**
 * Resource Side Panel — 560px right drawer opened during course review.
 * Issue #111: Edit tab wired to live state.
 * Issue #112: Math tab with KaTeX live preview + rendered ADDED section.
 * Issue #114: Files tab wired to staged files state.
 * Issue #123: File dedup enforced on upload.
 * Issue #125: Preview tab opens shared StudentViewPreviewModal.
 */

import { useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import {
  addBlock,
  removeBlock,
  moveBlock,
  getAssignmentBlocks,
  validateLatex,
  isDuplicateFile,
  type ContentBlock,
} from '@/lib/content-blocks'
import { StudentViewPreviewModal } from '@/components/StudentViewPreviewModal'

export type ResourcePanelTab = 'edit' | 'math' | 'pdf' | 'files' | 'preview'
export type StagedFile = { id: string; name: string }

const LI = {
  surface: '#f6f3f5',
  border: '#e2e8f0',
  text: '#1b1b1d',
  muted: '#45464d',
  purple: '#7C3AED',
  purpleFaint: '#7C3AED14',
}

interface Props {
  assignmentTitle: string
  dueDate?: string | null
  pointsPossible?: number
  /** Current instruction text (first text block, per ADR-0010 decision 2A). */
  instructions: string
  stagedFiles: StagedFile[]
  contentBlocks?: ContentBlock[]
  onBlocksChange?: (blocks: ContentBlock[]) => void
  activeTab: ResourcePanelTab
  onTabChange: (tab: ResourcePanelTab) => void
  onInstructionsChange: (value: string) => void
  onAddFile: (file: StagedFile) => void
  onRemoveFile: (id: string) => void
  onClose: () => void
  onPreview?: () => void
}

const PANEL_WIDTH = 560

const TABS: { id: ResourcePanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'edit',    label: 'Edit',    icon: <EditIcon /> },
  { id: 'math',    label: 'Math',    icon: <MathIcon /> },
  { id: 'pdf',     label: 'PDF',     icon: <PdfIcon /> },
  { id: 'files',   label: 'Files',   icon: <DownloadIcon /> },
  { id: 'preview', label: 'Preview', icon: <PreviewIcon /> },
]

export function AssignmentResourcePanel({
  assignmentTitle,
  dueDate,
  pointsPossible = 0,
  instructions,
  stagedFiles,
  contentBlocks: contentBlocksProp,
  onBlocksChange,
  activeTab,
  onTabChange,
  onInstructionsChange,
  onAddFile,
  onRemoveFile,
  onClose,
  onPreview,
}: Props) {
  const contentBlocks = contentBlocksProp ?? getAssignmentBlocks({ instructions })
  const [showPreview, setShowPreview] = useState(false)

  const handleTabClick = (id: ResourcePanelTab) => {
    if (id === 'preview') {
      setShowPreview(true)
      onPreview?.()
    } else {
      onTabChange(id)
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 right-0 top-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: `${PANEL_WIDTH}px`, borderLeft: `1px solid ${LI.border}` }}
        role="dialog"
        aria-label={`Assignment resources: ${assignmentTitle}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b px-6 py-4" style={{ borderColor: LI.border }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.muted }}>
                Assignment Resources
              </p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: LI.text }}>{assignmentTitle}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab bar */}
          <div
            className="mt-3 flex gap-1 rounded-xl p-1"
            style={{ background: LI.surface, border: `1px solid ${LI.border}` }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabClick(t.id)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition"
                style={
                  activeTab === t.id
                    ? { background: '#fff', color: LI.purple, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { color: LI.muted }
                }
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'edit' && (
            <EditTabContent
              instructions={instructions}
              contentBlocks={contentBlocks}
              onInstructionsChange={onInstructionsChange}
              onBlocksChange={onBlocksChange ?? (() => {})}
            />
          )}
          {activeTab === 'math' && (
            <MathTabContent
              contentBlocks={contentBlocks}
              onBlocksChange={onBlocksChange ?? (() => {})}
            />
          )}
          {activeTab === 'pdf' && (
            <StubTab
              label="PDF / AI context"
              description="Attach context documents for AI SpeedGrader — coming soon."
            />
          )}
          {activeTab === 'files' && (
            <FilesTabContent
              stagedFiles={stagedFiles}
              onAddFile={onAddFile}
              onRemoveFile={onRemoveFile}
            />
          )}
        </div>
      </div>

      {showPreview && (
        <StudentViewPreviewModal
          title={assignmentTitle}
          dueDate={dueDate}
          pointsPossible={pointsPossible}
          instructions={instructions}
          contentBlocks={contentBlocks}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}

// ── Edit tab ──────────────────────────────────────────────────────────────────

function EditTabContent({
  instructions,
  contentBlocks,
  onInstructionsChange,
  onBlocksChange,
}: {
  instructions: string
  contentBlocks: ContentBlock[]
  onInstructionsChange: (val: string) => void
  onBlocksChange: (blocks: ContentBlock[]) => void
}) {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick')
  const editorRef = useRef<HTMLDivElement>(null)
  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }
  const COLORS = ['#1b1b1d', '#7C3AED', '#2563EB', '#DC2626', '#059669', '#D97706']

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div
        className="flex rounded-xl p-1"
        style={{ background: LI.surface, border: `1px solid ${LI.border}` }}
      >
        {(['quick', 'advanced'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition"
            style={
              mode === m
                ? { background: '#fff', color: LI.text, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { color: LI.muted }
            }
          >
            {m === 'quick' ? 'Quick Edit' : '✦ Advanced Edit'}
          </button>
        ))}
      </div>

      {mode === 'quick' ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onInstructionsChange(e.currentTarget.innerHTML)}
          aria-label="Assignment instructions"
          className="min-h-[144px] w-full rounded-xl border p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-200"
          style={{ borderColor: LI.border, background: LI.surface, color: LI.text }}
          dangerouslySetInnerHTML={{ __html: instructions }}
        />
      ) : (
        <div>
          <div
            className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 px-3 py-2"
            style={{ borderColor: LI.border, background: LI.surface }}
          >
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: LI.border, background: '#fff' }}>
              <ToolbarBtn label="B" title="Bold" style={{ fontWeight: 'bold' }} onClick={() => exec('bold')} />
              <ToolbarBtn label="I" title="Italic" style={{ fontStyle: 'italic' }} onClick={() => exec('italic')} />
              <ToolbarBtn label="U" title="Underline" style={{ textDecoration: 'underline' }} onClick={() => exec('underline')} />
            </div>
            <select
              onChange={(e) => exec('fontSize', e.target.value)}
              defaultValue="3"
              aria-label="Font size"
              className="cursor-pointer rounded-lg border px-2 py-1 text-xs focus:outline-none"
              style={{ borderColor: LI.border }}
            >
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
            </select>
            <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: LI.border, background: '#fff' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`Text color ${c}`}
                  onMouseDown={(e) => { e.preventDefault(); exec('foreColor', c) }}
                  className="h-4 w-4 cursor-pointer rounded-full transition hover:scale-110"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: LI.border, background: '#fff' }}>
              <ToolbarBtn label="•—" title="Bullets" onClick={() => exec('insertUnorderedList')} />
              <ToolbarBtn label="1—" title="Numbers" onClick={() => exec('insertOrderedList')} />
            </div>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onInstructionsChange(e.currentTarget.innerHTML)}
            aria-label="Assignment instructions advanced editor"
            className="min-h-[120px] rounded-b-xl border p-4 text-sm leading-relaxed focus:outline-none"
            style={{ borderColor: LI.border, color: LI.text }}
            dangerouslySetInnerHTML={{ __html: instructions }}
          />
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.muted }}>
              Student sees
            </p>
            <div
              className="rounded-xl border p-4 text-sm leading-relaxed"
              style={{ borderColor: LI.border, background: '#fafafa', color: LI.text }}
              dangerouslySetInnerHTML={{ __html: instructions }}
            />
          </div>
        </div>
      )}

      {/* Content Order */}
      <ContentOrderList
        contentBlocks={contentBlocks}
        onBlocksChange={onBlocksChange}
      />
    </div>
  )
}

// ── Content Order drag list (v2 drag-to-reorder) ──────────────────────────────

function ContentOrderList({
  contentBlocks,
  onBlocksChange,
}: {
  contentBlocks: ContentBlock[]
  onBlocksChange: (blocks: ContentBlock[]) => void
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setOverId(id) }
  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return }
    const from = contentBlocks.findIndex((b) => b.id === dragId)
    const to = contentBlocks.findIndex((b) => b.id === targetId)
    if (from !== -1 && to !== -1) onBlocksChange(moveBlock(contentBlocks, from, to))
    setDragId(null); setOverId(null)
  }
  const onDragEnd = () => { setDragId(null); setOverId(null) }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.muted }}>
          Content Order
        </p>
        <p className="text-[10px]" style={{ color: '#c6c6cd' }}>Drag to reorder</p>
      </div>
      <div className="space-y-1.5">
        {contentBlocks.map((b) => (
          <div
            key={b.id}
            draggable
            onDragStart={() => onDragStart(b.id)}
            onDragOver={(e) => onDragOver(e, b.id)}
            onDrop={() => onDrop(b.id)}
            onDragEnd={onDragEnd}
            className="flex cursor-grab items-center gap-3 rounded-xl border px-4 py-3 transition active:cursor-grabbing"
            style={{
              borderColor: overId === b.id ? LI.purple : LI.border,
              background: dragId === b.id ? LI.purpleFaint : overId === b.id ? LI.purpleFaint : '#fff',
              opacity: dragId === b.id ? 0.5 : 1,
            }}
          >
            <span className="flex-shrink-0 select-none text-slate-300" style={{ fontSize: 14 }}>⠿</span>
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center" style={{ color: LI.purple + 'aa' }}>
              <BlockKindIcon kind={b.kind} />
            </span>
            <span className="flex-1 truncate text-xs" style={{ color: LI.text }}>
              {b.kind === 'text' ? 'Instructions' : b.label}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: LI.surface, color: LI.muted }}
            >
              {b.kind}
            </span>
            {b.kind !== 'text' && (
              <button
                type="button"
                onClick={() => onBlocksChange(removeBlock(contentBlocks, b.id))}
                aria-label={`Remove ${b.kind} block`}
                className="cursor-pointer text-xs text-slate-300 transition hover:text-red-400"
              >✕</button>
            )}
          </div>
        ))}

        {/* + Add block */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAddOpen((o) => !o)}
            className="w-full cursor-pointer rounded-xl border-2 border-dashed py-2.5 text-xs font-medium transition hover:border-purple-300 hover:text-purple-600"
            style={{ borderColor: LI.border, color: LI.muted }}
          >
            + Add block
          </button>
          {addOpen && (
            <div
              className="absolute bottom-full left-0 mb-1 w-full rounded-xl border bg-white shadow-lg"
              style={{ borderColor: LI.border }}
            >
              {[
                { kind: 'text' as const,     label: 'Text block',    icon: <EditIcon /> },
                { kind: 'math' as const,     label: 'Math formula',  icon: <MathIcon /> },
                { kind: 'download' as const, label: 'Download file', icon: <DownloadIcon /> },
              ].map((o) => (
                <button
                  key={o.kind}
                  onClick={() => {
                    onBlocksChange(addBlock(
                      contentBlocks, o.kind,
                      o.kind === 'text' ? 'New text block' : o.kind === 'math' ? 'New formula' : 'New file',
                    ))
                    setAddOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-xs transition hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="flex h-4 w-4 items-center justify-center" style={{ color: LI.purple }}>{o.icon}</span>
                  <span style={{ color: LI.text }}>{o.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Math tab ──────────────────────────────────────────────────────────────────

const MATH_TEMPLATES = [
  { label: 'Quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
  { label: 'Integral',  latex: '\\int_0^\\infty e^{-x}\\,dx = 1' },
  { label: 'Sigma',     latex: '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}' },
]

function MathTabContent({
  contentBlocks,
  onBlocksChange,
}: {
  contentBlocks: ContentBlock[]
  onBlocksChange: (blocks: ContentBlock[]) => void
}) {
  const [latex, setLatex] = useState('')
  const trimmed = latex.trim()
  const validation = trimmed ? validateLatex(trimmed) : null

  const mathBlocks = contentBlocks.filter((b) => b.kind === 'math')

  const handleAdd = () => {
    if (!validation?.ok) return
    onBlocksChange(addBlock(contentBlocks, 'math', trimmed))
    setLatex('')
  }

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: LI.muted }}>
        Type LaTeX — students see it rendered with KaTeX.
      </p>

      {/* LaTeX input */}
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.muted }}>
          LaTeX
        </label>
        <textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          rows={3}
          placeholder={'e.g.  x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'}
          aria-label="LaTeX formula input"
          className="w-full resize-none rounded-xl border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          style={{ borderColor: LI.border, background: LI.surface, color: LI.text }}
        />
      </div>

      {/* Live preview */}
      <div
        className="min-h-[64px] rounded-xl border p-4 text-center"
        style={{ borderColor: LI.border, background: '#fff' }}
      >
        {trimmed ? (
          validation?.ok ? (
            <div dangerouslySetInnerHTML={{ __html: validation.html }} />
          ) : (
            <p className="text-xs text-red-500">{validation?.error}</p>
          )
        ) : (
          <p className="text-xs" style={{ color: '#c6c6cd' }}>Live preview…</p>
        )}
      </div>

      {/* Template chips */}
      <div className="flex flex-wrap gap-2">
        {MATH_TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setLatex(t.latex)}
            className="cursor-pointer rounded-full border px-3 py-1 text-[11px] transition hover:opacity-70"
            style={{ borderColor: LI.purple + '40', color: LI.purple, background: LI.purpleFaint }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        disabled={!validation?.ok}
        onClick={handleAdd}
        className="w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: LI.purple }}
      >
        Add to Assignment
      </button>

      {/* Added section — rendered KaTeX cards */}
      {mathBlocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.muted }}>
            Added
          </p>
          {mathBlocks.map((b) => {
            const result = validateLatex(b.label)
            return (
              <div
                key={b.id}
                className="flex items-start justify-between gap-2 rounded-xl border bg-white p-3"
                style={{ borderColor: LI.border }}
              >
                {result.ok ? (
                  <div
                    className="flex-1 overflow-hidden text-sm"
                    dangerouslySetInnerHTML={{ __html: result.html }}
                  />
                ) : (
                  <p className="flex-1 font-mono text-xs text-slate-500">{b.label}</p>
                )}
                <button
                  type="button"
                  onClick={() => onBlocksChange(removeBlock(contentBlocks, b.id))}
                  aria-label="Remove formula"
                  className="flex-shrink-0 cursor-pointer text-xs text-slate-400 transition hover:text-red-500"
                >✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Files tab ─────────────────────────────────────────────────────────────────

function FilesTabContent({
  stagedFiles,
  onAddFile,
  onRemoveFile,
}: {
  stagedFiles: StagedFile[]
  onAddFile: (file: StagedFile) => void
  onRemoveFile: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dupError, setDupError] = useState('')

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const stagedNames = stagedFiles.map((f) => f.name)
    let hasError = false
    Array.from(files).forEach((f) => {
      if (isDuplicateFile(stagedNames, f.name)) {
        setDupError(`A file named "${f.name}" is already attached.`)
        hasError = true
        return
      }
      stagedNames.push(f.name)
      setDupError('')
      onAddFile({ id: `staged-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: f.name })
    })
    if (!hasError) setDupError('')
  }

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: LI.muted }}>
        Visible to students — starter code, datasets, templates.
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition hover:border-purple-300"
        style={{ background: LI.surface, borderColor: LI.border }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          aria-label="Upload student files"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />
        <span className="material-symbols-outlined text-[28px] text-slate-400">upload_file</span>
        <p className="text-sm font-medium" style={{ color: LI.text }}>Click to upload student files</p>
        <p className="text-xs" style={{ color: LI.muted }}>Files will be available for students to download</p>
      </div>
      {dupError && <p className="text-xs text-red-500">{dupError}</p>}
      {stagedFiles.length > 0 && (
        <ul className="space-y-1.5">
          {stagedFiles.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
              style={{ borderColor: LI.border }}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-slate-400">attach_file</span>
                <span className="text-sm" style={{ color: LI.text }}>{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#dcfce7', color: '#166534' }}>
                  visible to students
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(f.id)}
                  aria-label={`Remove ${f.name}`}
                  className="cursor-pointer text-xs text-slate-400 transition hover:text-red-500"
                >✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Stub tab ──────────────────────────────────────────────────────────────────

function StubTab({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function ToolbarBtn({ label, title, style: s, onClick }: {
  label: string; title: string; style?: React.CSSProperties; onClick: () => void
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      aria-label={title}
      className="cursor-pointer rounded px-2 py-0.5 text-xs transition hover:bg-slate-100"
      style={{ color: LI.text, ...s }}
    >
      {label}
    </button>
  )
}

function BlockKindIcon({ kind }: { kind: ContentBlock['kind'] }) {
  if (kind === 'math')     return <MathIcon />
  if (kind === 'download') return <DownloadIcon />
  return <EditIcon />
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function MathIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function PreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
