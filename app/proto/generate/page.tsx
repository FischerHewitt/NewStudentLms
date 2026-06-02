// PROTOTYPE — throwaway. Delete or absorb after design decision.
// Questions:
//   1. Are wide droppable resource chips the right affordance? (all variants)
//   2. Content ordering: none (v=1), drag handles (v=2), or up/down buttons (v=3)?
// Toggle with ?v=1 | ?v=2 | ?v=3

'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ── Design tokens ────────────────────────────────────────────────────────────
const LI = {
  surfaceLow: '#f6f3f5',
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  alumosPurple: '#7C3AED',
  purpleFaint: '#7C3AED14',
}
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const PANEL_WIDTH = 560

// ── Types ────────────────────────────────────────────────────────────────────
type Criterion = { description: string; points: number }
type BlockKind = 'text' | 'math' | 'download'
type Block = { id: string; kind: BlockKind; label: string }

type Assignment = {
  id: string; week: number; title: string; points: number; due: string; instructions: string; rubric: Criterion[]
}
type Resources = { pdfFiles: string[]; dlFiles: string[] }
type Variant = '1' | '2' | '3'
type ResourceTab = 'format' | 'math' | 'pdf' | 'downloads' | 'preview'

// ── Mock data ────────────────────────────────────────────────────────────────
const INIT_MODULES: { week: number; title: string; assignments: Assignment[] }[] = [
  {
    week: 1, title: 'Foundations of Programming',
    assignments: [
      { id: 'a1', week: 1, title: 'Hello World Exercise', points: 10, due: '2026-08-15',
        instructions: 'Write your first Python program that prints "Hello, World!" to the console. Submit your .py file with a screenshot of the output.',
        rubric: [{ description: 'Program runs without errors', points: 5 }, { description: 'Output matches expected result', points: 3 }, { description: 'Code is clean and readable', points: 2 }] },
      { id: 'a2', week: 1, title: 'Variables & Types Quiz', points: 20, due: '2026-08-17',
        instructions: 'Short quiz covering variable declarations, data types, and type conversion in Python.',
        rubric: [{ description: 'Variable type identification correct', points: 10 }, { description: 'Type conversion examples correct', points: 10 }] },
    ],
  },
  {
    week: 2, title: 'Control Flow & Loops',
    assignments: [
      { id: 'a3', week: 2, title: 'Quadratic Solver Lab', points: 30, due: '2026-08-22',
        instructions: 'Build a program that solves quadratic equations ax² + bx + c = 0. Compute roots using the discriminant formula. Handle real and complex roots.',
        rubric: [{ description: 'Discriminant computed correctly', points: 10 }, { description: 'Real roots handled', points: 10 }, { description: 'Complex root case handled', points: 10 }] },
    ],
  },
]

// Pre-seeded content blocks per assignment — text + some extras for demo
const INIT_BLOCKS: Record<string, Block[]> = {
  a1: [
    { id: 'a1-0', kind: 'text', label: 'Instructions' },
    { id: 'a1-1', kind: 'math', label: 'x = (−b ± √(b²−4ac)) / 2a' },
    { id: 'a1-2', kind: 'download', label: 'starter_code.py' },
  ],
  a2: [{ id: 'a2-0', kind: 'text', label: 'Instructions' }],
  a3: [
    { id: 'a3-0', kind: 'text', label: 'Instructions' },
    { id: 'a3-1', kind: 'math', label: 'Δ = b² − 4ac' },
    { id: 'a3-2', kind: 'download', label: 'data.csv' },
  ],
}

function emptyResources(): Resources { return { pdfFiles: [], dlFiles: [] } }

// ── Root ─────────────────────────────────────────────────────────────────────
export default function ProtoGeneratePage() {
  return <Suspense><ProtoContent /></Suspense>
}

