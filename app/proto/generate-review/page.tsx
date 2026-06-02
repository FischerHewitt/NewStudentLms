'use client'
// PROTOTYPE — throwaway. Delete once review-screen questions are answered.
// Question: What should the GenerateFlow review screen look like with 11 weeks
// populated correctly, and with the resource side panel in its various states?
//
// ?v=1  Full 11-module course, no panel (default)
// ?v=2  Panel open — Math tab, with KaTeX preview
// ?v=3  Panel open — Edit tab, showing inline math in instructions

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// ─── Sample data ─────────────────────────────────────────────────────────────

const COURSE_TITLE = 'MATH 241 — Calculus III'
const TERM = 'Fall 2026'
const SECTION = 'Section 02'
const DURATION_WEEKS = 11
const START_DATE = '2026-09-08'
const END_DATE = '2026-11-25'

const MODULES = Array.from({ length: 11 }, (_, i) => ({
  week: i + 1,
  title: [
    'Vectors and 3D Space',
    'Dot and Cross Products',
    'Lines, Planes, and Surfaces',
    'Vector Functions',
    'Multivariable Functions & Partial Derivatives',
    'Gradients and Directional Derivatives',
    'Optimization (Lagrange Multipliers)',
    'Double Integrals',
    'Triple Integrals',
    'Line Integrals',
    'Stokes\' and Divergence Theorem',
  ][i],
  assignments: [
    { title: 'Problem Set ' + (i + 1), due: `2026-0${Math.floor(9 + i * 0.9)}-${String(15 + (i % 14)).padStart(2, '0')}`, pts: 40 },
    ...(i % 3 === 0 ? [{ title: 'Quiz ' + Math.ceil((i + 1) / 3), due: `2026-0${Math.floor(9 + i * 0.9)}-${String(12 + (i % 14)).padStart(2, '0')}`, pts: 20 }] : []),
  ],
}))

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#F8FAFC',
  card: '#ffffff',
  border: '#E2E8F0',
  text: '#1e293b',
  muted: '#64748b',
  subtle: '#94a3b8',
  indigo: '#4F46E5',
  indigoBg: 'rgba(79,70,229,0.08)',
  purple: '#7C3AED',
  purpleBg: 'rgba(124,58,237,0.08)',
  amber: '#D97706',
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function MetadataRow() {
  return (
    <div style={{ marginBottom: 8 }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input
          readOnly
          defaultValue={TERM}
          style={inputStyle}
          placeholder="Term (e.g. Fall 2026)"
        />
        <input
          readOnly
          defaultValue={SECTION}
          style={{ ...inputStyle, width: 100 }}
          placeholder="Section"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Duration</span>
          <input
            readOnly
            defaultValue={String(DURATION_WEEKS)}
            style={{ ...inputStyle, width: 56, fontWeight: 700, color: C.indigo }}
          />
          <span style={{ fontSize: 12, color: C.muted }}>weeks</span>
          <input
            readOnly
            defaultValue="0"
            style={{ ...inputStyle, width: 44 }}
          />
          <span style={{ fontSize: 12, color: C.muted }}>days</span>
        </div>
      </div>
      {/* Row 2 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Start</span>
          <input readOnly defaultValue={START_DATE} type="date" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted }}>End</span>
          <input readOnly defaultValue={END_DATE} type="date" style={inputStyle} />
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  color: C.text,
  background: C.card,
  outline: 'none',
}

function AssignmentRow({ title, due, pts, active }: { title: string; due: string; pts: number; active?: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 120px 70px 90px',
      gap: 8, alignItems: 'center',
      padding: '10px 16px',
      background: active ? C.indigoBg : 'transparent',
      borderRadius: 8,
      transition: 'background 0.15s',
    }}>
      <input
        readOnly
        defaultValue={title}
        style={{ ...inputStyle, fontSize: 13, fontWeight: 500 }}
      />
      <input readOnly defaultValue={due} type="date" style={{ ...inputStyle, fontSize: 12 }} />
      <input
        readOnly
        defaultValue={String(pts)}
        style={{ ...inputStyle, width: '100%', fontSize: 12, textAlign: 'right' }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button style={{
          background: 'none', border: `1px solid ${C.border}`, borderRadius: 6,
          padding: '4px 10px', fontSize: 11, fontWeight: 600, color: C.muted, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          Advanced Edit ↗
        </button>
      </div>
    </div>
  )
}

function ModuleBlock({ week, title, assignments, openIdx }: {
  week: number; title: string;
  assignments: { title: string; due: string; pts: number }[];
  openIdx?: number
}) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: C.card, marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: '#fafbfc',
      }}>
        <span style={{
          background: C.indigoBg, color: C.indigo,
          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
        }}>Week {week}</span>
        <input
          readOnly defaultValue={title}
          style={{ ...inputStyle, flex: 1, fontWeight: 600 }}
        />
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.subtle, padding: '0 4px' }}>+</button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: C.subtle, padding: '0 4px' }}>✕</button>
      </div>
      {assignments.map((a, i) => (
        <AssignmentRow key={i} {...a} active={openIdx === i} />
      ))}
    </div>
  )
}

// ─── Resource Side Panel ───────────────────────────────────────────────────────

function SidePanel({ activeTab }: { activeTab: 'edit' | 'math' | 'pdf' | 'files' | 'preview' }) {
  const tabs: Array<typeof activeTab> = ['edit', 'math', 'pdf', 'files', 'preview']
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
      background: C.card, borderLeft: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
    }}>
      {/* Panel header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>Quadratic Solver Lab</p>
          <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Week 7 · 40 pts · Due Nov 3</p>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.muted }}>×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 12px', gap: 4 }}>
        {tabs.map(t => (
          <button key={t} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '10px 12px', fontSize: 12, fontWeight: 600,
            color: t === activeTab ? C.indigo : C.muted,
            borderBottom: t === activeTab ? `2px solid ${C.indigo}` : '2px solid transparent',
            textTransform: 'capitalize',
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* Tab body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {activeTab === 'math' && <MathTabBody />}
        {activeTab === 'edit' && <EditTabBody />}
        {(activeTab === 'pdf' || activeTab === 'files' || activeTab === 'preview') && (
          <div style={{ color: C.muted, fontSize: 13, paddingTop: 20, textAlign: 'center' }}>
            {activeTab === 'pdf' && 'Drop PDF or DOCX files here — AI context only, not shown to students.'}
            {activeTab === 'files' && 'Upload starter code, datasets, or templates visible to students.'}
            {activeTab === 'preview' && 'Opens a modal showing the student-facing view of this assignment.'}
          </div>
        )}
      </div>
    </div>
  )
}

function MathTabBody() {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        Add a formula
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Quadratic', 'Integral', 'Sigma'].map(label => (
          <button key={label} style={{
            border: `1px solid ${C.border}`, borderRadius: 6,
            padding: '4px 10px', fontSize: 11, background: C.card,
            color: C.muted, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>
      <textarea
        readOnly
        defaultValue="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
        style={{
          width: '100%', height: 56, borderRadius: 8,
          border: `1px solid ${C.border}`, padding: '8px 10px',
          fontSize: 13, fontFamily: 'monospace', resize: 'none',
          boxSizing: 'border-box', color: C.text,
        }}
      />
      <div style={{
        marginTop: 12, padding: 16, background: '#fafbfc',
        border: `1px solid ${C.border}`, borderRadius: 8, textAlign: 'center',
        fontSize: 18, color: C.text,
      }}>
        {/* KaTeX preview placeholder */}
        <em style={{ fontStyle: 'normal', fontSize: 20 }}>
          x = <sup>−b ± √(b²−4ac)</sup> / <sub>2a</sub>
        </em>
        <p style={{ fontSize: 11, color: C.muted, margin: '8px 0 0' }}>Live preview</p>
      </div>
      <button style={{
        marginTop: 12, width: '100%', padding: '9px',
        background: C.indigo, color: 'white', border: 'none',
        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      }}>
        Add formula block
      </button>

      <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 10px' }}>
        Content order
      </p>
      {[
        { kind: 'text', label: 'Instructions' },
        { kind: 'math', label: 'x = (−b ± √…) / 2a' },
      ].map((b, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', border: `1px solid ${C.border}`,
          borderRadius: 8, marginBottom: 6, background: C.card,
        }}>
          <span style={{ fontSize: 16, color: C.subtle, cursor: 'grab' }}>⠿</span>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: b.kind === 'math' ? C.indigo : C.muted,
            background: b.kind === 'math' ? C.indigoBg : '#f1f5f9',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
          }}>{b.kind}</span>
          <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: C.subtle }}>✕</button>
        </div>
      ))}
    </div>
  )
}

