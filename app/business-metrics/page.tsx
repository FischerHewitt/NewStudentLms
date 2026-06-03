import Link from 'next/link'
import { ALUMOSGradientLogo } from '@/components/ALUMOSGradientLogo'

const C = {
  bg: '#fcf8fa',
  card: '#ffffff',
  border: '#E2E8F0',
  purple: '#7C3AED',
  pink: '#EC4899',
  orange: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  text: '#1b1b1d',
  muted: '#64748b',
  surface: '#F8FAFC',
}

const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const GOLD_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)'

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '24px 28px',
        flex: 1,
        minWidth: 180,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800, color: accent ?? C.text, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</p>
      )}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: C.muted,
      marginBottom: 16,
    }}>
      {children}
    </p>
  )
}

export default function BusinessMetricsPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <ALUMOSGradientLogo iconSize={32} />
          <Link
            href="/"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.muted,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ← Back
          </Link>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>
          Business Metrics
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 40 }}>
          Alumos · AI-native LMS · Founded June 2026
        </p>

        {/* ── THE TRIBUTE ──────────────────────────────────────────────── */}
        <div
          style={{
            background: C.card,
            border: '2px solid #F59E0B',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 40,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gold shimmer strip */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 4,
            background: GOLD_GRADIENT,
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🏆</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Series Pre-Seed · Closed
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#10B981', color: '#fff',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  ✓ FUNDED
                </span>
              </div>

              <p style={{ fontSize: 13, color: C.muted, maxWidth: 480, lineHeight: 1.6 }}>
                Alumos closed its pre-seed round moments after opening. Oversubscribed.
                The round was open for approximately{' '}
                <span style={{ fontWeight: 700, color: C.text }}>4 minutes</span>.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
                Valuation
              </p>
              <p style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                $100
              </p>
              <p style={{ fontSize: 12, color: C.muted }}>post-money</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Capital Raised', value: '$1.00' },
              { label: 'Equity Sold', value: '1.0%' },
              { label: 'Investors', value: '1' },
              { label: 'Round Opened', value: 'Jun 2, 2026' },
              { label: 'Round Duration', value: '~4 min' },
              { label: 'Next Target', value: '$100K @ $10M' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginTop: 20, fontStyle: 'italic' }}>
            Next round implies a 99,900× step-up in valuation. Standard.
          </p>
        </div>

        {/* ── MARKET OPPORTUNITY ───────────────────────────────────────── */}
        <SectionHeader>Market Opportunity</SectionHeader>
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <StatCard label="TAM" value="$1.8B" sub="1.5M US higher-ed instructors × $1,200/yr" />
          <StatCard label="SAM" value="$216M" sub="180K instructors at tech-adopting 4-yr universities" />
          <StatCard label="SOM · Year 3" value="$2.4M" sub="2,000 instructors · 100 institutions" accent={C.purple} />
        </div>

        {/* ── GRADING SAVINGS ──────────────────────────────────────────── */}
        <SectionHeader>The Grading Crisis — and Our Answer</SectionHeader>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 40, fontWeight: 900, color: C.red }}>62%</p>
              <p style={{ fontSize: 13, color: C.muted, maxWidth: 180 }}>of teachers say grading is the <em>worst</em> part of their job</p>
            </div>
            <div>
              <p style={{ fontSize: 40, fontWeight: 900, color: C.orange }}>9.9 hrs</p>
              <p style={{ fontSize: 13, color: C.muted, maxWidth: 180 }}>per week spent grading — more than a full workday</p>
            </div>
            <div>
              <p style={{ fontSize: 40, fontWeight: 900, color: C.orange }}>32%</p>
              <p style={{ fontSize: 13, color: C.muted, maxWidth: 180 }}>have considered leaving the profession due to grading workload</p>
            </div>
          </div>

          {/* Before / After */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.red, marginBottom: 8 }}>Without Alumos</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.text }}>9.9 hrs/wk</p>
              <p style={{ fontSize: 13, color: C.muted }}>grading per instructor</p>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>$38,610/yr in instructor time</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: C.muted }}>→</div>
            <div style={{ flex: 1, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.green, marginBottom: 8 }}>With Alumos</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.text }}>~2 hrs/wk</p>
              <p style={{ fontSize: 13, color: C.muted }}>grading per instructor</p>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>$7,800/yr · <strong>80% reduction</strong></p>
            </div>
          </div>

          <div style={{
            marginTop: 20, padding: '14px 20px', borderRadius: 12,
            background: C.surface, border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: 13, color: C.text }}>
              <strong>$30,810 in recovered instructor time per teacher per year.</strong>{' '}
              <span style={{ color: C.muted }}>At 100 instructors: $3.1M/yr in institutional savings. Alumos costs $1,200/teacher/year. ROI: 25×.</span>
            </p>
          </div>
        </div>

        {/* ── REVENUE PROJECTIONS ──────────────────────────────────────── */}
        <SectionHeader>Revenue Projections</SectionHeader>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { year: '2026', label: 'Year 1', arr: '$120K', institutions: 5, instructors: 100, barPct: 5 },
              { year: '2027', label: 'Year 2', arr: '$600K', institutions: 25, instructors: 500, barPct: 25 },
              { year: '2028', label: 'Year 3', arr: '$2.4M', institutions: 100, instructors: 2000, barPct: 100 },
            ].map((row) => (
              <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 60, flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{row.label}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{row.year}</p>
                </div>
                <div style={{ flex: 1, height: 32, background: C.surface, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${row.barPct}%`,
                    background: GRADIENT,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 12,
                    minWidth: 60,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{row.arr}</span>
                  </div>
                </div>
                <div style={{ width: 160, flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: C.muted }}>{row.institutions} institutions</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{row.instructors.toLocaleString()} instructors</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 20 }}>
            Pricing: $1,200/instructor/year ($100/mo). Based on 20 instructors per institution average.
          </p>
        </div>

        {/* ── VS CANVAS ────────────────────────────────────────────────── */}
        <SectionHeader>Why Not Just Use Canvas?</SectionHeader>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 40,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surface }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Canvas</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alumos</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['AI course generation from syllabus', '✗', '✓'],
                ['AI grading with rubric scoring', '✗', '✓'],
                ['Student AI coach (per-assignment)', '✗', '✓'],
                ['Course setup time', '~2 weeks', '~2 minutes'],
                ['Grading time per assignment', '~10 min', '~1 min'],
                ['Built for AI-first workflow', '✗', '✓'],
              ].map(([feature, canvas, alumos], i) => (
                <tr
                  key={i}
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <td style={{ padding: '14px 20px', fontSize: 13, color: C.text }}>{feature}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, color: canvas === '✓' ? C.green : canvas === '✗' ? C.red : C.muted, fontWeight: 600 }}>{canvas}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, color: alumos === '✓' ? C.green : C.text, fontWeight: 700 }}>{alumos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── SECURITY ─────────────────────────────────────────────────── */}
        <SectionHeader>How We Built It Secure</SectionHeader>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '🔑',
                title: 'API keys never leave the server',
                body: 'GROQ and Supabase service keys live in server-only environment variables. Every AI call goes through a Next.js API Route or Server Action — the browser never sees a key.',
              },
              {
                icon: '🛡️',
                title: 'All writes through Server Actions',
                body: 'No client-side Supabase mutations. Every database write (submissions, grades, course structure) is gated behind a typed Server Action that runs on the server.',
              },
              {
                icon: '🧑‍⚖️',
                title: 'AI is advisory — humans approve everything',
                body: 'AI-suggested grades, feedback drafts, and generated course structure are never auto-applied. A teacher must explicitly confirm before anything is saved to the database.',
              },
              {
                icon: '🔐',
                title: 'Row-level security model designed',
                body: 'The database schema enforces a teacher/student permission boundary. Students can only read their own submissions and grades. Only teachers can approve final grades.',
              },
              {
                icon: '📭',
                title: 'No real student PII in the demo',
                body: 'The demo environment is seeded entirely with synthetic data. No real student names, emails, or submissions are used at any point in the demo loop.',
              },
              {
                icon: '✉️',
                title: 'Invite-before-access enrollment',
                body: 'Student accounts created by a teacher are marked pending until the student activates via email. Pending accounts have no session and inherit no permissions.',
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{title}</p>
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: '14px 20px', borderRadius: 12,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
          }}>
            <p style={{ fontSize: 13, color: '#1e40af', margin: 0 }}>
              <strong>On the roadmap:</strong>{' '}
              <span style={{ fontWeight: 400 }}>
                Full Supabase Auth with session tokens, Row Level Security policies enforced at the database layer, institution-level SSO, and detailed audit logs for grade changes.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>
          Alumos · AI-native LMS · Grading time statistics sourced from Learnosity (2024) and Education Week (2022)
        </p>

      </div>
    </div>
  )
}