function ProtoContent() {
  const sp = useSearchParams()
  const variant: Variant = (sp.get('v') as Variant) ?? '1'

  const [modules, setModules] = useState(INIT_MODULES)
  const [resources, setResources] = useState<Record<string, Resources>>({})
  const [blocks, setBlocks] = useState<Record<string, Block[]>>(INIT_BLOCKS)

  const allAssignments = modules.flatMap(m => m.assignments)

  const getRes = (id: string): Resources => resources[id] ?? emptyResources()
  const setRes = (id: string, fn: (r: Resources) => Resources) =>
    setResources(prev => ({ ...prev, [id]: fn(prev[id] ?? emptyResources()) }))
  const getBlocks = (id: string): Block[] => blocks[id] ?? [{ id: `${id}-0`, kind: 'text', label: 'Instructions' }]
  const setBlocksFor = (id: string, fn: (b: Block[]) => Block[]) =>
    setBlocks(prev => ({ ...prev, [id]: fn(prev[id] ?? [{ id: `${id}-0`, kind: 'text', label: 'Instructions' }]) }))

  const updateRubric = (id: string, fn: (r: Criterion[]) => Criterion[]) =>
    setModules(prev => prev.map(m => ({ ...m, assignments: m.assignments.map(a => a.id === id ? { ...a, rubric: fn(a.rubric) } : a) })))
  const updateInstruction = (id: string, val: string) =>
    setModules(prev => prev.map(m => ({ ...m, assignments: m.assignments.map(a => a.id === id ? { ...a, instructions: val } : a) })))

  const [panelId, setPanelId] = useState<string | null>(null)
  const [panelTab, setPanelTab] = useState<ResourceTab>('format')
  const [previewId, setPreviewId] = useState<string | null>(null)

  const openPanel = (id: string, tab: ResourceTab) => { setPanelId(id); setPanelTab(tab) }
  const activeAssignment = allAssignments.find(a => a.id === panelId)

  return (
    <div className="min-h-screen" style={{ background: LI.surfaceLow }}>
      <VariantBar current={variant} />

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-6" style={{ transition: 'margin-right 0.25s ease', marginRight: panelId ? `${PANEL_WIDTH}px` : undefined }}>
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>✦ Review &amp; Edit</p>
          <div className="mt-1 flex items-center gap-3">
            <input defaultValue="Introduction to Computer Science" className="flex-1 rounded-lg border-0 bg-transparent px-1 text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-purple-200" style={{ color: LI.onSurface }} />
            <button className="flex-shrink-0 cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: AI_GRADIENT }}>Save Course →</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input placeholder="Term (e.g. Fall 2026)" className="rounded-lg border px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none" style={{ borderColor: LI.outlineVariant }} />
            <input placeholder="Section" className="w-28 rounded-lg border px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none" style={{ borderColor: LI.outlineVariant }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: LI.onSurfaceVariant }}>Start</span>
              <input type="date" defaultValue="2026-08-10" className="rounded-lg border px-2 py-1.5 text-sm focus:outline-none" style={{ borderColor: LI.outlineVariant }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {modules.map(mod => (
            <div key={mod.week} className="rounded-2xl bg-white shadow-sm" style={{ border: `1px solid ${LI.outlineVariant}` }}>
              <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: LI.outlineVariant }}>
                <span className="rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: LI.purpleFaint, color: LI.alumosPurple }}>Week {mod.week}</span>
                <input defaultValue={mod.title} className="flex-1 bg-transparent text-sm font-semibold focus:outline-none" style={{ color: LI.onSurface }} />
                <button className="cursor-pointer text-xs text-slate-400 hover:text-red-400">✕</button>
              </div>
              <div className="divide-y" style={{ borderColor: LI.outlineVariant + '60' }}>
                {mod.assignments.map(a => (
                  <AssignmentRow
                    key={a.id}
                    assignment={a}
                    resources={getRes(a.id)}
                    isPanelTarget={panelId === a.id}
                    onOpenPanel={(tab) => openPanel(a.id, tab)}
                    onPreview={() => setPreviewId(a.id)}
                    onUpdateRubric={(fn) => updateRubric(a.id, fn)}
                    onDropPdf={(name) => setRes(a.id, r => ({ ...r, pdfFiles: [...r.pdfFiles, name] }))}
                    onDropFile={(name) => setRes(a.id, r => ({ ...r, dlFiles: [...r.dlFiles, name] }))}
                  />
                ))}
              </div>
              <div className="px-5 py-3">
                <button className="cursor-pointer text-xs transition hover:opacity-70" style={{ color: LI.alumosPurple }}>+ Add assignment</button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-3 w-full cursor-pointer rounded-xl border-2 border-dashed py-3 text-sm transition hover:border-purple-300 hover:text-purple-500" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}>
          + Add module
        </button>

        <div className="mt-6 flex justify-end">
          <button className="cursor-pointer rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: AI_GRADIENT }}>Save Course →</button>
        </div>
      </div>

      {panelId && activeAssignment && (
        <ResourceSidePanel
          assignment={activeAssignment}
          resources={getRes(panelId)}
          blocks={getBlocks(panelId)}
          variant={variant}
          activeTab={panelTab}
          setActiveTab={setPanelTab}
          setRes={fn => setRes(panelId, fn)}
          setBlocks={fn => setBlocksFor(panelId, fn)}
          onUpdateInstruction={val => updateInstruction(panelId, val)}
          onClose={() => setPanelId(null)}
          onPreview={() => { setPreviewId(panelId); setPanelId(null) }}
        />
      )}

      {previewId && (
        <StudentPreviewModal
          assignment={allAssignments.find(a => a.id === previewId)!}
          resources={getRes(previewId)}
          blocks={getBlocks(previewId)}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  )
}

// ── Assignment row ────────────────────────────────────────────────────────────
function AssignmentRow({ assignment: a, resources, isPanelTarget, onOpenPanel, onPreview, onUpdateRubric, onDropPdf, onDropFile }: {
  assignment: Assignment; resources: Resources; isPanelTarget: boolean
  onOpenPanel: (tab: ResourceTab) => void; onPreview: () => void
  onUpdateRubric: (fn: (r: Criterion[]) => Criterion[]) => void
  onDropPdf: (name: string) => void; onDropFile: (name: string) => void
}) {
  const [rubricOpen, setRubricOpen] = useState(false)

  return (
    <div className="px-5 py-4 transition-colors" style={{ background: isPanelTarget ? LI.purpleFaint : undefined }}>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-3">
        <input defaultValue={a.title} className="rounded border-0 bg-transparent text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-purple-200" style={{ color: LI.onSurface }} />
        <input type="date" defaultValue={a.due} className="rounded border px-2 py-1 text-xs focus:outline-none" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }} />
        <div className="flex items-center gap-1">
          <input type="number" defaultValue={a.points} className="w-14 rounded border px-2 py-1 text-center text-xs focus:outline-none" style={{ borderColor: LI.outlineVariant }} />
          <span className="text-xs text-slate-400">pts</span>
        </div>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-red-400">✕</button>
      </div>

      <div className="relative mt-2">
        <textarea defaultValue={a.instructions} rows={2}
          className="w-full resize-none rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-xs leading-relaxed focus:border-slate-300 focus:outline-none"
          style={{ color: LI.onSurfaceVariant, paddingRight: '110px' }} />
        <button onClick={() => onOpenPanel('format')}
          className="absolute right-2 top-2 cursor-pointer rounded-md border px-2 py-1 text-[10px] font-semibold transition hover:opacity-80"
          style={{ borderColor: isPanelTarget ? LI.alumosPurple : LI.outlineVariant, color: isPanelTarget ? LI.alumosPurple : LI.onSurfaceVariant, background: '#fff' }}>
          Advanced Edit ↗
        </button>
      </div>

      {/* Rubric */}
      <div className="mt-3">
        <button onClick={() => setRubricOpen(o => !o)}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest transition hover:opacity-70"
          style={{ color: LI.onSurfaceVariant }}>
          <span>{rubricOpen ? '▾' : '▸'}</span>
          Rubric
          <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: LI.alumosPurple + '20', color: LI.alumosPurple }}>
            {a.rubric.length}
          </span>
        </button>
        {rubricOpen && (
          <div className="mt-2 space-y-1.5 rounded-xl border px-4 py-3" style={{ borderColor: LI.outlineVariant, background: '#fafafa' }}>
            {a.rubric.map((c, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: LI.outlineVariant }} />
                <input value={c.description} onChange={e => onUpdateRubric(r => r.map((cr, i) => i === ci ? { ...cr, description: e.target.value } : cr))}
                  className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs focus:border-slate-300 focus:outline-none" style={{ color: LI.onSurfaceVariant }} />
                <input type="number" value={c.points} min={0} onChange={e => onUpdateRubric(r => r.map((cr, i) => i === ci ? { ...cr, points: Number(e.target.value) } : cr))}
                  className="w-12 rounded border px-1 py-0.5 text-center text-xs focus:outline-none" style={{ borderColor: LI.outlineVariant }} />
                <span className="text-xs text-slate-400">pts</span>
                <button onClick={() => onUpdateRubric(r => r.filter((_, i) => i !== ci))} className="cursor-pointer text-[10px] text-slate-300 hover:text-red-400">✕</button>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <button onClick={() => onUpdateRubric(r => [...r, { description: '', points: 0 }])} className="cursor-pointer text-[11px] transition hover:opacity-70" style={{ color: LI.alumosPurple }}>+ Add criterion</button>
              <button className="cursor-pointer rounded border px-2 py-0.5 text-[10px] transition hover:border-purple-300 hover:text-purple-600" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}>✦ AI generate rubric</button>
            </div>
          </div>
        )}
      </div>

      {/* Resource chips — wider with drag-drop */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DropChip icon={<MathIcon />} label="Math" count={0} active={isPanelTarget} onClick={() => onOpenPanel('math')} />
        <DropChip
          icon={<PdfIcon />} label="PDF files" count={resources.pdfFiles.length} active={isPanelTarget}
          onClick={() => onOpenPanel('pdf')}
          onDrop={files => files.forEach(f => onDropPdf(f.name))}
        />
        <DropChip
          icon={<DownloadIcon />} label="Student files" count={resources.dlFiles.length} active={isPanelTarget}
          onClick={() => onOpenPanel('downloads')}
          onDrop={files => files.forEach(f => onDropFile(f.name))}
        />
        <DropChip icon={<PreviewIcon />} label="Preview" count={0} active={false} onClick={onPreview} accent />
      </div>
    </div>
  )
}

