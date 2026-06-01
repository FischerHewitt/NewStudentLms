// PROTOTYPE — throwaway. Delete or absorb after design decision.
// Question: what should the grading page look like?
// Variant A: per-criterion score rows + quick feedback chips
// Variant B: criterion cards with full/partial/none buttons + student context panel
// Variant C: focus mode — one criterion at a time, step-by-step
// Toggle with ?v=a / ?v=b / ?v=c

'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// ── Palette ──────────────────────────────────────────────────────────────────
const K = {
  bg: '#F8FAFC', card: '#fff', border: '#E2E8F0',
  text: '#1b1b1d', muted: '#64748b',
  purple: '#7C3AED', orange: '#F59E0B', green: '#10B981', red: '#EF4444',
  indigo: '#4F46E5',
}
const GRAD = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

// ── Mock data ────────────────────────────────────────────────────────────────
const CRITERIA = [
  { id: 'thesis',   label: 'Thesis Clarity',  max: 25, ai: 20, desc: 'Strength and focus of the central argument relative to the Modernist prompt.' },
  { id: 'evidence', label: 'Textual Evidence', max: 40, ai: 32, desc: 'Effective integration and analysis of specific primary source quotes.' },
  { id: 'format',   label: 'Formatting',       max: 15, ai: 12, desc: 'Adherence to MLA guidelines and proper citation of sources.' },
]
const TOTAL_MAX = CRITERIA.reduce((s, c) => s + c.max, 0)
const AI_FEEDBACK = `Alex demonstrates a solid understanding of Modernist themes, particularly the tension between tradition and rupture. The thesis in paragraph one is clear but would benefit from a sharper claim about *why* fragmentation was the defining feature of the period, not just that it was. The textual evidence is well chosen — the Eliot and Woolf quotes anchor the argument effectively. MLA formatting is mostly correct; citations on pages 3 and 4 are missing page numbers.`
const SUBMISSION = `The Modernist period fundamentally altered the trajectory of literary form. Where Victorian novelists trusted in coherent narrative and moral resolution, the Modernists embraced fragmentation, interiority, and the dissolution of stable meaning. T.S. Eliot's "The Waste Land" crystallizes this shift: "These fragments I have shored against my ruins" (Eliot 430). The line enacts its own argument — a desperate accumulation of cultural detritus in place of unified meaning.

Virginia Woolf pushed this further in her stream-of-consciousness technique. In "Mrs. Dalloway," Clarissa's interior monologue moves fluidly across time without the mediation of an omniscient narrator: "She had a perpetual sense, as she watched the taxicabs, of being out, out, far out to sea and alone" (Woolf 8). Woolf denies the reader a stable vantage point, implicating us in the very subjectivity she describes.

The structural evolution of poetry during the Modernist period reflects a broader epistemological crisis. If the self could no longer be trusted as a coherent perceiver, the lyric poem — traditionally a vehicle for unified personal expression — had to be reimagined. The breaking of traditional forms and the use of fragmented narratives became not stylistic choices but philosophical necessities. This essay argues that formal fragmentation in Modernist literature is not a symptom of cultural decay but a deliberate epistemological strategy for representing a world in which unified meaning had become untenable.`

const QUICK_CHIPS: Record<string, string[]> = {
  thesis:   ['Strong thesis ✓', 'Needs sharper claim', 'Too broad', 'Good but underdeveloped'],
  evidence: ['Well-integrated quotes', 'Quotes but no analysis', 'Needs more evidence', 'Excellent close reading'],
  format:   ['MLA correct ✓', 'Missing page numbers', 'Works Cited incomplete', 'Formatting mostly fine'],
}

