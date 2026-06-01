// PROTOTYPE — throwaway. Delete or absorb after design decision.
// Question: inline accordion form (A) vs full-page navigation (B) vs assignment-edit-style page (C)?
// Toggle with ?variant=a, ?variant=b, or ?variant=c. Floating bar switches between them.

'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const C = {
  surface: '#F8FAFC',
  card: '#ffffff',
  border: '#E2E8F0',
  text: '#1b1b1d',
  muted: '#64748b',
  purple: '#7C3AED',
  orange: '#F59E0B',
  green: '#10B981',
  surfaceLow: '#f6f3f5',
  outlineVariant: '#c6c6cd',
}
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const HERO_BG = 'linear-gradient(135deg, #1a0e2e 0%, #0e1830 100%)'

type Assignment = { id: string; title: string; dueDate: string; points: number; status: 'published' | 'draft' }
type Module = { id: string; week: number; title: string; assignments: Assignment[] }

const SEED_MODULES: Module[] = [
  {
    id: 'm1', week: 1, title: 'Chemistry, Cells, and Energy',
    assignments: [
      { id: 'a1', title: 'Connect Homework 1 – Scientific Method', dueDate: 'May 28', points: 5, status: 'published' },
      { id: 'a2', title: 'Lab 1 Notebook – Microscopy', dueDate: 'Jun 3', points: 10, status: 'published' },
    ],
  },
  {
    id: 'm2', week: 5, title: 'Genetics and Heredity',
    assignments: [
      { id: 'a3', title: 'Punnett Square Problem Set', dueDate: 'Jun 17', points: 15, status: 'published' },
    ],
  },
  {
    id: 'm3', week: 8, title: 'Evolution and Ecology',
    assignments: [],
  },
]