// Wider chip that accepts drag-drop directly
function DropChip({ icon, label, count, active, onClick, onDrop, accent }: {
  icon: React.ReactNode; label: string; count: number; active: boolean; onClick: () => void
  onDrop?: (files: File[]) => void; accent?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const canDrop = !!onDrop

  return (
    <button
      onClick={onClick}
      onDragOver={canDrop ? e => { e.preventDefault(); setDragging(true) } : undefined}
      onDragLeave={canDrop ? () => setDragging(false) : undefined}
      onDrop={canDrop ? e => { e.preventDefault(); setDragging(false); onDrop(Array.from(e.dataTransfer.files)) } : undefined}
      className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition"
      style={{
        borderColor: dragging ? LI.alumosPurple : accent ? LI.alumosPurple + '55' : active ? LI.alumosPurple : LI.outlineVariant,
        color: dragging || accent || active ? LI.alumosPurple : LI.onSurfaceVariant,
        background: dragging ? LI.purpleFaint : active && !accent ? LI.purpleFaint : '#fff',
        borderStyle: dragging ? 'dashed' : 'solid',
        minWidth: canDrop ? '110px' : undefined,
      }}
    >
      <span className="flex h-4 w-4 items-center justify-center opacity-70">{icon}</span>
      {label}
      {count > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: LI.alumosPurple }}>{count}</span>
      )}
      {canDrop && count === 0 && <span className="ml-auto text-[9px] opacity-40">drop</span>}
    </button>
  )
}

