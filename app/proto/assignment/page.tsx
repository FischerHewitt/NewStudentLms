/**
 * PROTOTYPE — Assignment page redesign
 * Question: What should the assignment page look like for teachers?
 *           How should "Grader" vs "SpeedGrader" be presented?
 * Delete or absorb after the question is answered.
 *
 * Usage: /proto/assignment?v=a  (variants: a, b, c)
 */
'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

// ── Mock data ────────────────────────────────────────────────────────────────

const ASSIGNMENT = {
  title: 'Midterm 1 Reflection',
  points: 50,
  due: '2026-03-14',
  instructions:
    'Write a 300–500 word reflection on your performance in Midterm 1. Address what concepts you found most challenging, what strategies helped you, and what you will do differently for Midterm 2.',
  rubric: [
    { description: 'Identifies specific challenging concepts', points: 15 },
    { description: 'Reflects on study strategies used', points: 15 },
    { description: 'Proposes concrete improvement actions', points: 10 },
    { description: 'Writing is clear and on-topic', points: 10 },
  ],
}

const SUBMISSIONS = [
  {
    id: 'sub-1',
    student: 'Alex Rivera',
    submitted: '2026-03-12T14:23:00Z',
    status: 'submitted' as const,
    body: 'I found integration by parts to be the most challenging topic. During the midterm I kept getting confused about when to apply the technique vs substitution. Going forward I plan to do 10 extra practice problems each week focusing specifically on recognising which technique to use. I also think my time management could be better — I spent too long on problem 3 and had to rush the last two.',
    aiScore: null,
    aiFeedback: null,
    finalScore: null,
  },
  {
    id: 'sub-2',
    student: 'Jordan Lee',
    submitted: '2026-03-11T09:05:00Z',
    status: 'graded' as const,
    body: 'The sequences unit was really hard for me. I kept mixing up convergence tests. My study strategy was to reread the textbook which I now realise was not effective. Next time I will try active recall and work more practice problems.',
    aiScore: 42,
    aiFeedback: 'Good reflection. Identifies specific challenges with convergence tests. Could go deeper on concrete improvement strategies.',
    finalScore: 44,
  },
  {
    id: 'sub-3',
    student: 'Maya Patel',
    submitted: '2026-03-13T18:40:00Z',
    status: 'submitted' as const,
    body: 'Parametric equations were difficult. I understand them conceptually but struggle under time pressure. I will practice timed problems and review my notes more carefully before exams.',
    aiScore: null,
    aiFeedback: null,
    finalScore: null,
  },
]

type Submission = typeof SUBMISSIONS[0]

// ── Root ─────────────────────────────────────────────────────────────────────

export default function AssignmentProto() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}

function Inner() {
  const params = useSearchParams()
  const variant = (params.get('v') ?? 'a') as 'a' | 'b' | 'c'

  return (
    <div className="min-h-screen bg-slate-50">
      {variant === 'a' && <VariantA />}
      {variant === 'b' && <VariantB />}
      {variant === 'c' && <VariantC />}
      <VariantSwitcher current={variant} />
    </div>
  )
}

// ── Variant A — Split panel (sidebar grader) ─────────────────────────────────
// Assignment info + submission list on the left; inline grading panel on the right.

