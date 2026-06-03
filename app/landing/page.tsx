import { ALUMOSGradientLogo } from '@/components/ALUMOSGradientLogo'
import Link from 'next/link'

const FEATURES = [
  {
    icon: 'auto_awesome',
    title: 'AI Course Generation',
    desc: 'Upload any syllabus and watch ALUMOS build a complete, structured course in under 60 seconds.',
    color: '#F59E0B',
  },
  {
    icon: 'speed',
    title: 'SpeedGrader',
    desc: 'Grade with AI-powered rubrics. Detailed feedback and scores drafted automatically — no red pen required.',
    color: '#EC4899',
  },
  {
    icon: 'psychology',
    title: 'Student AI Coach',
    desc: "Every student gets a 24/7 personalized tutor that guides them to answers without giving them away.",
    color: '#7C3AED',
  },
  {
    icon: 'table_chart',
    title: 'Live Gradebook',
    desc: 'Real-time grade tracking with smart analytics so you always know exactly where every student stands.',
    color: '#10B981',
  },
  {
    icon: 'assignment',
    title: 'Rich Assignments',
    desc: 'Build assignments with text, links, files, and AI-generated content blocks — all in one place.',
    color: '#3B82F6',
  },
  {
    icon: 'dashboard',
    title: 'Unified Dashboard',
    desc: 'Students and teachers each get a tailored home view. Everything important, front and center.',
    color: '#EF4444',
  },
]

const STEPS = [
  {
    step: '01',
    icon: 'upload_file',
    title: 'Upload your syllabus',
    desc: 'Drop in a PDF, paste text, or type a course outline. Any format works.',
  },
  {
    step: '02',
    icon: 'auto_awesome',
    title: 'AI builds your course',
    desc: 'ALUMOS generates modules, assignments, rubrics, and learning objectives automatically.',
  },
  {
    step: '03',
    icon: 'school',
    title: 'Students learn smarter',
    desc: 'Enroll students, assign work, and let the AI coach guide them to mastery.',
  },
]

const STATS = [
  { value: '60s', label: 'Avg. course build time' },
  { value: '100%', label: 'AI-generated rubrics' },
  { value: '24/7', label: 'Student AI support' },
  { value: '0', label: 'Hours of grading setup' },
]

const GRAD = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const GRAD_TEXT = {
  background: GRAD,
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-white overflow-x-hidden"
      style={{ fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)' }}
    >
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <ALUMOSGradientLogo iconSize={30} />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors cursor-pointer">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors cursor-pointer">
              How it works
            </a>
            <Link href="/about" className="hover:text-slate-900 transition-colors cursor-pointer">
              About
            </Link>
          </div>

          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: GRAD }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -left-32 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899)' }}
        />
        <div
          className="absolute top-10 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #EC4899, #7C3AED)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#7C3AED' }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold border"
            style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)', color: '#7C3AED' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              auto_awesome
            </span>
            AI-Native Learning Management
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{ fontFamily: 'var(--font-syne, system-ui)' }}
          >
            <span className="text-slate-900">A Brighter Path</span>
            <br />
            <span style={GRAD_TEXT}>Through Every Class.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ALUMOS turns your syllabus into a complete course in seconds — then coaches every
            student to mastery with 24/7 AI support. Built for teachers who don&apos;t have time to waste.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full px-8 py-4 font-semibold text-white text-base transition-transform hover:scale-105 cursor-pointer"
              style={{ background: GRAD, boxShadow: '0 8px 30px rgba(124,58,237,0.35)' }}
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full px-8 py-4 font-semibold text-slate-700 text-base bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* App window mockup */}
        <div className="relative max-w-5xl mx-auto mt-20 px-6">
          <div
            className="rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 border-b border-slate-200/60">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-slate-400 font-mono">alumos.app / dashboard</span>
            </div>

            {/* Fake dashboard */}
            <div className="p-8 grid grid-cols-12 gap-4 min-h-[260px]">
              {/* Sidebar icons */}
              <div className="col-span-2 space-y-2">
                {(['dashboard', 'book', 'assignment', 'table_chart', 'psychology'] as const).map(
                  (icon, i) => (
                    <div
                      key={icon}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                      style={
                        i === 0
                          ? { background: GRAD, color: '#fff' }
                          : { color: '#94a3b8' }
                      }
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {icon}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Main content */}
              <div className="col-span-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-36 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                  <div
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899)' }}
                  >
                    + New Course
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'CS 101', color: '#F59E0B', progress: 72 },
                    { label: 'Bio 201', color: '#EC4899', progress: 45 },
                    { label: 'Math 301', color: '#7C3AED', progress: 88 },
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 mb-3">{c.label}</div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.progress}%`, background: c.color }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-2">{c.progress}% complete</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-4 border border-purple-100 bg-gradient-to-r from-slate-50 to-purple-50/40">
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20, color: '#7C3AED' }}
                    >
                      auto_awesome
                    </span>
                    <div className="text-xs text-slate-600 font-medium">
                      AI is grading 24 submissions from CS 101…
                    </div>
                    <div className="ml-auto flex gap-1 items-center">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        id="stats"
        className="py-16 border-y border-slate-100"
        style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f4f0ff 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                className="text-4xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-syne)', ...GRAD_TEXT }}
              >
                {s.value}
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#7C3AED' }}>
              Features
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Everything your classroom needs
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              From first draft to final grade — ALUMOS handles the busywork so you can focus on teaching.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: 'rgba(226,232,240,0.9)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}18` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 22, color: f.color }}
                  >
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-24"
        style={{ background: 'linear-gradient(180deg, #fafafa 0%, #fdf4ff 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#7C3AED' }}>
              How it works
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Course ready in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px opacity-40"
              style={{ background: GRAD }}
            />

            {STEPS.map((s) => (
              <div key={s.step} className="relative text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                  style={{ background: GRAD }}
                >
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>
                    {s.icon}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-400 mb-1 tracking-widest">{s.step}</div>
                <h3
                  className="text-xl font-semibold text-slate-900 mb-3"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            style={{ background: GRAD }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, white 0%, transparent 55%), radial-gradient(circle at 80% 50%, white 0%, transparent 55%)',
              }}
            />
            <h2
              className="relative text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Ready to transform your classroom?
            </h2>
            <p className="relative text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Join ALUMOS and build your first AI-powered course today.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-full px-10 py-4 font-semibold text-base bg-white transition-transform hover:scale-105 cursor-pointer shadow-xl"
              style={{ color: '#7C3AED' }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <ALUMOSGradientLogo iconSize={24} />
          <p className="text-sm text-slate-400">
            &copy; 2025 ALUMOS. A Brighter Path Through Every Class.
          </p>
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  )
}