// ── Side panel ────────────────────────────────────────────────────────────────
function ResourceSidePanel({ assignment, resources, blocks, variant, activeTab, setActiveTab, setRes, setBlocks, onUpdateInstruction, onClose, onPreview }: {
  assignment: Assignment; resources: Resources; blocks: Block[]; variant: Variant
  activeTab: ResourceTab; setActiveTab: (t: ResourceTab) => void
  setRes: (fn: (r: Resources) => Resources) => void
  setBlocks: (fn: (b: Block[]) => Block[]) => void
  onUpdateInstruction: (val: string) => void
  onClose: () => void; onPreview: () => void
}) {
  const TABS: { id: ResourceTab; label: string; icon: React.ReactNode }[] = [
    { id: 'format', label: 'Edit', icon: <EditIcon /> },
    { id: 'math', label: 'Math', icon: <MathIcon /> },
    { id: 'pdf', label: 'PDF', icon: <PdfIcon /> },
    { id: 'downloads', label: 'Files', icon: <DownloadIcon /> },
    { id: 'preview', label: 'Preview', icon: <PreviewIcon /> },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)' }} />
      <div className="fixed bottom-0 right-0 top-0 z-50 flex flex-col bg-white shadow-2xl" style={{ width: `${PANEL_WIDTH}px`, borderLeft: `1px solid ${LI.outlineVariant}` }}>
        <div className="flex-shrink-0 border-b px-6 py-4" style={{ borderColor: LI.outlineVariant }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>Assignment Resources</p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: LI.onSurface }}>{assignment.title}</p>
            </div>
            <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mt-3 flex gap-1 rounded-xl p-1" style={{ background: LI.surfaceLow, border: `1px solid ${LI.outlineVariant}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => t.id === 'preview' ? onPreview() : setActiveTab(t.id)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition"
                style={activeTab === t.id ? { background: '#fff', color: LI.alumosPurple, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: LI.onSurfaceVariant }}>
                <span className="flex h-3.5 w-3.5 items-center justify-center">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'format' && (
            <FormatTabContent
              instructions={assignment.instructions}
              blocks={blocks}
              variant={variant}
              onUpdateInstruction={onUpdateInstruction}
              setBlocks={setBlocks}
            />
          )}
          {activeTab === 'math' && <MathTabContent blocks={blocks} setBlocks={setBlocks} />}
          {activeTab === 'pdf' && <PdfTabContent resources={resources} setRes={setRes} />}
          {activeTab === 'downloads' && <DownloadsTabContent resources={resources} setRes={setRes} blocks={blocks} setBlocks={setBlocks} />}
        </div>
      </div>
    </>
  )
}

