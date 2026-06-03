import { ALUMOSGradientLogo } from '@/components/ALUMOSGradientLogo'
import Link from 'next/link'

const GRAD = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const GRAD_TEXT = {
  background: GRAD,
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
}

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: 'var(--font-dm-sans, system-ui)' }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/landing" className="cursor-pointer">
            <ALUMOSGradientLogo iconSize={26} />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
              ← Back
            </Link>
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-white cursor-pointer"
              style={{ background: GRAD }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-20 pb-16 border-b border-slate-100">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">The Story</p>
        <h1
          className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-syne, system-ui)' }}
        >
          Building an LMS<br />
          <span style={GRAD_TEXT}>for the AI era.</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
          One week. A hackathon prompt. An idea that had been sitting in the back of my mind.
          This is how ALUMOS came to be, what I learned building it, and where it goes next.
        </p>
        <p className="mt-6 text-sm text-slate-400">By Fischer Hewitt &nbsp;·&nbsp; Cal Poly &nbsp;·&nbsp; 2025</p>
      </header>

      {/* Article body */}
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-20">

        {/* Section 1 — The Problem */}
        <section>
          <SectionLabel n="01" label="The Problem with the Incumbent" />
          <Prose>
            <p>
              The dominant LMS was genuinely revolutionary when it launched. Before it, there
              was something worse — clunky, frustrating, and widely hated. The new platform
              came in and changed everything. It made courses modular, quizzes customizable,
              and gave teachers real freedom to design their classroom how they wanted.
              Teachers fell in love with it because it could fit their workflow. It was
              powerful when used well.
            </p>
            <p>
              But it kept adding features. And adding features. And adding more.
            </p>
            <p>
              What started as freedom turned into overwhelm. Most teachers don&apos;t need all of
              it — but they also don&apos;t know what to ignore. So they pick different subsets of
              features, organize things differently, and build their courses in completely
              different ways. The result is a fragmented experience for students. When you&apos;re
              taking six courses on the same platform, you&apos;re not learning one system — you&apos;re
              learning six. Six different ways to find an assignment. Six different places to
              check for announcements. Six different mental maps you have to hold in your head.
            </p>
            <p>
              I have lived this. Every semester. And I kept thinking: it doesn&apos;t have to be
              this way.
            </p>
          </Prose>

          {/* Pull quote */}
          <blockquote
            className="my-10 pl-6 border-l-4 text-xl font-semibold text-slate-700 leading-relaxed"
            style={{ borderColor: '#F59E0B' }}
          >
            &ldquo;When you&apos;re taking six courses on the same platform, you&apos;re not learning one
            system — you&apos;re learning six.&rdquo;
          </blockquote>
        </section>

        {/* Section 2 — The Spark */}
        <section>
          <SectionLabel n="02" label="The Spark" />
          <Prose>
            <p>
              Then came the news: the dominant LMS was breached by the ShinyHunters. Sensitive
              student data — grades, personal information, learning records — exposed. For a
              platform that sits at the center of every student&apos;s academic life, that was a
              serious wake-up call.
            </p>
            <p>
              I had been sitting on this idea for a while, turning it over in my head, never
              putting pen to paper. Then my school announced a hackathon. The prompt: build a
              competitor to a major company. I already had the company. I already had the
              thesis. I had one week.
            </p>
            <p>
              I went to work.
            </p>
          </Prose>
        </section>

        {/* Section 3 — The Name */}
        <section>
          <SectionLabel n="03" label="Why ALUMOS?" />
          <Prose>
            <p>
              The name came from a brainstorm with ChatGPT. I wanted something that captured
              both learning and light — the idea of guidance, of a path becoming clear.
            </p>
          </Prose>

          <div className="my-8 grid sm:grid-cols-2 gap-4">
            <EtymCard
              word="Aula"
              origin="Spanish / Latin"
              meaning="Classroom"
              color="#F59E0B"
            />
            <EtymCard
              word="Lumos"
              origin="Harry Potter"
              meaning="Light — the spell that illuminates darkness"
              color="#7C3AED"
            />
          </div>

          <Prose>
            <p>
              Combined: <strong>ALUMOS</strong>. Classroom light. A brighter path.
              That&apos;s where the tagline &ldquo;A Brighter Path Through Every Class&rdquo; comes from,
              and why the logo has a sun — not a torch or a lightbulb, but a sun.
              Something warm, reliable, and always there.
            </p>
          </Prose>
        </section>

        {/* Section 4 — Three Goals */}
        <section>
          <SectionLabel n="04" label="Three Goals" />
          <Prose>
            <p>
              Going into the build I set three non-negotiable goals. Everything I designed
              had to serve at least one of them.
            </p>
          </Prose>

          <div className="mt-8 space-y-0 border-t border-slate-100">
            {[
              {
                n: '1',
                title: 'AI-native from the ground up',
                body: "Not AI bolted on. Not a chatbot in the corner. Every core workflow — course creation, grading, student support — should have AI as a first-class participant, not an afterthought.",
                color: '#F59E0B',
              },
              {
                n: '2',
                title: 'Structured, but still yours',
                body: "Teachers should have enough freedom to make a course their own, but every course should be navigable the same way. Students shouldn't need a different roadmap for every class.",
                color: '#EC4899',
              },
              {
                n: '3',
                title: 'Security as a feature',
                body: "Not just as a checkbox. Given why I was building this, security had to be a visible part of the design. Within a week's scope, that meant row-level security, proper auth, and never storing more than necessary.",
                color: '#7C3AED',
              },
            ].map(g => (
              <div key={g.n} className="py-8 border-b border-slate-100 flex gap-6">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5"
                  style={{ background: g.color }}
                >
                  {g.n}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
                    {g.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{g.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 — The Build */}
        <section>
          <SectionLabel n="05" label="How I Built It" />
          <Prose>
            <p>
              Before writing a single line of code, I spent real time on planning. ChatGPT
              helped me map out what a proper LMS actually needs: courses, modules, assignments,
              rubrics, submissions, gradebook, enrollment. Then we separated what was essential
              for the demo, what was nice-to-have if time allowed, and what belonged on a future
              roadmap. That distinction ended up saving me a lot of time — knowing what
              not to build is just as important as knowing what to build.
            </p>
            <p>
              Then I found something that changed how I work entirely.
            </p>
          </Prose>

          {/* Video callout */}
          <div
            className="my-8 rounded-2xl p-6 border"
            style={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.15)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.1)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#7C3AED' }}>
                  play_circle
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#7C3AED' }}>
                  Recommended watch
                </p>
                <p className="font-semibold text-slate-900 mb-1">Matt Pocock on Claude Code skills &amp; workflow</p>
                <p className="text-sm text-slate-500 mb-3">
                  This was one of the most important videos I could have landed on. It completely
                  changed how I work with AI.
                </p>
                <a
                  href="https://youtu.be/v4F1gFy-hqg?si=SN1HsEYHGk8D0clo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                  style={{ color: '#7C3AED' }}
                >
                  Watch on YouTube
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                </a>
              </div>
            </div>
          </div>

          <Prose>
            <p>
              The core insight from Matt Pocock was this: if you want AI to do what you actually
              want, you need to be on the same page first — and your codebase has to be organized
              enough that the AI can read it and understand it. Without that, you end up in a
              cycle: the AI does the wrong thing, you try to correct it, it does a slightly
              different wrong thing, you go through six bad iterations before you get to the first
              decent one, and even then it&apos;s not quite right.
            </p>
            <p>
              Once I understood that, everything changed. I started using skills that helped me
              get aligned before I started building:
            </p>
          </Prose>

          <div className="mt-8 space-y-4">
            {[
              {
                cmd: '/grill-with-docs',
                title: 'Get on the same terms',
                desc: "Before starting any feature, this skill challenges your plan against the existing domain model and documentation. It sharpens the terminology, surfaces contradictions, and makes sure the AI and I are thinking about the codebase the same way.",
                color: '#F59E0B',
              },
              {
                cmd: '/prototype',
                title: 'Explore before committing',
                desc: "Especially for UI work, where I needed ALUMOS to look and feel genuinely different. The prototype skill generates radically different design variations on one route, switchable in the browser. You pick what works — or steal the best pieces from each.",
                color: '#EC4899',
              },
              {
                cmd: '/to-prd + /to-issues',
                title: 'Break it down',
                desc: "Once I had a clear direction, these skills turned the plan into a product spec and then into individually-scoped GitHub issues. Instead of handing the AI a huge vague task, I could hand it one well-defined problem at a time. The quality of the output went up dramatically.",
                color: '#7C3AED',
              },
            ].map(s => (
              <div
                key={s.cmd}
                className="rounded-2xl p-5 border"
                style={{ borderColor: 'rgba(226,232,240,0.8)', background: '#fafafa' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <code
                    className="text-xs font-bold rounded px-2 py-0.5"
                    style={{ background: `${s.color}15`, color: s.color }}
                  >
                    {s.cmd}
                  </code>
                  <span className="font-semibold text-slate-900">{s.title}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <Prose>
            <p className="mt-8">
              I also had real constraints. I was a college student going into finals week with
              limited Claude credits and limited time. So resource management became part of the
              architecture: AI grading is on-demand by default, the test suite never calls the
              real model, and every AI call is scoped as tightly as possible. Working within those
              constraints actually made the codebase better.
            </p>
          </Prose>
        </section>

        {/* Section 6 — What I Learned */}
        <section>
          <SectionLabel n="06" label="What I Learned" />
          <div className="space-y-6 mt-6">
            {[
              {
                icon: 'psychology',
                heading: 'The AI does what you tell it — not what you mean',
                body: "The biggest lesson. Vague prompts produce vague results. The AI is not reading your mind. It is reading your words, your file structure, and your existing code. The more clearly I could articulate what I wanted — and the more organized the codebase was — the better the output.",
              },
              {
                icon: 'architecture',
                heading: 'Plan what you\'re NOT building',
                body: "Deciding to not build the quiz engine, the discussion board, and the admin system freed up time for the three things that actually made the demo compelling. Scope discipline is a design skill.",
              },
              {
                icon: 'manage_search',
                heading: 'Naming matters more than I thought',
                body: "Choosing ALUMOS and thinking carefully about what it meant shaped the whole visual direction. The sun in the logo, the tagline, the gradient — all of it follows from the name. Good naming gives the product a gravity it wouldn't have otherwise.",
              },
              {
                icon: 'lock',
                heading: 'Security is easier to build in than bolt on',
                body: "Supabase's row-level security and the Supabase SSR auth pattern made it possible to have real security even in a one-week build. The key was setting it up from day one — not going back and adding it later.",
              },
              {
                icon: 'construction',
                heading: 'Prototyping is not a luxury',
                body: "I used to think prototyping was something you did when you had time. This project convinced me it's how you save time. An hour of exploring design variants surfaced decisions that would have taken days to untangle if I'd just committed to the first idea.",
              },
              {
                icon: 'format_paint',
                heading: 'Polish is seductive. Functionality is the foundation.',
                body: "More than once I found myself designing how the teacher dashboard looked instead of making sure clicking an assignment button actually took you to the right page. It feels productive — and it is satisfying — but you are building on sand. Working UI first, then making it beautiful, is the discipline I am still practicing.",
              },
              {
                icon: 'tune',
                heading: 'Shared understanding with AI has to be earned',
                body: "The hardest part was not getting the AI to write code — it was getting it to understand my judgment. What does a 7/10 answer actually look like? What makes a rubric feel fair to a teacher? Those are not things you can explain in one prompt. They require examples, iteration, and patience. Getting to shared understanding is an ongoing process, not a starting state.",
              },
            ].map(l => (
              <div key={l.heading} className="flex gap-5">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(245,158,11,0.1)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#F59E0B' }}>
                    {l.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{l.heading}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{l.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7 — Teaching the AI to Grade */}
        <section>
          <SectionLabel n="07" label="Teaching the AI to Grade" />
          <Prose>
            <p>
              One of the biggest rabbit holes of the whole project was grading calibration —
              and I went deep.
            </p>
            <p>
              The problem is subtle. The AI conceptually understands what a 7 out of 10 means.
              But knowing a concept and being able to produce it consistently are different things.
              AI is trained on patterns, and at its core it is making predictions — it knows 1 and
              0 very well. The space between them, that nuanced judgment of &ldquo;this answer is mostly
              right but missing one key thing,&rdquo; is genuinely hard for it to calibrate without
              guidance.
            </p>
            <p>
              The same problem applies to rubrics. The AI can grade against a rubric. But how do
              you design a rubric that maps to how a real teacher actually thinks about quality?
              A rubric that is too rigid misses nuance. A rubric that is too loose produces
              inconsistent grades.
            </p>
            <p>
              So I ran a long <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">/grill-with-docs</code> session.
              I had the AI give me example student answers at different quality levels, I scored
              them the way I would as a grader, and we used that back-and-forth to refine the
              agent prompt until the scores it produced matched my own judgment. It is not perfect —
              grading never is — but it is significantly more consistent than where it started.
            </p>
          </Prose>

          <blockquote
            className="my-10 pl-6 border-l-4 text-xl font-semibold text-slate-700 leading-relaxed"
            style={{ borderColor: '#7C3AED' }}
          >
            &ldquo;AI knows 1 and 0 very well. Teaching it what 0.5 actually looks like —
            that takes examples, iteration, and your own judgment as the signal.&rdquo;
          </blockquote>

          <Prose>
            <p>
              The deeper insight from this is that AI grading should not be a fixed system.
              It should learn from the teacher. Every time a teacher overrides a score or edits
              feedback, that is a data point. The next generation of this feature is not just
              &ldquo;AI grades against a rubric&rdquo; — it is &ldquo;AI grades like <em>you</em> grade,&rdquo;
              because it has learned from your corrections over time.
            </p>
          </Prose>
        </section>

        {/* Section 8 — What's Next */}
        <section>
          <SectionLabel n="08" label="What's Next" />
          <Prose>
            <p>
              ALUMOS is still very much a work in progress. The hackathon MVP proved the core
              thesis — you can build an LMS where AI is part of the main workflow, not a sidebar
              feature — but there&apos;s a lot of ground left to cover.
            </p>
          </Prose>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              {
                label: 'Near term',
                color: '#10B981',
                items: [
                  'Wire up remaining UI buttons (publish, rubric editor, AI refine)',
                  'Rich text editor for assignment instructions',
                  'Course materials — upload and organize PDFs',
                  'Student progress indicators',
                ],
              },
              {
                label: 'Medium term',
                color: '#3B82F6',
                items: [
                  'Real multi-user auth and enrollment',
                  'AI quiz generator from course materials',
                  'Teacher analytics dashboard',
                  'Calendar view with due-date awareness',
                ],
              },
              {
                label: 'Longer horizon',
                color: '#7C3AED',
                items: [
                  'LTI integrations (course import, SIS sync)',
                  'Institution-level roles and permissions',
                  'AI learning analytics for at-risk students',
                  'Open LMS ecosystem — third-party app support',
                ],
              },
              {
                label: 'The bigger bet',
                color: '#EC4899',
                items: [
                  'Teacher-trained AI grading — learns from every override and correction',
                  'A model trained on real teacher feedback data, not just a prompted LLM',
                  'Personalized study plans generated from the course calendar',
                  'A genuinely next-generation LMS — not a clone with a chatbot',
                ],
              },
            ].map(c => (
              <div
                key={c.label}
                className="rounded-2xl p-5 border"
                style={{ borderColor: 'rgba(226,232,240,0.8)' }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: c.color }}
                >
                  {c.label}
                </div>
                <ul className="space-y-2">
                  {c.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Prose>
            <p className="mt-8">
              Ideas do not wait for the roadmap. Throughout this project I kept a running
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 mx-1">ideas.txt</code>
              — a scratchpad for every feature, question, or half-formed thought that came up
              while I was supposed to be focused on something else. Once the foundation is
              solid, that file is where the next big features come from. The discipline was
              learning to write things down instead of chasing them immediately.
            </p>
            <p>
              There is still more to come. This is a living document — I&apos;ll keep updating it
              as the project grows.
            </p>
          </Prose>
        </section>

        {/* Closing */}
        <section className="border-t border-slate-100 pt-16">
          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background: GRAD }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }}
            />
            <h2
              className="relative text-3xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              A Brighter Path Through Every Class.
            </h2>
            <p className="relative text-white/80 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              ALUMOS is being built by a student who got tired of learning six different
              road maps every semester. If that sounds familiar, come try it.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-full px-8 py-3.5 font-semibold bg-white hover:scale-105 transition-transform cursor-pointer shadow-xl text-sm"
              style={{ color: '#7C3AED' }}
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <ALUMOSGradientLogo iconSize={22} />
          <p className="text-xs text-slate-400">© 2025 ALUMOS</p>
        </div>
      </footer>
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-bold text-slate-300 font-mono">{n}</span>
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{label}</span>
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 text-slate-600 leading-[1.8] text-[1.05rem]">
      {children}
    </div>
  )
}

function EtymCard({ word, origin, meaning, color }: { word: string; origin: string; meaning: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ borderColor: `${color}30`, background: `${color}08` }}
    >
      <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-syne)', color }}>
        {word}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${color}99` }}>
        {origin}
      </div>
      <div className="text-sm text-slate-600">{meaning}</div>
    </div>
  )
}