function AddAssignmentProto() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const raw = searchParams.get('variant')
  const variant: 'a' | 'b' | 'c' = raw === 'b' ? 'b' : raw === 'c' ? 'c' : 'a'

  const [modules, setModules] = useState<Module[]>(SEED_MODULES)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['m1']))
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [fullPageModuleId, setFullPageModuleId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', dueDate: '', points: '' })
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<{ description: string; points: string }[]>([])
  const [chatInput, setChatInput] = useState('')

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })

  const resetForm = () => { setForm({ title: '', dueDate: '', points: '' }); setCriteria([]) }

  const handleSave = (moduleId: string) => {
    if (!form.title.trim()) return
    const newA: Assignment = {
      id: `new-${Date.now()}`,
      title: form.title,
      dueDate: form.dueDate || '—',
      points: parseInt(form.points) || 10,
      status: 'draft',
    }
    setModules((prev) =>
      prev.map((m) => m.id === moduleId ? { ...m, assignments: [...m.assignments, newA] } : m)
    )
    setJustAdded(newA.id)
    setAddingTo(null)
    setFullPageModuleId(null)
    resetForm()
    setTimeout(() => setJustAdded(null), 2000)
  }

  // Variant B: "full page" is simulated as an overlay with its own form
  if (fullPageModuleId && variant === 'b') {
    const mod = modules.find((m) => m.id === fullPageModuleId)!
    return (
      <div style={{ background: C.surface, minHeight: '100vh' }}>
        {/* Simulated breadcrumb / nav */}
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setFullPageModuleId(null); resetForm() }}
            style={{ background: 'none', border: 'none', fontSize: 13, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            BIO 111 – General Biology
          </button>
          <span style={{ color: C.border }}>›</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>New Assignment</span>
        </div>

        <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 32px' }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 4px', fontWeight: 500 }}>
              Adding to: <strong style={{ color: C.text }}>Wk {mod.week} · {mod.title}</strong>
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>New Assignment</h1>
          </div>

          {/* Full form */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormField label="Assignment Title" required>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Essay on Photosynthesis"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={inputStyle}
              />
            </FormField>

            <FormField label="Instructions">
              <textarea
                rows={6}
                placeholder="Describe what students need to do…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Due Date">
                <input
                  type="text"
                  placeholder="e.g. Jun 15"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Points Possible">
                <input
                  type="number"
                  placeholder="10"
                  value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                  style={inputStyle}
                />
              </FormField>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleSave(fullPageModuleId)}
                style={{ padding: '10px 22px', background: C.purple, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Save as Draft
              </button>
              <button
                onClick={() => { setFullPageModuleId(null); resetForm() }}
                style={{ padding: '10px 16px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <VariantBar variant={variant} router={router} />
      </div>
    )
  }

  // Variant C: looks exactly like the Quick Edit assignment page, but blank for a new assignment
  if (fullPageModuleId && variant === 'c') {
    const mod = modules.find((m) => m.id === fullPageModuleId)!
    return (
      <div style={{ background: C.surface, minHeight: '100vh', padding: '32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header — mirrors TeacherAssignmentView header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: '#f0edef', color: C.muted, border: `1px solid ${C.border}` }}>
                  Draft
                </span>
                <span style={{ fontSize: 13, color: C.muted }}>Wk {mod.week} · {mod.title}</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: form.title ? C.text : C.muted, margin: 0, lineHeight: 1.2, fontStyle: form.title ? 'normal' : 'italic' }}>
                {form.title || 'New Assignment'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => { setFullPageModuleId(null); resetForm() }}
                style={{ padding: '8px 16px', border: `1px solid ${C.border}`, background: C.card, borderRadius: 8, fontSize: 13, fontWeight: 500, color: C.muted, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(fullPageModuleId)}
                disabled={!form.title.trim()}
                style={{ padding: '8px 18px', background: form.title.trim() ? C.purple : C.outlineVariant, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: form.title.trim() ? 'pointer' : 'not-allowed' }}
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Two-column grid — mirrors TeacherAssignmentView edit layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

            {/* LEFT: Core Settings + Rubric */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Core Settings */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: '0 0 18px' }}>Core Settings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                      Assignment Title <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Midterm Essay on Photosynthesis"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Description &amp; Prompt</label>
                      <button style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
                        Generate with AI
                      </button>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '6px 8px', display: 'flex', gap: 2 }}>
                        {['format_bold', 'format_italic', 'format_underlined', 'format_list_bulleted', 'link'].map((icon) => (
                          <button key={icon} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: C.muted, display: 'flex', borderRadius: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={7}
                        placeholder="Describe what students need to do. Be specific about length, format, and any required sources."
                        style={{ width: '100%', padding: 14, fontSize: 13, color: C.text, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>Points Possible</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={form.points}
                        onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>Due Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Jun 15"
                        value={form.dueDate}
                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rubric */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted }}>fact_check</span>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>Evaluation Rubric</p>
                  </div>
                  <button
                    onClick={() => setCriteria((prev) => [...prev, { description: '', points: '' }])}
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Add Criterion
                  </button>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {criteria.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px' }}>No rubric criteria yet.</p>
                      <button
                        onClick={() => setCriteria([{ description: '', points: '' }])}
                        style={{ fontSize: 13, fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        + Add first criterion
                      </button>
                    </div>
                  ) : (
                    criteria.map((cr, i) => (
                      <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="text"
                          placeholder="Criterion description"
                          value={cr.description}
                          onChange={(e) => setCriteria((prev) => prev.map((c, j) => j === i ? { ...c, description: e.target.value } : c))}
                          style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                        />
                        <input
                          type="number"
                          placeholder="pts"
                          value={cr.points}
                          onChange={(e) => setCriteria((prev) => prev.map((c, j) => j === i ? { ...c, points: e.target.value } : c))}
                          style={{ ...inputStyle, width: 64, fontSize: 13 }}
                        />
                        <button
                          onClick={() => setCriteria((prev) => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, lineHeight: 1, padding: 2 }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: AI Co-Pilot */}
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: AI_GRADIENT }} />
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple }}>smart_toy</span>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>AI Co-Pilot</p>
                  </div>
                </div>
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple, flexShrink: 0 }}>lightbulb</span>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                      Fill in a title and description, then ask me to suggest a rubric or refine the instructions.
                    </p>
                  </div>
                  <button style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: `${C.purple}1a`, color: C.purple, cursor: 'pointer' }}>
                    Generate Rubric with AI
                  </button>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: '0 0 12px' }}>Chat</p>
                    <div style={{ display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 99, padding: '8px 14px', gap: 8 }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask AI to help draft this assignment…"
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: C.text, outline: 'none' }}
                      />
                      <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.purple, display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <VariantBar variant={variant} router={router} />
      </div>
    )
  }

  return (
    <div style={{ background: C.surface, minHeight: '100vh' }}>
      {/* Dark hero */}
      <div style={{ background: HERO_BG, padding: '24px 32px 28px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>← Courses</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.2)', color: '#4ade80' }}>Published</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Spring 2026</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', margin: 0 }}>BIO 111 – General Biology</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>Dr. Sarah Chen</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: -20, marginBottom: 28 }}>
          {[['group','5','Students'],['list_alt','6','Assignments'],['assignment_turned_in','4','Submitted'],['pending_actions','2','Pending']].map(([icon, val, label]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.outlineVariant}`, borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple }}>{icon}</span>
              <p style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '6px 0 0', fontFamily: 'var(--font-hanken,system-ui)' }}>{val}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Variant label */}
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>Curriculum</p>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: `${VARIANT_COLORS[variant]}18`, color: VARIANT_COLORS[variant] }}>
            {VARIANT_LABELS[variant]}
          </span>
        </div>

        {/* Module accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {modules.map((mod) => {
            const isOpen = expanded.has(mod.id)
            const isAddingHere = addingTo === mod.id && variant === 'a'

            return (
              <div key={mod.id} style={{ background: C.card, border: `1px solid ${C.outlineVariant}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Module header */}
                <button
                  onClick={() => toggle(mod.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${C.purple}15`, color: C.purple, flexShrink: 0 }}>
                    Wk {mod.week}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{mod.title}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{mod.assignments.length} assignments</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>expand_more</span>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}` }}>
                    {/* Assignment rows */}
                    {mod.assignments.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
                          borderBottom: `1px solid ${C.surfaceLow}`,
                          background: justAdded === a.id ? 'rgba(16,185,129,0.05)' : 'transparent',
                          transition: 'background 0.4s',
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: a.status === 'published' ? C.green : C.outlineVariant }} />
                        <span style={{ flex: 1, fontSize: 13, color: C.text, fontWeight: 500 }}>{a.title}</span>
                        {justAdded === a.id && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 10 }}>Saved ✓</span>
                        )}
                        {a.status === 'draft' && justAdded !== a.id && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, background: C.surfaceLow, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Draft</span>
                        )}
                        <span style={{ fontSize: 12, color: C.muted }}>{a.dueDate}</span>
                        <span style={{ fontSize: 12, color: C.muted, width: 36, textAlign: 'right' }}>{a.points}pt</span>
                        <span style={{ fontSize: 11, color: C.muted, width: 80, textAlign: 'right' }}>No submissions</span>
                      </div>
                    ))}

                    {/* VARIANT A — inline form */}
                    {variant === 'a' && isAddingHere && (
                      <div style={{ padding: '14px 18px', background: 'rgba(124,58,237,0.03)', borderBottom: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.purple, margin: '0 0 12px' }}>New Assignment</p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div style={{ flex: '2 1 200px' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Title <span style={{ color: 'red' }}>*</span></label>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Assignment title"
                              value={form.title}
                              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(mod.id); if (e.key === 'Escape') { setAddingTo(null); resetForm() } }}
                              style={{ ...inputStyle, fontSize: 13 }}
                            />
                          </div>
                          <div style={{ flex: '1 1 110px' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Due Date</label>
                            <input
                              type="text"
                              placeholder="e.g. Jun 15"
                              value={form.dueDate}
                              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                              style={{ ...inputStyle, fontSize: 13 }}
                            />
                          </div>
                          <div style={{ flex: '0 1 80px' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Points</label>
                            <input
                              type="number"
                              placeholder="10"
                              value={form.points}
                              onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                              style={{ ...inputStyle, fontSize: 13 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 6, paddingBottom: 1 }}>
                            <button
                              onClick={() => handleSave(mod.id)}
                              disabled={!form.title.trim()}
                              style={{ padding: '8px 16px', background: form.title.trim() ? C.purple : C.outlineVariant, color: 'white', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: form.title.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
                            >
                              Save Draft
                            </button>
                            <button
                              onClick={() => { setAddingTo(null); resetForm() }}
                              style={{ padding: '8px 12px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: 11, color: C.muted, margin: '8px 0 0' }}>Press Enter to save · Escape to cancel · Add more details from the assignment page</p>
                      </div>
                    )}

                    {/* Add Assignment button */}
                    {!(variant === 'a' && isAddingHere) && (
                      <div style={{ padding: '10px 18px' }}>
                        <button
                          onClick={() => {
                            if (variant === 'a') {
                              setAddingTo(mod.id)
                            } else {
                              setFullPageModuleId(mod.id)
                              resetForm()
                            }
                            // variant 'c' uses fullPageModuleId too — handled by its own render block
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: C.purple, cursor: 'pointer', padding: '4px 0' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                          Add Assignment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <VariantBar variant={variant} router={router} />
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
  border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1b1b1d',
  outline: 'none', boxSizing: 'border-box',
}

const VARIANT_LABELS: Record<string, string> = {
  a: 'A — Inline',
  b: 'B — Full page',
  c: 'C — Edit style',
}
const VARIANT_COLORS: Record<string, string> = {
  a: C.purple,
  b: C.orange,
  c: C.green,
}

function VariantBar({ variant, router }: { variant: string; router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1a0e2e', borderRadius: 14, padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 50,
    }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginRight: 4 }}>Prototype:</span>
      {(['a', 'b', 'c'] as const).map((v) => (
        <button
          key={v}
          onClick={() => router.replace(`?variant=${v}`)}
          style={{
            padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
            background: variant === v ? VARIANT_COLORS[v] : 'rgba(255,255,255,0.08)',
            color: variant === v ? 'white' : 'rgba(255,255,255,0.5)',
          }}
        >
          {VARIANT_LABELS[v]}
        </button>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <AddAssignmentProto />
    </Suspense>
  )
}