// ── Format tab ────────────────────────────────────────────────────────────────
function FormatTabContent({ instructions, blocks, variant, onUpdateInstruction, setBlocks }: {
  instructions: string; blocks: Block[]; variant: Variant
  onUpdateInstruction: (val: string) => void
  setBlocks: (fn: (b: Block[]) => Block[]) => void
}) {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick')
  const [text, setText] = useState(instructions)
  const editorRef = useRef<HTMLDivElement>(null)
  const exec = (cmd: string, val?: string) => { editorRef.current?.focus(); document.execCommand(cmd, false, val) }
  const COLORS = ['#1b1b1d', '#7C3AED', '#2563EB', '#DC2626', '#059669', '#D97706']

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-xl p-1" style={{ background: LI.surfaceLow, border: `1px solid ${LI.outlineVariant}` }}>
        {(['quick', 'advanced'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition"
            style={mode === m ? { background: '#fff', color: LI.onSurface, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: LI.onSurfaceVariant }}>
            {m === 'quick' ? 'Quick Edit' : '✦ Advanced Edit'}
          </button>
        ))}
      </div>

      {/* Text editor */}
      {mode === 'quick' ? (
        <textarea value={text} onChange={e => { setText(e.target.value); onUpdateInstruction(e.target.value) }} rows={6}
          className="w-full resize-y rounded-xl border p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-200"
          style={{ borderColor: LI.outlineVariant, color: LI.onSurface, background: LI.surfaceLow }} />
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 px-3 py-2" style={{ borderColor: LI.outlineVariant, background: LI.surfaceLow }}>
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: LI.outlineVariant, background: '#fff' }}>
              <ToolbarBtn label="B" title="Bold" style={{ fontWeight: 'bold' }} onClick={() => exec('bold')} />
              <ToolbarBtn label="I" title="Italic" style={{ fontStyle: 'italic' }} onClick={() => exec('italic')} />
              <ToolbarBtn label="U" title="Underline" style={{ textDecoration: 'underline' }} onClick={() => exec('underline')} />
            </div>
            <select onChange={e => exec('fontSize', e.target.value)} defaultValue="3" className="cursor-pointer rounded-lg border px-2 py-1 text-xs focus:outline-none" style={{ borderColor: LI.outlineVariant }}>
              <option value="1">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="7">XL</option>
            </select>
            <div className="flex items-center gap-1 rounded-lg border p-1" style={{ borderColor: LI.outlineVariant, background: '#fff' }}>
              {COLORS.map(c => <button key={c} onMouseDown={e => { e.preventDefault(); exec('foreColor', c) }} className="h-4 w-4 cursor-pointer rounded-full transition hover:scale-110" style={{ background: c }} />)}
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: LI.outlineVariant, background: '#fff' }}>
              <ToolbarBtn label="≡" title="Left" onClick={() => exec('justifyLeft')} />
              <ToolbarBtn label="☰" title="Center" onClick={() => exec('justifyCenter')} />
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: LI.outlineVariant, background: '#fff' }}>
              <ToolbarBtn label="•—" title="Bullets" onClick={() => exec('insertUnorderedList')} />
              <ToolbarBtn label="1—" title="Numbers" onClick={() => exec('insertOrderedList')} />
            </div>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            onInput={e => { const v = e.currentTarget.innerHTML; setText(v); onUpdateInstruction(v) }}
            className="min-h-[120px] rounded-b-xl border p-4 text-sm leading-relaxed focus:outline-none"
            style={{ borderColor: LI.outlineVariant, color: LI.onSurface }}
            dangerouslySetInnerHTML={{ __html: text }} />
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>Student sees</p>
            <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ borderColor: LI.outlineVariant, background: '#fafafa', color: LI.onSurface }}
              dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        </div>
      )}

      {/* Content order section — varies by variant */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>Content Order</p>
          <p className="text-[10px]" style={{ color: LI.outlineVariant }}>
            {variant === '1' ? 'Fixed — upgrade to reorder' : variant === '2' ? 'Drag to reorder' : 'Use arrows to reorder'}
          </p>
        </div>

        {variant === '1' && <BlockListFixed blocks={blocks} />}
        {variant === '2' && <BlockListDraggable blocks={blocks} setBlocks={setBlocks} />}
        {variant === '3' && <BlockListButtons blocks={blocks} setBlocks={setBlocks} />}
      </div>
    </div>
  )
}

// ── V1: Fixed block list (no reordering) ──────────────────────────────────────
function BlockListFixed({ blocks }: { blocks: Block[] }) {
  return (
    <div className="rounded-xl border" style={{ borderColor: LI.outlineVariant }}>
      {blocks.map((b, i) => (
        <div key={b.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-0" style={{ borderColor: LI.outlineVariant }}>
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: LI.outlineVariant }}>
            {i + 1}
          </span>
          <BlockKindIcon kind={b.kind} />
          <span className="flex-1 text-xs" style={{ color: LI.onSurface }}>{b.label}</span>
          <span className="text-[10px] font-medium" style={{ color: LI.outlineVariant }}>{b.kind}</span>
        </div>
      ))}
      <div className="px-4 py-2.5" style={{ background: LI.surfaceLow, borderTop: blocks.length ? `1px solid ${LI.outlineVariant}` : undefined }}>
        <p className="text-[10px] text-center" style={{ color: LI.outlineVariant }}>
          Order is fixed — text → formulas → files
        </p>
      </div>
    </div>
  )
}