function VariantA() {
  const [selected, setSelected] = useState<Submission | null>(SUBMISSIONS[0])
  const [score, setScore] = useState(selected?.aiScore ?? 0)
  const [feedback, setFeedback] = useState(selected?.aiFeedback ?? '')
  const [aiRunning, setAiRunning] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)

  const select = (sub: Submission) => {
    setSelected(sub)
    setScore(sub.finalScore ?? sub.aiScore ?? 0)
    setFeedback(sub.aiFeedback ?? '')
  }

  const fakeAI = () => {
    setAiRunning(true)
    setTimeout(() => {
      setScore(41)
      setFeedback('Solid reflection. Identifies parametric equations as a challenge and proposes timed practice. The plan is concrete but could benefit from a specific schedule or milestone.')
      setAiRunning(false)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-indigo-600">← Back to course</Link>
        <div className="mt-3 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ASSIGNMENT.title}</h1>
            <p className="mt-1 text-sm text-slate-400">Due {ASSIGNMENT.due} · {ASSIGNMENT.points} pts</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
              {SUBMISSIONS.filter(s => s.status === 'submitted').length} to grade
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
              {SUBMISSIONS.filter(s => s.status === 'graded').length} graded
            </span>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 transition-all ${panelOpen ? 'grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left column: submission list */}
        {panelOpen && (
          <div className="col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Submissions ({SUBMISSIONS.length})
              </h2>
              <button
                onClick={() => setPanelOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Hide submissions panel"
              >
                ◀
              </button>
            </div>
            {SUBMISSIONS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => select(sub)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selected?.id === sub.id
                    ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{sub.student}</p>
                  <StatusDot status={sub.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(sub.submitted).toLocaleDateString()}
                </p>
                {sub.finalScore !== null && (
                  <p className="mt-1 text-sm font-bold text-emerald-600">{sub.finalScore} / {ASSIGNMENT.points}</p>
                )}
              </button>
            ))}

            {/* Assignment info card */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Instructions
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">{ASSIGNMENT.instructions}</p>
            </div>
          </div>
        )}

        {/* Right column: submission + grader */}
        {selected && (
          <div className={`space-y-4 ${panelOpen ? 'col-span-8' : 'col-span-12'}`}>
            {/* Submission body */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!panelOpen && (
                    <button
                      onClick={() => setPanelOpen(true)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Show submissions panel"
                    >
                      ▶
                    </button>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">{selected.student}</p>
                    <p className="text-xs text-slate-400">Submitted {new Date(selected.submitted).toLocaleString()}</p>
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {selected.body}
              </div>
            </div>

            {/* Rubric quick-ref */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Rubric</h3>
              <div className="grid grid-cols-2 gap-2">
                {ASSIGNMENT.rubric.map((c, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="text-slate-600">{c.description}</span>
                    <span className="ml-2 font-semibold text-slate-500">{c.points}p</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grader panel */}
            <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Grade</h3>
                <button
                  onClick={fakeAI}
                  disabled={aiRunning}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {aiRunning ? '⚡ Running…' : '⚡ AI Suggest'}
                </button>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">Score (/ {ASSIGNMENT.points})</label>
                <input
                  type="number"
                  min={0}
                  max={ASSIGNMENT.points}
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1 block text-xs font-medium text-slate-500">Feedback</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <button className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Publish Grade
                </button>
                {(() => {
                  const idx = SUBMISSIONS.findIndex(s => s.id === selected.id)
                  const prev = SUBMISSIONS[idx - 1]
                  const next = SUBMISSIONS[idx + 1]
                  return (
                    <div className="flex items-center gap-2">
                      {prev && (
                        <button
                          onClick={() => select(prev)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          ← {prev.student}
                        </button>
                      )}
                      {next ? (
                        <button
                          onClick={() => select(next)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          {next.student} →
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Last submission</span>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Variant B — Focused single-submission view with top nav ───────────────────
// One submission at a time with prev/next navigation. Full-width, document feel.

function VariantB() {
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [aiRunning, setAiRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'submission' | 'rubric'>('submission')

  const sub = SUBMISSIONS[idx]
  const score = scores[sub.id] ?? sub.finalScore ?? sub.aiScore ?? 0
  const feedback = feedbacks[sub.id] ?? sub.aiFeedback ?? ''

  const fakeAI = () => {
    setAiRunning(true)
    setTimeout(() => {
      setScores(s => ({ ...s, [sub.id]: 38 }))
      setFeedbacks(f => ({ ...f, [sub.id]: 'Good reflection overall. The student identifies specific challenges but the improvement plan lacks concrete milestones. Writing is clear and focused.' }))
      setAiRunning(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-indigo-600">← {ASSIGNMENT.title}</Link>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-700">
              {idx + 1} / {SUBMISSIONS.length} submissions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={idx === 0}
              onClick={() => setIdx(i => i - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              disabled={idx === SUBMISSIONS.length - 1}
              onClick={() => setIdx(i => i + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Student info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {sub.student.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{sub.student}</p>
              <p className="text-xs text-slate-400">Submitted {new Date(sub.submitted).toLocaleString()}</p>
            </div>
          </div>
          <StatusBadge status={sub.status} />
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Main content */}
          <div className="col-span-3">
            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
              {(['submission', 'rubric'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                    activeTab === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {activeTab === 'submission' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{sub.body}</p>
              </div>
            )}
            {activeTab === 'rubric' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  {ASSIGNMENT.rubric.map((c, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm text-slate-700">{c.description}</p>
                      <span className="ml-4 flex-shrink-0 text-sm font-semibold text-slate-500">{c.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grader sidebar */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Grade</h3>
                <span className="text-xs text-slate-400">{ASSIGNMENT.points} pts total</span>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={ASSIGNMENT.points}
                  value={score}
                  onChange={e => setScores(s => ({ ...s, [sub.id]: Number(e.target.value) }))}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-lg font-bold text-center focus:border-indigo-400 focus:outline-none"
                />
                <span className="text-slate-400">/ {ASSIGNMENT.points}</span>
                <div className="ml-auto text-sm font-semibold text-slate-500">
                  {Math.round((score / ASSIGNMENT.points) * 100)}%
                </div>
              </div>

              <textarea
                rows={6}
                placeholder="Add feedback…"
                value={feedback}
                onChange={e => setFeedbacks(f => ({ ...f, [sub.id]: e.target.value }))}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none focus:bg-white"
              />

              <div className="mt-3 space-y-2">
                <button
                  onClick={fakeAI}
                  disabled={aiRunning}
                  className="w-full rounded-lg border border-indigo-200 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
                >
                  {aiRunning ? '⚡ Running AI…' : '⚡ AI Suggest Score & Feedback'}
                </button>
                <button className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Publish Grade
                </button>
              </div>
            </div>

            {/* Progress summary */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-600 mb-2">Grading progress</p>
              {SUBMISSIONS.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-1">
                  <button onClick={() => setIdx(i)} className={`hover:text-indigo-600 ${i === idx ? 'font-semibold text-indigo-600' : ''}`}>{s.student}</button>
                  <StatusDot status={s.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Variant C — Compact list with expandable inline grader ────────────────────
// All submissions visible in a table/list, click to expand inline grading.

function VariantC() {
  const [expanded, setExpanded] = useState<string | null>(SUBMISSIONS[0].id)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [aiRunning, setAiRunning] = useState<string | null>(null)

  const fakeAI = (subId: string) => {
    setAiRunning(subId)
    setTimeout(() => {
      setScores(s => ({ ...s, [subId]: 39 }))
      setFeedbacks(f => ({ ...f, [subId]: 'Clear identification of challenges. Improvement plan is actionable. Writing quality is strong.' }))
      setAiRunning(null)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-2">
        <Link href="/" className="text-sm text-slate-400 hover:text-indigo-600">← Back to course</Link>
      </div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{ASSIGNMENT.title}</h1>
          <p className="text-sm text-slate-400">Due {ASSIGNMENT.due} · {ASSIGNMENT.points} pts</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p><span className="font-semibold text-amber-600">{SUBMISSIONS.filter(s => s.status === 'submitted').length}</span> to grade</p>
          <p><span className="font-semibold text-emerald-600">{SUBMISSIONS.filter(s => s.status === 'graded').length}</span> graded</p>
        </div>
      </div>

      {/* Assignment info strip */}
      <details className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600">
          Assignment details & rubric
        </summary>
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">{ASSIGNMENT.instructions}</p>
          <div className="grid grid-cols-2 gap-2">
            {ASSIGNMENT.rubric.map((c, i) => (
              <div key={i} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-600">{c.description}</span>
                <span className="ml-2 font-semibold text-slate-500">{c.points}p</span>
              </div>
            ))}
          </div>
        </div>
      </details>

      {/* Submissions */}
      <div className="space-y-2">
        {SUBMISSIONS.map((sub) => {
          const isOpen = expanded === sub.id
          const score = scores[sub.id] ?? sub.finalScore ?? sub.aiScore ?? 0
          const feedback = feedbacks[sub.id] ?? sub.aiFeedback ?? ''
          return (
            <div
              key={sub.id}
              className={`rounded-xl border bg-white shadow-sm transition-all ${
                isOpen ? 'border-indigo-200' : 'border-slate-200'
              }`}
            >
              {/* Row header */}
              <button
                onClick={() => setExpanded(isOpen ? null : sub.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {sub.student.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{sub.student}</p>
                    <p className="text-xs text-slate-400">{new Date(sub.submitted).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sub.finalScore !== null && (
                    <span className="text-sm font-bold text-emerald-600">{sub.finalScore}/{ASSIGNMENT.points}</span>
                  )}
                  <StatusBadge status={sub.status} />
                  <span className="text-slate-300">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded grading area */}
              {isOpen && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Submission text */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Response</p>
                      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 max-h-48 overflow-y-auto">
                        {sub.body}
                      </div>
                    </div>

                    {/* Grading controls */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Grade</p>
                        <button
                          onClick={() => fakeAI(sub.id)}
                          disabled={aiRunning === sub.id}
                          className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 disabled:opacity-60"
                        >
                          {aiRunning === sub.id ? '⚡ Running…' : '⚡ AI Suggest'}
                        </button>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={ASSIGNMENT.points}
                          value={score}
                          onChange={e => setScores(s => ({ ...s, [sub.id]: Number(e.target.value) }))}
                          className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold text-center focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-sm text-slate-400">/ {ASSIGNMENT.points} pts</span>
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Feedback…"
                        value={feedback}
                        onChange={e => setFeedbacks(f => ({ ...f, [sub.id]: e.target.value }))}
                        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none focus:bg-white"
                      />
                      <div className="mt-3 flex justify-end">
                        <button className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                          Publish Grade
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'submitted' | 'graded' }) {
  if (status === 'graded') {
    return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Graded</span>
  }
  return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Submitted</span>
}

function StatusDot({ status }: { status: 'submitted' | 'graded' }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${status === 'graded' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
  )
}

// ── Variant switcher (floating bottom bar) ───────────────────────────────────

function VariantSwitcher({ current }: { current: 'a' | 'b' | 'c' }) {
  const router = useRouter()
  const variants = [
    { id: 'a', label: 'A — Split panel' },
    { id: 'b', label: 'B — One at a time' },
    { id: 'c', label: 'C — Inline expand' },
  ] as const

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-lg">
        <span className="mr-1 px-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Variant
        </span>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => router.push(`/proto/assignment?v=${v.id}`)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              current === v.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