// ── Shared: variant bar ───────────────────────────────────────────────────────
function Bar({ v, go }: { v: string; go: (x: string) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a0e2e', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 99 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>Prototype:</span>
      {[['a','A — Row scoring'],['b','B — Card + context'],['c','C — Focus mode']].map(([id, label]) => (
        <button key={id} onClick={() => go(id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: v === id ? K.purple : 'rgba(255,255,255,0.08)', color: v === id ? 'white' : 'rgba(255,255,255,0.5)' }}>
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Header shared ─────────────────────────────────────────────────────────────
function Header({ total, maxTotal, published, onPublish }: { total: number; maxTotal: number; published: boolean; onPublish: () => void }) {
  return (
    <div style={{ background: '#1a0e2e', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>← BIO 111 · Midterm Essay: Modernism</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0 }}>Grading: Alex Rivera</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 1px' }}>Total Score</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>
            {total}<span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/{maxTotal}</span>
          </p>
        </div>
        <button
          onClick={onPublish}
          style={{ padding: '10px 20px', background: published ? K.green : GRAD, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', opacity: published ? 0.7 : 1 }}
        >
          {published ? '✓ Published' : 'Publish Grade →'}
        </button>
      </div>
    </div>
  )
}

// ── Submission panel ──────────────────────────────────────────────────────────
function SubmissionPanel({ highlighted }: { highlighted?: string | null }) {
  return (
    <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${K.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.muted, margin: 0 }}>Student Submission</p>
        <span style={{ fontSize: 11, color: K.muted }}>~380 words · submitted Jun 1</span>
      </div>
      <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
        {SUBMISSION.split('\n\n').map((para, i) => (
          <p key={i} style={{ fontSize: 13, lineHeight: 1.75, color: K.text, marginBottom: 16 }}>
            {highlighted
              ? para.split(highlighted).map((part, j, arr) => j < arr.length - 1
                  ? <span key={j}>{part}<mark style={{ background: 'rgba(124,58,237,0.18)', borderRadius: 3, padding: '0 2px' }}>{highlighted}</mark></span>
                  : part)
              : para}
          </p>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT A — per-criterion rows + quick chips
// ─────────────────────────────────────────────────────────────────────────────
function VariantA({ onPublish, published }: { onPublish: () => void; published: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(CRITERIA.map(c => [c.id, c.ai])))
  const [feedback, setFeedback] = useState(AI_FEEDBACK)
  const [chips, setChips] = useState<Record<string, string[]>>({})
  const total = Object.values(scores).reduce((s, v) => s + v, 0)

  const toggleChip = (cid: string, chip: string) => {
    setChips(p => {
      const cur = p[cid] ?? []
      const next = cur.includes(chip) ? cur.filter(c => c !== chip) : [...cur, chip]
      // Also append to feedback
      if (!cur.includes(chip)) setFeedback(f => f ? f + `\n\n[${CRITERIA.find(c=>c.id===cid)!.label}] ${chip}` : `[${CRITERIA.find(c=>c.id===cid)!.label}] ${chip}`)
      return { ...p, [cid]: next }
    })
  }

  return (
    <div style={{ background: K.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header total={total} maxTotal={TOTAL_MAX} published={published} onPublish={onPublish} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, padding: '20px 24px 80px', flex: 1, alignItems: 'start' }}>

        <SubmissionPanel />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* AI suggestion banner */}
          <div style={{ background: `${K.purple}0d`, border: `1px solid ${K.purple}33`, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: K.purple }}>auto_awesome</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: K.purple, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Suggested · {CRITERIA.reduce((s,c)=>s+c.ai,0)}/{TOTAL_MAX}</span>
            </div>
            <p style={{ fontSize: 12, color: K.muted, margin: 0, lineHeight: 1.5 }}>{AI_FEEDBACK.slice(0, 120)}…</p>
          </div>

          {/* Per-criterion rows */}
          <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.muted, margin: 0 }}>Rubric Scoring</p>
            </div>
            {CRITERIA.map((c, i) => (
              <div key={c.id} style={{ borderBottom: i < CRITERIA.length - 1 ? `1px solid ${K.border}` : undefined, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: K.text, margin: '0 0 2px' }}>{c.label}</p>
                    <p style={{ fontSize: 11, color: K.muted, margin: 0 }}>{c.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ fontSize: 11, color: K.muted }}>AI: {c.ai}</span>
                    <div style={{ width: 1, height: 14, background: K.border }} />
                    <input
                      type="number" min={0} max={c.max}
                      value={scores[c.id]}
                      onChange={e => setScores(p => ({ ...p, [c.id]: Math.min(c.max, Math.max(0, Number(e.target.value))) }))}
                      style={{ width: 52, padding: '4px 8px', borderRadius: 6, border: `1px solid ${K.border}`, background: K.bg, textAlign: 'center', fontSize: 14, fontWeight: 700, color: K.text, outline: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: K.muted }}>/{c.max}</span>
                  </div>
                </div>
                {/* Score bar */}
                <div style={{ height: 4, background: K.border, borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(scores[c.id]/c.max)*100}%`, background: GRAD, borderRadius: 99, transition: 'width 0.2s' }} />
                </div>
                {/* Quick chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK_CHIPS[c.id].map(chip => {
                    const active = (chips[c.id] ?? []).includes(chip)
                    return (
                      <button key={chip} onClick={() => toggleChip(c.id, chip)} style={{ padding: '3px 10px', borderRadius: 99, border: `1px solid ${active ? K.purple : K.border}`, background: active ? `${K.purple}10` : 'transparent', fontSize: 11, fontWeight: 500, color: active ? K.purple : K.muted, cursor: 'pointer' }}>
                        {chip}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${K.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.muted, margin: 0 }}>Feedback to Student</p>
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={6} style={{ width: '100%', padding: 14, fontSize: 13, color: K.text, border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>

          {/* Bottom nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: 12, color: K.muted }}>1 of 5 submissions</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '9px 18px', border: `1px solid ${K.border}`, background: K.card, borderRadius: 8, fontSize: 13, fontWeight: 500, color: K.muted, cursor: 'pointer' }}>
                ← Prev
              </button>
              <button onClick={onPublish} style={{ padding: '9px 18px', background: K.green, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                {published ? '✓ Published' : 'Publish & Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT B — criterion cards + student context sidebar
// ─────────────────────────────────────────────────────────────────────────────
function VariantB({ onPublish, published }: { onPublish: () => void; published: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(CRITERIA.map(c => [c.id, c.ai])))
  const [feedback, setFeedback] = useState(AI_FEEDBACK)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const total = Object.values(scores).reduce((s, v) => s + v, 0)

  const quickSet = (id: string, max: number, level: 'full' | 'partial' | 'none') => {
    const val = level === 'full' ? max : level === 'partial' ? Math.round(max * 0.6) : 0
    setScores(p => ({ ...p, [id]: val }))
  }

  return (
    <div style={{ background: K.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header total={total} maxTotal={TOTAL_MAX} published={published} onPublish={onPublish} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px 260px', gap: 16, padding: '20px 24px 80px', flex: 1, alignItems: 'start' }}>

        <SubmissionPanel />

        {/* Center: criterion cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CRITERIA.map(c => {
            const pct = Math.round((scores[c.id] / c.max) * 100)
            const color = pct >= 80 ? K.green : pct >= 50 ? K.orange : K.red
            return (
              <div key={c.id} style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: color }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: K.text, margin: '0 0 2px' }}>{c.label}</p>
                      <p style={{ fontSize: 11, color: K.muted, margin: 0 }}>Max {c.max} pts · AI suggested {c.ai}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color }}>{scores[c.id]}</span>
                      <span style={{ fontSize: 13, color: K.muted }}>/{c.max}</span>
                    </div>
                  </div>

                  {/* Quick select buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                    {[['full','Full credit','✓'],['partial','Partial','~'],['none','No credit','✕']].map(([level, label, icon]) => {
                      const isActive = level === 'full' ? scores[c.id] === c.max : level === 'none' ? scores[c.id] === 0 : scores[c.id] > 0 && scores[c.id] < c.max
                      const bg = level === 'full' ? K.green : level === 'partial' ? K.orange : K.red
                      return (
                        <button key={level} onClick={() => quickSet(c.id, c.max, level as 'full'|'partial'|'none')} style={{ padding: '7px 0', borderRadius: 7, border: `1px solid ${isActive ? bg : K.border}`, background: isActive ? `${bg}15` : 'transparent', fontSize: 12, fontWeight: 600, color: isActive ? bg : K.muted, cursor: 'pointer' }}>
                          {icon} {label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Fine-tune slider */}
                  <input type="range" min={0} max={c.max} value={scores[c.id]}
                    onChange={e => setScores(p => ({ ...p, [c.id]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: color, marginBottom: 8 }}
                  />

                  {/* Per-criterion note */}
                  <input type="text" placeholder="Add a note for this criterion…" value={notes[c.id] ?? ''} onChange={e => setNotes(p => ({ ...p, [c.id]: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${K.border}`, background: K.bg, fontSize: 12, color: K.text, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )
          })}

          {/* Overall feedback */}
          <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${K.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.muted, margin: 0 }}>Overall Feedback</p>
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} style={{ width: '100%', padding: 12, fontSize: 12, color: K.text, border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>
        </div>

        {/* Right: student context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Student card */}
          <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: K.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>AR</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: K.text, margin: 0 }}>Alex Rivera</p>
                <p style={{ fontSize: 11, color: K.muted, margin: 0 }}>Submitted Jun 1, 11:48 PM</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Class avg','71%'],['AI coach uses','3 of 5'],['Word count','~380'],['Previous grade','A-']].map(([label, val]) => (
                <div key={label} style={{ background: K.bg, borderRadius: 8, padding: '8px 10px' }}>
                  <p style={{ fontSize: 10, color: K.muted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: K.text, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI full analysis */}
          <div style={{ background: `${K.purple}08`, border: `1px solid ${K.purple}25`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: K.purple }}>auto_awesome</span>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.purple, margin: 0 }}>AI Analysis</p>
            </div>
            <p style={{ fontSize: 12, color: K.muted, margin: 0, lineHeight: 1.6 }}>{AI_FEEDBACK}</p>
          </div>

          {/* Similarity flag */}
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: K.red }}>content_copy</span>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.red, margin: 0 }}>Similarity Check</p>
            </div>
            <p style={{ fontSize: 12, color: K.muted, margin: '0 0 6px' }}>12% overlap with Jordan Lee&apos;s submission — paragraph 2.</p>
            <button style={{ fontSize: 11, fontWeight: 600, color: K.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View comparison →</button>
          </div>

          {/* Navigation */}
          <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ background: 'none', border: 'none', fontSize: 13, color: K.muted, cursor: 'pointer' }}>← Prev</button>
            <span style={{ fontSize: 12, color: K.muted }}>1 of 5 submissions</span>
            <button style={{ background: 'none', border: 'none', fontSize: 13, color: K.purple, fontWeight: 600, cursor: 'pointer' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — focus mode: one criterion at a time
// ─────────────────────────────────────────────────────────────────────────────
function VariantC({ onPublish, published }: { onPublish: () => void; published: boolean }) {
  const [step, setStep] = useState(0) // 0..CRITERIA.length = final review
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(CRITERIA.map(c => [c.id, c.ai])))
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState(AI_FEEDBACK)
  const total = Object.values(scores).reduce((s, v) => s + v, 0)
  const isFinal = step === CRITERIA.length

  const c = !isFinal ? CRITERIA[step] : null
  const pct = c ? Math.round((scores[c.id] / c.max) * 100) : 0
  const barColor = pct >= 80 ? K.green : pct >= 50 ? K.orange : K.red

  // highlight keyword per criterion
  const highlights: Record<string, string> = { thesis: 'argument', evidence: 'Eliot', format: 'MLA' }

  return (
    <div style={{ background: K.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header total={total} maxTotal={TOTAL_MAX} published={published} onPublish={onPublish} />

      {/* Step progress bar */}
      <div style={{ background: K.card, borderBottom: `1px solid ${K.border}`, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {CRITERIA.map((cr, i) => (
          <button key={cr.id} onClick={() => setStep(i)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8, background: step === i ? `${K.purple}12` : 'transparent' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${step > i ? K.green : step === i ? K.purple : K.border}`, background: step > i ? K.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: step > i ? 'white' : step === i ? K.purple : K.muted }}>
              {step > i ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: step === i ? 700 : 400, color: step === i ? K.purple : K.muted }}>{cr.label}</span>
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: K.border, margin: '0 4px' }} />
        <button onClick={() => setStep(CRITERIA.length)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: isFinal ? `${K.green}12` : 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isFinal ? K.green : K.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isFinal ? K.green : K.muted }}>✓</div>
          <span style={{ fontSize: 12, fontWeight: isFinal ? 700 : 400, color: isFinal ? K.green : K.muted }}>Review &amp; Publish</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, padding: '20px 24px 80px', flex: 1, alignItems: 'start' }}>
        <SubmissionPanel highlighted={c ? (highlights[c.id] ?? null) : null} />

        {isFinal ? (
          /* Final review panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${K.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: K.text, margin: 0 }}>Score Summary</p>
              </div>
              {CRITERIA.map(cr => (
                <div key={cr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${K.border}` }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: K.text, margin: '0 0 1px' }}>{cr.label}</p>
                    {notes[cr.id] && <p style={{ fontSize: 11, color: K.muted, margin: 0 }}>{notes[cr.id]}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: K.border, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(scores[cr.id]/cr.max)*100}%`, background: scores[cr.id]/cr.max >= 0.8 ? K.green : scores[cr.id]/cr.max >= 0.5 ? K.orange : K.red, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: K.text, width: 60, textAlign: 'right' }}>{scores[cr.id]}/{cr.max}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: K.bg }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: K.text }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: K.purple }}>{total}/{TOTAL_MAX}</span>
              </div>
            </div>

            <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${K.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: K.muted, margin: 0 }}>Overall Feedback</p>
              </div>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={6} style={{ width: '100%', padding: 14, fontSize: 13, color: K.text, border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
            </div>

            <button onClick={onPublish} style={{ padding: '13px', background: K.green, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
              {published ? '✓ Grade Published' : 'Publish Grade →'}
            </button>
          </div>
        ) : c ? (
          /* Per-criterion focus panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 4, background: barColor }} />
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: K.text, margin: '0 0 4px' }}>{c.label}</p>
                    <p style={{ fontSize: 13, color: K.muted, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                  </div>
                </div>

                {/* Big score display */}
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 56, fontWeight: 900, color: barColor, lineHeight: 1 }}>{scores[c.id]}</div>
                  <div style={{ fontSize: 18, color: K.muted, marginTop: 4 }}>out of {c.max}</div>
                  <div style={{ fontSize: 13, color: K.muted, marginTop: 2 }}>AI suggested: {c.ai}</div>
                </div>

                {/* Slider */}
                <input type="range" min={0} max={c.max} value={scores[c.id]}
                  onChange={e => setScores(p => ({ ...p, [c.id]: Number(e.target.value) }))}
                  style={{ width: '100%', height: 8, accentColor: barColor, marginBottom: 14 }}
                />

                {/* Quick buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[['0','No credit',K.red],[String(Math.round(c.max*0.6)),'Partial',K.orange],[String(c.max),'Full credit',K.green]].map(([val, label, col]) => (
                    <button key={val} onClick={() => setScores(p => ({ ...p, [c.id]: Number(val) }))} style={{ padding: '10px 0', borderRadius: 8, border: `1.5px solid ${scores[c.id] === Number(val) ? col : K.border}`, background: scores[c.id] === Number(val) ? `${col}15` : 'transparent', fontSize: 12, fontWeight: 700, color: scores[c.id] === Number(val) ? col : K.muted, cursor: 'pointer' }}>
                      {val}pt<br /><span style={{ fontWeight: 400 }}>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Fine input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: K.muted, whiteSpace: 'nowrap' }}>Exact score:</label>
                  <input type="number" min={0} max={c.max} value={scores[c.id]}
                    onChange={e => setScores(p => ({ ...p, [c.id]: Math.min(c.max, Math.max(0, Number(e.target.value))) }))}
                    style={{ width: 64, padding: '6px 10px', borderRadius: 8, border: `1px solid ${K.border}`, textAlign: 'center', fontSize: 15, fontWeight: 700, color: K.text, outline: 'none' }}
                  />
                  <span style={{ fontSize: 13, color: K.muted }}>/ {c.max}</span>
                </div>

                {/* Note */}
                <textarea placeholder={`Note about ${c.label}…`} value={notes[c.id] ?? ''} onChange={e => setNotes(p => ({ ...p, [c.id]: e.target.value }))} rows={3} style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${K.border}`, background: K.bg, fontSize: 12, color: K.text, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', gap: 10 }}>
              {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '11px', border: `1px solid ${K.border}`, background: K.card, borderRadius: 9, fontSize: 13, fontWeight: 600, color: K.muted, cursor: 'pointer' }}>← Previous</button>}
              <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '11px', background: K.purple, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                {step < CRITERIA.length - 1 ? `Next: ${CRITERIA[step + 1].label} →` : 'Review & Publish →'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
function Proto() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const raw = searchParams.get('v')
  const v: 'a' | 'b' | 'c' = raw === 'b' ? 'b' : raw === 'c' ? 'c' : 'a'
  const [published, setPublished] = useState(false)

  const go = (next: string) => { setPublished(false); router.replace(`?v=${next}`) }

  return (
    <>
      {v === 'a' && <VariantA onPublish={() => setPublished(true)} published={published} />}
      {v === 'b' && <VariantB onPublish={() => setPublished(true)} published={published} />}
      {v === 'c' && <VariantC onPublish={() => setPublished(true)} published={published} />}
      <Bar v={v} go={go} />
    </>
  )
}

export default function Page() {
  return <Suspense><Proto /></Suspense>
}
