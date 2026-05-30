// PROTOTYPE — throwaway. Delete or absorb after design decision.
// Question: which teacher UI layout best supports today's features + future growth?
// Switch variants with the floating bar at the bottom: ?v=1 (Sidebar Pro), ?v=2 (Dashboard), ?v=3 (Focus Queue)

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

// ─── Fake data ────────────────────────────────────────────────────────────────

const COURSES = [
  { id: '1', title: 'Music Theory & Ensemble', code: 'MUS 201', students: 24, term: 'Spring 2026' },
  { id: '2', title: 'Pre-Calculus Honors', code: 'MATH 150H', students: 31, term: 'Spring 2026' },
]

const MODULES = [
  { id: 'm1', title: 'Week 1 – Foundations', week: 1 },
  { id: 'm2', title: 'Week 2 – Rhythm & Meter', week: 2 },
  { id: 'm3', title: 'Week 3 – Harmony', week: 3 },
  { id: 'm4', title: 'Week 4 – Counterpoint', week: 4 },
]

const ASSIGNMENTS = [
  { id: 'a1', moduleId: 'm1', title: 'Practice Log Week 1', due: 'Feb 5', points: 25, submitted: 18, graded: 12, total: 24 },
  { id: 'a2', moduleId: 'm1', title: 'Listening Journal Entry 1', due: 'Feb 7', points: 15, submitted: 14, graded: 14, total: 24 },
  { id: 'a3', moduleId: 'm2', title: 'Rhythm Transcription', due: 'Feb 12', points: 30, submitted: 6, graded: 0, total: 24 },
  { id: 'a4', moduleId: 'm2', title: 'Meter Analysis Quiz', due: 'Feb 14', points: 20, submitted: 0, graded: 0, total: 24 },
  { id: 'a5', moduleId: 'm3', title: 'Chord Progression Essay', due: 'Feb 20', points: 40, submitted: 0, graded: 0, total: 24 },
]

const GRADER_QUEUE = [
  { id: 'q1', student: 'Alex Rivera', assignment: 'Practice Log Week 1', submitted: '2h ago' },
  { id: 'q2', student: 'Jordan Kim', assignment: 'Practice Log Week 1', submitted: '3h ago' },
  { id: 'q3', student: 'Sam Chen', assignment: 'Practice Log Week 1', submitted: '5h ago' },
  { id: 'q4', student: 'Taylor Brown', assignment: 'Listening Journal Entry 1', submitted: '1d ago' },
  { id: 'q5', student: 'Morgan Lee', assignment: 'Listening Journal Entry 1', submitted: '1d ago' },
  { id: 'q6', student: 'Casey Wright', assignment: 'Listening Journal Entry 1', submitted: '2d ago' },
]

// Future feature stubs
const AI_INSIGHTS = [
  { id: 'i1', type: 'pattern', text: '6 students haven\'t submitted Practice Log Week 1 — due tomorrow.' },
  { id: 'i2', type: 'grade', text: 'Avg score on Listening Journal is 11.2/15 — lower than last term.' },
  { id: 'i3', type: 'calibration', text: 'Grill Me calibration not set for Chord Progression Essay.' },
]

const ANNOUNCEMENTS_DRAFT = { title: 'Week 3 materials posted', body: 'Harmony reading is on the portal...' }

// ─── Variant 1: Sidebar Pro ───────────────────────────────────────────────────