function EditTabBody() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={{
          border: `1px solid ${C.indigo}`, borderRadius: 6,
          padding: '4px 12px', fontSize: 12, fontWeight: 700,
          background: C.indigoBg, color: C.indigo, cursor: 'pointer',
        }}>Quick</button>
        <button style={{
          border: `1px solid ${C.border}`, borderRadius: 6,
          padding: '4px 12px', fontSize: 12, fontWeight: 600,
          background: 'transparent', color: C.muted, cursor: 'pointer',
        }}>Advanced</button>
      </div>
      <textarea
        readOnly
        defaultValue={"Solve the quadratic equation $ax^2 + bx + c = 0$ using the quadratic formula. Show all steps:\n\n1. Identify a, b, and c\n2. Substitute into $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$\n3. Simplify and report both roots\n\nSubmit as a PDF or typed response."}
        style={{
          width: '100%', height: 160, borderRadius: 8,
          border: `1px solid ${C.border}`, padding: '10px 12px',
          fontSize: 13, resize: 'none', lineHeight: 1.6,
          boxSizing: 'border-box', color: C.text,
        }}
      />
      <div style={{ marginTop: 12, background: '#fafbfc', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Student sees</p>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>
          Solve the quadratic equation <em>ax² + bx + c = 0</em> using the quadratic formula. Show all steps:
        </p>
        <ol style={{ fontSize: 13, color: C.text, lineHeight: 1.8, paddingLeft: 20, margin: '8px 0 0' }}>
          <li>Identify a, b, and c</li>
          <li>Substitute into the formula and simplify</li>
          <li>Report both roots</li>
        </ol>
      </div>
    </div>
  )
}