// ── V2: Drag-to-reorder block list ────────────────────────────────────────────
function BlockListDraggable({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (fn: (b: Block[]) => Block[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setOverId(id) }
  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return }
    setBlocks(prev => {
      const from = prev.findIndex(b => b.id === dragId)
      const to = prev.findIndex(b => b.id === targetId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setDragId(null); setOverId(null)
  }
  const onDragEnd = () => { setDragId(null); setOverId(null) }

  return (
    <div className="space-y-1.5">
      {blocks.map((b) => (
        <div key={b.id}
          draggable
          onDragStart={() => onDragStart(b.id)}
          onDragOver={e => onDragOver(e, b.id)}
          onDrop={() => onDrop(b.id)}
          onDragEnd={onDragEnd}
          className="flex cursor-grab items-center gap-3 rounded-xl border px-4 py-3 transition active:cursor-grabbing"
          style={{
            borderColor: overId === b.id ? LI.alumosPurple : LI.outlineVariant,
            background: dragId === b.id ? LI.purpleFaint : overId === b.id ? LI.purpleFaint : '#fff',
            opacity: dragId === b.id ? 0.5 : 1,
          }}>
          {/* Drag handle */}
          <span className="flex-shrink-0 cursor-grab select-none text-slate-300" style={{ fontSize: '14px', lineHeight: 1 }}>
            ⠿
          </span>
          <BlockKindIcon kind={b.kind} />
          <span className="flex-1 text-xs" style={{ color: LI.onSurface }}>{b.label}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: LI.surfaceLow, color: LI.onSurfaceVariant }}>{b.kind}</span>
        </div>
      ))}
      <AddBlockButton setBlocks={setBlocks} />
    </div>
  )
}

// ── V3: Up/down button reorder ────────────────────────────────────────────────
function BlockListButtons({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (fn: (b: Block[]) => Block[]) => void }) {
  const move = (i: number, dir: -1 | 1) => {
    setBlocks(prev => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  return (
    <div className="space-y-1.5">
      {blocks.map((b, i) => (
        <div key={b.id} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3" style={{ borderColor: LI.outlineVariant }}>
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: LI.alumosPurple + '80' }}>{i + 1}</span>
          <BlockKindIcon kind={b.kind} />
          <span className="flex-1 text-xs" style={{ color: LI.onSurface }}>{b.label}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: LI.surfaceLow, color: LI.onSurfaceVariant }}>{b.kind}</span>
          {/* Up/down */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[10px] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-20"
              style={{ color: LI.onSurfaceVariant }}>▲</button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === blocks.length - 1}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[10px] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-20"
              style={{ color: LI.onSurfaceVariant }}>▼</button>
          </div>
        </div>
      ))}
      <AddBlockButton setBlocks={setBlocks} />
    </div>
  )
}