function SidebarPro() {
  const [activeCourse, setActiveCourse] = useState(COURSES[0])
  const [activeNav, setActiveNav] = useState('assignments')
  const [expandedModule, setExpandedModule] = useState<string | null>('m1')

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'assignments', label: 'Assignments', icon: '✦' },
    { id: 'gradebook', label: 'Gradebook', icon: '▦' },
    { id: 'speedgrader', label: 'SpeedGrader', icon: '⚡', badge: GRADER_QUEUE.length },
    { id: 'insights', label: 'AI Insights', icon: '✦', badge: AI_INSIGHTS.length, future: true },
    { id: 'announcements', label: 'Announcements', icon: '◎', future: true },
    { id: 'office-hours', label: 'Office Hours', icon: '⊕', future: true },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ]

  return (
    <div className="flex h-screen -mt-8 -mx-6 overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        {/* Course switcher */}
        <div className="border-b border-slate-100 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Course</p>
          {COURSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourse(c)}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeCourse.id === c.id
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium">{c.code}</div>
              <div className="truncate text-xs opacity-70">{c.title}</div>
            </button>
          ))}
          <button className="mt-1 w-full rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-left text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-600">
            + Add course
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                activeNav === item.id
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              } ${item.future ? 'opacity-50' : ''}`}
            >
              <span className="text-xs">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.future && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-600">soon</span>
              )}
              {item.badge && !item.future && (
                <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-bold text-indigo-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">T</div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Prof. Taylor</p>
              <p className="text-xs text-slate-400">teacher</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <h1 className="text-base font-bold text-slate-900">{activeCourse.title}</h1>
            <p className="text-xs text-slate-400">{activeCourse.students} students · {activeCourse.term}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              + New assignment
            </button>
            <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Run SpeedGrader ⚡
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 gap-0 overflow-hidden">
          {/* Modules + assignments */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeNav === 'assignments' && (
              <div className="space-y-3">
                {MODULES.map((mod) => {
                  const modAssignments = ASSIGNMENTS.filter((a) => a.moduleId === mod.id)
                  const isExpanded = expandedModule === mod.id
                  return (
                    <div key={mod.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                      <button
                        className="flex w-full items-center justify-between px-5 py-3"
                        onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400">WK {mod.week}</span>
                          <span className="font-semibold text-slate-800">{mod.title}</span>
                          <span className="text-xs text-slate-400">{modAssignments.length} assignments</span>
                        </div>
                        <span className="text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100">
                          {modAssignments.map((a) => (
                            <div key={a.id} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                                <p className="text-xs text-slate-400">Due {a.due} · {a.points} pts</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">{a.submitted}/{a.total} submitted</p>
                                  <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-indigo-400"
                                      style={{ width: `${(a.submitted / a.total) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <StatusPill submitted={a.submitted} graded={a.graded} total={a.total} />
                                <button className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">
                                  Grade →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {activeNav === 'speedgrader' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-slate-800">SpeedGrader Queue</h2>
                  <span className="text-sm text-slate-500">{GRADER_QUEUE.length} submissions awaiting review</span>
                </div>
                <div className="space-y-2">
                  {GRADER_QUEUE.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.student}</p>
                        <p className="text-xs text-slate-400">{item.assignment} · {item.submitted}</p>
                      </div>
                      <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                        Grade with AI ⚡
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeNav === 'overview' && <OverviewStats course={activeCourse} />}
          </div>

          {/* Right panel: AI insights */}
          <div className="w-64 overflow-y-auto border-l border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">AI Insights</p>
            <div className="space-y-2">
              {AI_INSIGHTS.map((ins) => (
                <div key={ins.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                  {ins.text}
                </div>
              ))}
            </div>
            <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Draft Announcement</p>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-700">{ANNOUNCEMENTS_DRAFT.title}</p>
              <p className="mt-1 text-xs text-slate-400">{ANNOUNCEMENTS_DRAFT.body}</p>
              <button className="mt-2 text-xs font-semibold text-indigo-600 hover:underline">Send →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Variant 2: Dashboard Cards ───────────────────────────────────────────────

function DashboardCards() {
  const [activeCourse, setActiveCourse] = useState(COURSES[0])
  const [activeTab, setActiveTab] = useState<'modules' | 'gradebook' | 'queue'>('modules')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'assignments', label: 'Modules & Assignments', icon: '✦' },
    { id: 'gradebook', label: 'Gradebook', icon: '▦' },
    { id: 'speedgrader', label: 'SpeedGrader', icon: '⚡', badge: GRADER_QUEUE.length },
    { id: 'insights', label: 'AI Insights', icon: '✦', future: true },
    { id: 'announcements', label: 'Announcements', icon: '◎', future: true },
    { id: 'office-hours', label: 'Office Hours', icon: '⊕', future: true },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ]

  const pendingGrades = GRADER_QUEUE.length
  const submissionRate = Math.round(
    (ASSIGNMENTS.reduce((s, a) => s + a.submitted, 0) /
      (ASSIGNMENTS.reduce((s, a) => s + a.total, 0))) *
      100
  )

  return (
    <div>
      {/* Hamburger + slide-out drawer */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="mb-5 flex flex-col gap-1 p-1"
        aria-label="Open navigation"
      >
        <span className="block h-0.5 w-5 bg-slate-600 rounded" />
        <span className="block h-0.5 w-5 bg-slate-600 rounded" />
        <span className="block h-0.5 w-5 bg-slate-600 rounded" />
      </button>

      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <span className="text-sm font-bold text-slate-800">Navigation</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Course switcher */}
            <div className="border-b border-slate-100 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">Course</p>
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCourse(c); setDrawerOpen(false) }}
                  className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeCourse.id === c.id
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium">{c.code}</div>
                  <div className="truncate text-xs opacity-70">{c.title}</div>
                </button>
              ))}
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDrawerOpen(false)}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 ${item.future ? 'opacity-50' : ''}`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.future && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-600">soon</span>}
                  {item.badge && !item.future && (
                    <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-bold text-indigo-600">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-100 p-3">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">T</div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Prof. Taylor</p>
                  <p className="text-xs text-slate-400">teacher</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Course picker row */}
      <div className="mb-6 flex items-center gap-3">
        {COURSES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCourse(c)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeCourse.id === c.id
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {c.code} — {c.title}
          </button>
        ))}
        <button className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-400 hover:border-indigo-400 hover:text-indigo-600">
          + New course
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Students" value={String(activeCourse.students)} sub="enrolled" color="indigo" />
        <StatCard label="Pending grades" value={String(pendingGrades)} sub="in SpeedGrader queue" color="amber" action="Grade now ⚡" />
        <StatCard label="Submission rate" value={`${submissionRate}%`} sub="across open assignments" color="emerald" />
        <StatCard label="AI Insights" value={String(AI_INSIGHTS.length)} sub="need attention" color="rose" future />
      </div>

      {/* Tab nav */}
      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {([['modules', 'Modules & Assignments'], ['queue', `SpeedGrader (${pendingGrades})`], ['gradebook', 'Gradebook']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-2 gap-4">
          {MODULES.map((mod) => {
            const modAssignments = ASSIGNMENTS.filter((a) => a.moduleId === mod.id)
            return (
              <div key={mod.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400">WEEK {mod.week}</span>
                    <h3 className="mt-0.5 font-semibold text-slate-900">{mod.title}</h3>
                  </div>
                  <button className="text-xs font-semibold text-indigo-600 hover:underline">+ Add</button>
                </div>
                <div className="space-y-2">
                  {modAssignments.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No assignments yet</p>
                  )}
                  {modAssignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-slate-800">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.due} · {a.points} pts</p>
                      </div>
                      <StatusPill submitted={a.submitted} graded={a.graded} total={a.total} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-2">
          {GRADER_QUEUE.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {item.student.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.student}</p>
                  <p className="text-xs text-slate-400">{item.assignment} · submitted {item.submitted}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                  View
                </button>
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  AI Grade ⚡
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gradebook' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-3 text-left">Student</th>
                {ASSIGNMENTS.slice(0, 3).map((a) => (
                  <th key={a.id} className="px-3 py-3 text-center">{a.title.split(' ').slice(0, 2).join(' ')}</th>
                ))}
                <th className="px-5 py-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {['Alex Rivera', 'Jordan Kim', 'Sam Chen', 'Taylor Brown', 'Morgan Lee'].map((name, i) => (
                <tr key={name} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{name}</td>
                  <td className="px-3 py-3 text-center"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{18 + i * 2}/25</span></td>
                  <td className="px-3 py-3 text-center"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{12 + i}/15</span></td>
                  <td className="px-3 py-3 text-center"><span className="text-xs text-slate-400">—</span></td>
                  <td className="px-5 py-3 text-center font-semibold text-slate-700">{30 + i * 3}/70</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Future feature hint bar */}
      <div className="mt-6 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">Coming soon</p>
        <div className="flex gap-6 text-sm text-amber-700">
          <span>📊 AI Insights & class health</span>
          <span>🎯 Grill Me — calibrate AI grader to your style</span>
          <span>📢 Announcements</span>
          <span>🕐 Office hours scheduler</span>
        </div>
      </div>
    </div>
  )
}

// ─── Variant 3: Focus Queue ────────────────────────────────────────────────────

function FocusQueue() {
  const [activeCourse, setActiveCourse] = useState(COURSES[0])
  const [dismissed, setDismissed] = useState<string[]>([])

  const urgentItems = [
    { id: 'u1', type: 'grade', icon: '⚡', title: `${GRADER_QUEUE.length} submissions need grading`, sub: 'Practice Log Week 1 + Listening Journal', cta: 'Open SpeedGrader', color: 'indigo' },
    { id: 'u2', type: 'missing', icon: '⚠', title: '6 students haven\'t submitted Practice Log', sub: 'Due tomorrow — send a reminder?', cta: 'Send reminder', color: 'amber' },
    { id: 'u3', type: 'calibrate', icon: '🎯', title: 'Set grading calibration for Chord Progression Essay', sub: 'Submissions open in 5 days. Grill Me takes 3 min.', cta: 'Start Grill Me', color: 'violet', future: true },
    { id: 'u4', type: 'insight', icon: '📉', title: 'Avg score on Listening Journal is below last term', sub: '11.2/15 vs 13.4/15 last semester', cta: 'View breakdown', color: 'rose', future: true },
  ]

  const visible = urgentItems.filter((i) => !dismissed.includes(i.id))

  return (
    <div className="mx-auto max-w-2xl">
      {/* Course selector — minimal */}
      <div className="mb-8 flex items-center gap-2">
        {COURSES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCourse(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeCourse.id === c.id
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-600 hover:border-slate-500'
            }`}
          >
            {c.code}
          </button>
        ))}
        <span className="text-sm text-slate-400">{activeCourse.title}</span>
      </div>

      {/* What needs attention */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Needs attention
        </h2>
        {visible.length === 0 && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            ✓ You&apos;re all caught up.
          </div>
        )}
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-xl border p-5 ${
                item.color === 'indigo' ? 'border-indigo-200 bg-indigo-50' :
                item.color === 'amber' ? 'border-amber-200 bg-amber-50' :
                item.color === 'violet' ? 'border-violet-200 bg-violet-50' :
                'border-rose-200 bg-rose-50'
              }`}
            >
              {item.future && (
                <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-amber-600 shadow-sm">
                  soon
                </span>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span>{item.icon}</span>
                    <p className={`font-semibold ${
                      item.color === 'indigo' ? 'text-indigo-900' :
                      item.color === 'amber' ? 'text-amber-900' :
                      item.color === 'violet' ? 'text-violet-900' :
                      'text-rose-900'
                    }`}>{item.title}</p>
                  </div>
                  <p className={`text-sm ${
                    item.color === 'indigo' ? 'text-indigo-600' :
                    item.color === 'amber' ? 'text-amber-600' :
                    item.color === 'violet' ? 'text-violet-600' :
                    'text-rose-600'
                  }`}>{item.sub}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${
                    item.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                    item.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
                    item.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700' :
                    'bg-rose-600 hover:bg-rose-700'
                  } ${item.future ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={item.future}
                >
                  {item.cta}
                </button>
                <button
                  onClick={() => setDismissed((d) => [...d, item.id])}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All assignments — secondary */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          All assignments
        </h2>
        <div className="space-y-2">
          {ASSIGNMENTS.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-400">Due {a.due} · {a.points} pts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{a.submitted}</span>/{a.total} in
                  {a.graded > 0 && <span className="ml-2 text-emerald-600">{a.graded} graded</span>}
                </div>
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function StatusPill({ submitted, graded }: { submitted: number; graded: number; total: number }) {
  if (submitted === 0) return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">No submissions</span>
  if (graded === submitted) return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">All graded</span>
  if (graded > 0) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{submitted - graded} to grade</span>
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{submitted} to grade</span>
}

function StatCard({ label, value, sub, color, action, future }: {
  label: string; value: string; sub: string; color: string; action?: string; future?: boolean
}) {
  const colors: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
      {future && <p className="mt-1 text-xs font-semibold opacity-50">coming soon</p>}
      {action && <button className="mt-2 text-xs font-semibold underline">{action}</button>}
    </div>
  )
}

function OverviewStats({ course }: { course: typeof COURSES[0] }) {
  return (
    <div>
      <h2 className="mb-4 font-bold text-slate-800">{course.title} — Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Students" value={String(course.students)} sub="enrolled" color="indigo" />
        <StatCard label="Pending grades" value={String(GRADER_QUEUE.length)} sub="awaiting review" color="amber" action="Grade now ⚡" />
        <StatCard label="Submission rate" value="72%" sub="across open assignments" color="emerald" />
      </div>
    </div>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────────

function ProtoShell() {
  const params = useSearchParams()
  const router = useRouter()
  const v = params.get('v') ?? '1'

  const variants = [
    { id: '1', label: 'Sidebar Pro', desc: 'Persistent nav, right panel for AI context' },
    { id: '2', label: 'Dashboard Cards', desc: 'Stats up top, module cards, tab switcher' },
    { id: '3', label: 'Focus Queue', desc: 'What needs attention now, everything else secondary' },
  ]

  return (
    <div>
      {v === '1' && <SidebarPro />}
      {v === '2' && <DashboardCards />}
      {v === '3' && <FocusQueue />}

      {/* Floating switcher */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-xl">
        <span className="mr-2 text-xs font-semibold text-slate-400 pl-1">PROTOTYPE</span>
        {variants.map((vr) => (
          <button
            key={vr.id}
            onClick={() => router.push(`/proto/teacher?v=${vr.id}`)}
            title={vr.desc}
            className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
              v === vr.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {vr.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProtoTeacherPage() {
  return (
    <Suspense>
      <ProtoShell />
    </Suspense>
  )
}