// ─── Variant switcher (floating bar) ─────────────────────────────────────────

function VariantBar({ current }: { current: string }) {
  const variants = [
    { v: '1', label: 'No panel' },
    { v: '2', label: 'Math tab' },
    { v: '3', label: 'Edit tab' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', borderRadius: 12, padding: '10px 16px',
      display: 'flex', gap: 8, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    }}>
      <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>VARIANT</span>
      {variants.map(({ v, label }) => (
        <a
          key={v}
          href={`?v=${v}`}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            textDecoration: 'none',
            background: current === v ? '#4F46E5' : 'rgba(255,255,255,0.08)',
            color: current === v ? 'white' : '#94a3b8',
            transition: 'background 0.15s',
          }}
        >
          {v} — {label}
        </a>
      ))}
    </div>
  )
}

// ─── Main prototype page ──────────────────────────────────────────────────────

function GenerateReviewProto() {
  const params = useSearchParams()
  const v = params.get('v') ?? '1'
  const panelOpen = v === '2' || v === '3'
  const activeTab = v === '2' ? 'math' : 'edit'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        maxWidth: 768, margin: '0 auto', padding: '24px 24px 120px',
        marginRight: panelOpen ? `${560 + 24}px` : 'auto',
        transition: 'margin-right 0.25s ease',
      }}>

        {/* Back / clear row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <button style={{ background: 'none', border: 'none', fontSize: 13, color: C.muted, cursor: 'pointer' }}>
            ← Back
          </button>
          <button style={{ background: 'none', border: 'none', fontSize: 12, color: C.muted, cursor: 'pointer' }}>
            Clear course
          </button>
        </div>

        {/* Course title + Save button */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <input
              readOnly
              defaultValue={COURSE_TITLE}
              style={{
                ...inputStyle, flex: 1, fontSize: 20, fontWeight: 700,
                padding: '8px 14px',
              }}
            />
            <button style={{
              background: C.indigo, color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
            }}>
              Save Course →
            </button>
          </div>
          <MetadataRow />
        </div>

        {/* Modules */}
        {MODULES.map((mod, mi) => (
          <ModuleBlock
            key={mi}
            week={mod.week}
            title={mod.title}
            assignments={mod.assignments}
            openIdx={panelOpen && mi === 6 ? 0 : undefined}
          />
        ))}

        {/* Add module */}
        <button style={{
          width: '100%', padding: '12px',
          border: `2px dashed ${C.border}`, borderRadius: 12,
          background: 'transparent', fontSize: 13, fontWeight: 600,
          color: C.muted, cursor: 'pointer', marginTop: 4,
        }}>
          + Add Module
        </button>
      </div>

      {/* Side panel */}
      {panelOpen && <SidePanel activeTab={activeTab as 'math' | 'edit'} />}

      <VariantBar current={v} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <GenerateReviewProto />
    </Suspense>
  )
}