function AddBlockButton({ setBlocks }: { setBlocks: (fn: (b: Block[]) => Block[]) => void }) {
  const [open, setOpen] = useState(false)
  const options: { kind: BlockKind; label: string; icon: React.ReactNode }[] = [
    { kind: 'text', label: 'Text block', icon: <EditIcon /> },
    { kind: 'math', label: 'Math formula', icon: <MathIcon /> },
    { kind: 'download', label: 'Download file', icon: <DownloadIcon /> },
  ]

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="w-full cursor-pointer rounded-xl border-2 border-dashed py-2.5 text-xs font-medium transition hover:border-purple-300 hover:text-purple-600"
        style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}>
        + Add block
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border bg-white shadow-lg" style={{ borderColor: LI.outlineVariant }}>
          {options.map(o => (
            <button key={o.kind}
              onClick={() => {
                setBlocks(b => [...b, { id: `${Date.now()}`, kind: o.kind, label: o.kind === 'text' ? 'New text block' : o.kind === 'math' ? 'New formula' : 'New file' }])
                setOpen(false)
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-xs transition hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl">
              <span className="flex h-4 w-4 items-center justify-center" style={{ color: LI.alumosPurple }}>{o.icon}</span>
              <span style={{ color: LI.onSurface }}>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BlockKindIcon({ kind }: { kind: BlockKind }) {
  const icons: Record<BlockKind, React.ReactNode> = { text: <EditIcon />, math: <MathIcon />, download: <DownloadIcon /> }
  return <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center" style={{ color: LI.alumosPurple + 'aa' }}>{icons[kind]}</span>
}

// ── Math tab ──────────────────────────────────────────────────────────────────
function MathTabContent({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (fn: (b: Block[]) => Block[]) => void }) {
  const [input, setInput] = useState('')
  const [rendered, setRendered] = useState('')

  useEffect(() => {
    if (!input.trim()) { setRendered(''); return }
    try { setRendered(katex.renderToString(input, { throwOnError: false, displayMode: true })) } catch { setRendered('') }
  }, [input])

  const mathBlocks = blocks.filter(b => b.kind === 'math')

  const save = () => {
    if (!input.trim()) return
    setBlocks(b => [...b, { id: `math-${Date.now()}`, kind: 'math', label: input.slice(0, 40) }])
    setInput('')
  }

  const EXAMPLES = [
    { label: 'Quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { label: 'Integral', latex: '\\int_0^\\infty e^{-x}\\,dx = 1' },
    { label: 'Sigma', latex: '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>Type LaTeX — students see it rendered with KaTeX.</p>
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>LaTeX</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={'e.g.  x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'} rows={3}
          className="w-full resize-none rounded-xl border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          style={{ borderColor: LI.outlineVariant, background: LI.surfaceLow, color: LI.onSurface }} />
      </div>
      <div className="min-h-[64px] rounded-xl border p-4 text-center" style={{ borderColor: LI.outlineVariant, background: '#fff' }}>
        {rendered ? <div dangerouslySetInnerHTML={{ __html: rendered }} /> : <p className="text-xs" style={{ color: LI.outlineVariant }}>Live preview…</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => <button key={ex.label} onClick={() => setInput(ex.latex)} className="cursor-pointer rounded-full border px-3 py-1 text-[11px] transition hover:opacity-70" style={{ borderColor: LI.alumosPurple + '40', color: LI.alumosPurple, background: LI.purpleFaint }}>{ex.label}</button>)}
      </div>
      <button onClick={save} disabled={!input.trim()} className="w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: LI.alumosPurple }}>
        Add to Assignment
      </button>
      {mathBlocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>Added</p>
          {mathBlocks.map((b, i) => {
            let html = ''
            try { html = katex.renderToString(b.label, { throwOnError: false, displayMode: true }) } catch {}
            return (
              <div key={b.id} className="flex items-start justify-between gap-2 rounded-xl border bg-white p-3" style={{ borderColor: LI.outlineVariant }}>
                <div dangerouslySetInnerHTML={{ __html: html }} className="flex-1 overflow-hidden text-sm" />
                <button onClick={() => setBlocks(bs => bs.filter(x => x.id !== b.id))} className="cursor-pointer flex-shrink-0 text-xs text-slate-400 hover:text-red-500">✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── PDF tab ───────────────────────────────────────────────────────────────────
function PdfTabContent({ resources, setRes }: { resources: Resources; setRes: (fn: (r: Resources) => Resources) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const addMock = (name: string) => setRes(r => ({ ...r, pdfFiles: [...r.pdfFiles, name] }))
  const remove = (i: number) => setRes(r => ({ ...r, pdfFiles: r.pdfFiles.filter((_, idx) => idx !== i) }))

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>AI context only — not shown to students. Lecture notes, readings, or rubrics.</p>
      <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); Array.from(e.dataTransfer.files).forEach(f => addMock(f.name)) }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition"
        style={{ borderColor: dragging ? LI.alumosPurple : LI.outlineVariant, background: dragging ? LI.purpleFaint : LI.surfaceLow }}>
        <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden" onChange={e => Array.from(e.target.files ?? []).forEach(f => addMock(f.name))} />
        <PdfIcon large />
        <div><p className="text-sm font-medium" style={{ color: LI.onSurface }}>Drop files or click to browse</p><p className="mt-0.5 text-xs" style={{ color: LI.onSurfaceVariant }}>PDF, DOCX, TXT</p></div>
        <button type="button" onClick={e => { e.stopPropagation(); addMock(`lecture_${resources.pdfFiles.length + 1}.pdf`) }} className="rounded-lg border px-3 py-1.5 text-xs transition hover:opacity-80" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}>Add mock file</button>
      </div>
      {resources.pdfFiles.length > 0 && (
        <ul className="space-y-1.5">
          {resources.pdfFiles.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3" style={{ borderColor: LI.outlineVariant }}>
              <div className="flex items-center gap-2.5"><PdfIcon /><span className="text-sm" style={{ color: LI.onSurface }}>{f}</span></div>
              <button onClick={() => remove(i)} className="cursor-pointer text-xs text-slate-400 hover:text-red-500">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Downloads tab ─────────────────────────────────────────────────────────────
function DownloadsTabContent({ resources, setRes, blocks, setBlocks }: {
  resources: Resources; setRes: (fn: (r: Resources) => Resources) => void
  blocks: Block[]; setBlocks: (fn: (b: Block[]) => Block[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const EXAMPLES = ['starter_code.py', 'data.csv', 'assignment_template.docx']
  const addFile = (name: string) => {
    setRes(r => ({ ...r, dlFiles: [...r.dlFiles, name] }))
    setBlocks(b => [...b, { id: `dl-${Date.now()}`, kind: 'download', label: name }])
  }
  const removeFile = (i: number, name: string) => {
    setRes(r => ({ ...r, dlFiles: r.dlFiles.filter((_, idx) => idx !== i) }))
    setBlocks(b => b.filter(x => x.label !== name || x.kind !== 'download'))
  }

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: LI.onSurfaceVariant }}>Visible to students — starter code, datasets, templates.</p>
      <div onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition hover:border-purple-300"
        style={{ borderColor: LI.outlineVariant, background: LI.surfaceLow }}>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => Array.from(e.target.files ?? []).forEach(f => addFile(f.name))} />
        <DownloadIcon large />
        <div><p className="text-sm font-medium" style={{ color: LI.onSurface }}>Click to upload student files</p></div>
        <button type="button" onClick={e => { e.stopPropagation(); addFile(EXAMPLES[resources.dlFiles.length % EXAMPLES.length]) }} className="rounded-lg border px-3 py-1.5 text-xs transition hover:opacity-80" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }}>Add mock file</button>
      </div>
      {resources.dlFiles.length > 0 && (
        <ul className="space-y-1.5">
          {resources.dlFiles.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3" style={{ borderColor: LI.outlineVariant }}>
              <div className="flex items-center gap-2.5"><DownloadIcon /><span className="text-sm" style={{ color: LI.onSurface }}>{f}</span></div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#dcfce7', color: '#166534' }}>visible to students</span>
                <button onClick={() => removeFile(i, f)} className="cursor-pointer text-xs text-slate-400 hover:text-red-500">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Student preview modal ─────────────────────────────────────────────────────
function StudentPreviewModal({ assignment, resources, blocks, onClose }: {
  assignment: Assignment; resources: Resources; blocks: Block[]; onClose: () => void
}) {
  const formattedDate = assignment.due ? new Date(assignment.due + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '90vh', border: `1px solid ${LI.outlineVariant}` }}>
        <div className="flex flex-shrink-0 items-center gap-2 rounded-t-2xl border-b px-4 py-3" style={{ background: '#f8f8f8', borderColor: LI.outlineVariant }}>
          <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" /></div>
          <div className="mx-auto flex items-center gap-2 rounded-md border bg-white px-3 py-1 text-xs text-slate-400" style={{ borderColor: LI.outlineVariant }}>
            alumos.app / assignment / {assignment.id}
          </div>
          <button onClick={onClose} className="cursor-pointer ml-auto text-xs text-slate-400 hover:text-slate-600">✕ Close</button>
        </div>
        <div className="flex-shrink-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest" style={{ background: LI.alumosPurple + '10', borderBottom: `1px solid ${LI.outlineVariant}`, color: LI.alumosPurple }}>
          Student View Preview — content in block order
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-4 flex items-center gap-1.5 text-xs" style={{ color: LI.onSurfaceVariant }}>
            <span>COMS 101</span><span>›</span><span>Week {assignment.week}</span><span>›</span><span>{assignment.title}</span>
          </div>
          <h1 className="mb-1 text-xl font-bold" style={{ color: LI.onSurface }}>{assignment.title}</h1>
          <div className="mb-6 flex items-center gap-4 text-xs" style={{ color: LI.onSurfaceVariant }}>
            <span>Due {formattedDate}</span><span>·</span><span>{assignment.points} points</span>
          </div>

          {/* Render blocks in order */}
          <div className="mb-6 space-y-4">
            {blocks.map((b, i) => {
              if (b.kind === 'text') {
                return (
                  <div key={b.id}>
                    <h2 className="mb-2 text-sm font-semibold" style={{ color: LI.onSurface }}>Instructions</h2>
                    <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ borderColor: LI.outlineVariant, color: LI.onSurfaceVariant }} dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
                  </div>
                )
              }
              if (b.kind === 'math') {
                let html = ''
                try { html = katex.renderToString(b.label.includes('\\') ? b.label : b.label, { throwOnError: false, displayMode: true }) } catch {}
                return (
                  <div key={b.id} className="rounded-xl border p-4 text-center" style={{ borderColor: LI.outlineVariant, background: '#fafafa' }}>
                    {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <p className="font-mono text-sm text-slate-500">{b.label}</p>}
                  </div>
                )
              }
              if (b.kind === 'download') {
                return (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: LI.outlineVariant }}>
                    <DownloadIcon /><span className="flex-1 text-sm" style={{ color: LI.onSurface }}>{b.label}</span>
                    <button className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: LI.purpleFaint, color: LI.alumosPurple }}>↓ Download</button>
                  </div>
                )
              }
              return null
            })}
          </div>

          <textarea placeholder="Write your response here…" rows={4} className="mb-4 w-full resize-none rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" style={{ borderColor: LI.outlineVariant }} />
          <button className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90" style={{ background: LI.alumosPurple }}>Submit Assignment</button>
        </div>
      </div>
    </div>
  )
}

// ── Toolbar helpers ───────────────────────────────────────────────────────────
function ToolbarBtn({ label, title, style: s, onClick }: { label: string; title: string; style?: React.CSSProperties; onClick: () => void }) {
  return (
    <button onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
      className="cursor-pointer rounded px-2 py-0.5 text-xs transition hover:bg-slate-100" style={{ color: LI.onSurface, ...s }}>
      {label}
    </button>
  )
}

// ── Variant switcher ──────────────────────────────────────────────────────────
function VariantBar({ current }: { current: Variant }) {
  const variants: { id: Variant; label: string }[] = [
    { id: '1', label: 'V1 — Fixed order' },
    { id: '2', label: 'V2 — Drag to reorder' },
    { id: '3', label: 'V3 — Button reorder' },
  ]
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl px-2 py-2 shadow-xl" style={{ background: '#1b1b1d', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="px-2 text-xs font-medium text-slate-400">Content order:</span>
        {variants.map(v => (
          <a key={v.id} href={`?v=${v.id}`}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition"
            style={current === v.id ? { background: AI_GRADIENT, color: '#fff' } : { color: '#a1a1aa', background: 'rgba(255,255,255,0.06)' }}>
            {v.label}
          </a>
        ))}
        <a href="/generate" className="ml-1 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:text-slate-300">← Real page</a>
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> }
function PdfIcon({ large }: { large?: boolean }) { const s = large ? 28 : 14; return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> }
function MathIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg> }
function DownloadIcon({ large }: { large?: boolean }) { const s = large ? 28 : 14; return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> }
function PreviewIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> }
