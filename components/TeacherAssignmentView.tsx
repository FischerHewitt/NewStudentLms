'use client'

import { useState } from 'react'
import Link from 'next/link'
import { speedgraderHref } from '@/lib/routes'
import type { AssignmentWithDetails, SubmissionData } from '@/app/actions/assignment'

const C = {
  surface: '#F8FAFC',
  card: '#ffffff',
  border: '#E2E8F0',
  text: '#1b1b1d',
  muted: '#64748b',
  purple: '#7C3AED',
  orange: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
}
const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'
const AVATAR_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444']

interface Props {
  courseId: string
  assignment: AssignmentWithDetails
  allSubmissions: SubmissionData[]
}

export function TeacherAssignmentView({ courseId, assignment, allSubmissions }: Props) {
  const [chatInput, setChatInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const criteria = assignment.rubric?.criteria ?? []
  const submitted = allSubmissions.filter((s) => s.status === 'submitted' || s.status === 'graded')
  const scoredSubs = allSubmissions.filter((s) => s.finalScore != null)
  const classAvgPct =
    scoredSubs.length > 0 && assignment.points_possible > 0
      ? Math.round(
          scoredSubs.reduce((acc, s) => {
            return acc + ((s.finalScore ?? 0) / assignment.points_possible) * 100
          }, 0) / scoredSubs.length,
        )
      : null

  const timeRemaining = (() => {
    if (!assignment.due_date) return '—'
    const diff = new Date(assignment.due_date).getTime() - Date.now()
    if (diff < 0) return 'Overdue'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `${days} Day${days !== 1 ? 's' : ''}`
    if (hours > 0) return `${hours}h`
    return 'Due soon'
  })()

  const isOverdue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false
  const isActive = !isOverdue && !!assignment.due_date

  const scoreLabel = (sub: SubmissionData): string => {
    if (sub.finalScore == null) return '—'
    if (assignment.points_possible > 0) {
      return `${Math.round((sub.finalScore / assignment.points_possible) * 100)}%`
    }
    return `${sub.finalScore} pts`
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  const getAvatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const lowScorers = allSubmissions.filter((s) => {
    return s.finalScore != null && assignment.points_possible > 0 && s.finalScore / assignment.points_possible < 0.6
  })

  const dueDateLabel = assignment.due_date
    ? new Date(assignment.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <div style={{ background: C.surface, minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 20,
                background: isActive ? 'rgba(16,185,129,0.1)' : '#f0edef',
                color: isActive ? C.green : C.muted,
                border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : C.border}`,
              }}>
                {isActive ? '● Active' : isOverdue ? 'Overdue' : 'Draft'}
              </span>
              {dueDateLabel && (
                <span style={{ fontSize: 13, color: C.muted }}>Due: {dueDateLabel}</span>
              )}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2 }}>
              {assignment.title}
            </h1>
          </div>
          <button
            onClick={() => setIsEditing((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              border: `1px solid ${isEditing ? C.purple : C.border}`,
              background: isEditing ? `${C.purple}10` : C.card,
              borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500,
              color: isEditing ? C.purple : C.text, cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
              {isEditing ? 'close' : 'edit'}
            </span>
            {isEditing ? 'Done Editing' : 'Quick Edit'}
          </button>
        </div>

        {/* EDIT MODE */}
        {isEditing && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
            {/* Left: Core Settings + Rubric */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Core Settings */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: '0 0 18px' }}>Core Settings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>Assignment Title</label>
                    <input
                      type="text"
                      defaultValue={assignment.title}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        border: `1px solid ${C.border}`, background: C.surface, color: C.text, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Description &amp; Prompt</label>
                      <button style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
                        Refine with AI
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
                        defaultValue={assignment.instructions}
                        rows={7}
                        style={{ width: '100%', padding: 14, fontSize: 13, color: C.text, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>Points Possible</label>
                      <input
                        type="number"
                        defaultValue={assignment.points_possible}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, border: `1px solid ${C.border}`, background: C.surface, color: C.text, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 6 }}>Due Date</label>
                      <input
                        type="text"
                        defaultValue={assignment.due_date ?? '—'}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, border: `1px solid ${C.border}`, background: C.surface, color: C.text, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Rubric */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted }}>fact_check</span>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>Evaluation Rubric</p>
                  </div>
                  <button style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Add
                  </button>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {criteria.length === 0 ? (
                    <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>No rubric criteria defined.</p>
                  ) : (
                    criteria.map((c, i) => (
                      <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0, flex: 1 }}>{c.description}</p>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: '#f0edef', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{c.points} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: AI Co-Pilot */}
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: GRADIENT }} />
                <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple }}>smart_toy</span>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>AI Co-Pilot</p>
                  </div>
                </div>
                <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Grade prediction */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>Grade Prediction</span>
                      <span style={{ fontSize: 20, fontWeight: 700, background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {classAvgPct != null ? `${classAvgPct}%` : '—'}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: '#e4e2e4', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${classAvgPct ?? 0}%`, borderRadius: 99, background: GRADIENT }} />
                    </div>
                  </div>
                  {/* Insight */}
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple, flexShrink: 0 }}>lightbulb</span>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                      {lowScorers.length > 0
                        ? `${lowScorers.length} student${lowScorers.length !== 1 ? 's are' : ' is'} currently below 60%.`
                        : 'Students may struggle with this topic based on past submission patterns.'}
                    </p>
                  </div>
                  <button style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: `${C.purple}1a`, color: C.purple, cursor: 'pointer' }}>
                    View Full AI Analysis
                  </button>
                  {/* Chat */}
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: '0 0 12px' }}>Chat</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'white' }}>smart_toy</span>
                      </div>
                      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0 10px 10px 10px', padding: '10px 14px', fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                        <strong style={{ fontWeight: 600 }}>AI Suggestion:</strong> Consider adding a sentence requiring students to cite at least three secondary scholarly sources.
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: 'none', background: GRADIENT, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>done</span>Accept
                          </button>
                          <button style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', fontSize: 12, color: C.muted, cursor: 'pointer' }}>Dismiss</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 99, padding: '8px 14px', marginTop: 12, gap: 8 }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask AI to refine..."
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
        )}

        {/* VIEW MODE (monitoring) */}
        {!isEditing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <StatCard
                label="Submissions"
                value={`${submitted.length}`}
                suffix={`/${allSubmissions.length || '—'}`}
                icon="description"
                iconColor={C.muted}
              />
              <StatCard
                label="Class Avg"
                value={classAvgPct != null ? `${classAvgPct}%` : '—'}
                icon="bar_chart"
                iconColor={C.purple}
              />
              <StatCard
                label="Time Remaining"
                value={timeRemaining}
                icon="schedule"
                iconColor={C.orange}
                valueColor={isOverdue ? C.red : C.text}
              />
            </div>

            {/* Student View Preview */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, background: '#f0edef',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.muted }}>description</span>
                  </div>
                  <span style={{
                    position: 'absolute', bottom: -4, right: -4,
                    background: '#ef4444', color: 'white', fontSize: 7, fontWeight: 800,
                    padding: '1px 4px', borderRadius: 3, letterSpacing: '0.03em',
                  }}>PDF</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>Student View Preview</p>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>PDF</span>
                  </div>
                  <p style={{
                    fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {assignment.instructions}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Class Pulse */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <GradientIcon icon="auto_awesome" size={15} />
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>AI Class Pulse</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.orange }}>warning</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 3px' }}>
                    {lowScorers.length > 0
                      ? `Struggling — ${lowScorers.length} student${lowScorers.length !== 1 ? 's' : ''} below 60%`
                      : submitted.length > 0
                        ? 'Submissions are coming in'
                        : 'No submissions yet'}
                  </p>
                  <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px', lineHeight: 1.5 }}>
                    {lowScorers.length > 0
                      ? `${lowScorers.length} student${lowScorers.length !== 1 ? 's are' : ' is'} showing weak performance on current submissions.`
                      : submitted.length > 0
                        ? `${submitted.length} of ${allSubmissions.length} students have submitted so far.`
                        : 'Check back once students begin submitting.'}
                  </p>
                  <button style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: C.purple, cursor: 'pointer' }}>
                    View Affected Students →
                  </button>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Student Submissions</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconButton icon="filter_list" />
                  <IconButton icon="search" />
                </div>
              </div>

              {/* Table head */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px',
                padding: '8px 20px', borderBottom: `1px solid ${C.border}`,
                background: '#fafafa',
              }}>
                {['Student', 'Status', 'Score', 'Action'].map((h) => (
                  <p key={h} style={{ fontSize: 11, fontWeight: 600, color: C.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</p>
                ))}
              </div>

              {allSubmissions.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>No submissions yet.</p>
                </div>
              ) : (
                allSubmissions.map((sub, i) => {
                  const score = scoreLabel(sub)
                  const isLast = i === allSubmissions.length - 1
                  return (
                    <div key={sub.id} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px',
                      padding: '12px 20px', alignItems: 'center',
                      borderBottom: isLast ? undefined : `1px solid ${C.border}`,
                    }}>
                      {/* Student */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: getAvatarColor(sub.studentName),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 11, fontWeight: 700,
                        }}>
                          {getInitials(sub.studentName)}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{sub.studentName}</span>
                      </div>

                      {/* Status */}
                      <StatusPill status={sub.status} />

                      {/* Score — only show if actually graded */}
                      <span style={{
                        fontSize: 14,
                        fontWeight: sub.finalScore != null ? 600 : 400,
                        color: sub.finalScore != null ? C.text : C.muted,
                      }}>
                        {score}
                      </span>

                      {/* Action */}
                      {sub.status === 'draft' ? (
                        <Link href={speedgraderHref(courseId, sub.id)} style={{
                          fontSize: 12, fontWeight: 500, color: C.text,
                          border: `1px solid ${C.border}`, borderRadius: 6,
                          padding: '5px 10px', textDecoration: 'none', textAlign: 'center',
                        }}>
                          View Draft
                        </Link>
                      ) : (
                        <Link href={speedgraderHref(courseId, sub.id)} style={{
                          fontSize: 12, fontWeight: 700, color: 'white',
                          background: C.orange, borderRadius: 6,
                          padding: '5px 10px', textDecoration: 'none', textAlign: 'center',
                        }}>
                          Review
                        </Link>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Rubric Criteria */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>Rubric Criteria</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{assignment.points_possible} pts total</p>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted, cursor: 'pointer' }}>more_horiz</span>
              </div>

              {criteria.length === 0 ? (
                <p style={{ padding: '16px 18px', fontSize: 13, color: C.muted, margin: 0 }}>No rubric defined.</p>
              ) : (
                criteria.map((c, i) => (
                  <div key={i} style={{
                    padding: '14px 18px',
                    borderBottom: i < criteria.length - 1 ? `1px solid ${C.border}` : undefined,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.3 }}>{c.description}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{c.points} pts</span>
                    </div>
                  </div>
                ))
              )}

              <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}` }}>
                <button style={{
                  width: '100%', padding: '9px', border: `1px solid ${C.border}`,
                  background: 'transparent', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  color: C.text, cursor: 'pointer',
                }}>
                  Edit Rubric
                </button>
              </div>
            </div>

            {/* AI Teaching Assistant */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: GRADIENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'white' }}>smart_toy</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>AI Teaching Assistant</p>
                </div>
              </div>

              <div style={{ padding: '16px 18px', minHeight: 140 }}>
                {/* AI bubble */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: GRADIENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'white' }}>smart_toy</span>
                  </div>
                  <div style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: '0 10px 10px 10px', padding: '10px 14px',
                    fontSize: 13, color: C.text, lineHeight: 1.55,
                  }}>
                    {submitted.length > 0
                      ? `${submitted.length} submission${submitted.length !== 1 ? 's' : ''} received. Would you like me to run a class analysis?`
                      : "No submissions yet. I'll surface patterns once students start submitting."}
                  </div>
                </div>
              </div>

              {/* Input */}
              <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI Coach"
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: C.text, outline: 'none' }}
                />
                <button style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: C.purple }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                </button>
              </div>
            </div>

          </div>
        </div>
        )}

      </div>
    </div>
  )
}

function StatCard({
  label, value, suffix, icon, iconColor, iconGradient, valueColor,
}: {
  label: string
  value: string
  suffix?: string
  icon: string
  iconColor?: string
  iconGradient?: string
  valueColor?: string
}) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 11, color: C.muted, margin: '0 0 10px', fontWeight: 500 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: valueColor ?? C.text, margin: 0, lineHeight: 1 }}>
          {value}
          {suffix && <span style={{ fontSize: 15, color: C.muted, fontWeight: 400 }}>{suffix}</span>}
        </p>
        {iconGradient ? (
          <GradientIcon icon={icon} size={22} />
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: iconColor ?? C.muted }}>{icon}</span>
        )}
      </div>
    </div>
  )
}

function GradientIcon({ icon, size }: { icon: string; size: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        background: GRADIENT,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {icon}
    </span>
  )
}

function IconButton({ icon }: { icon: string }) {
  return (
    <button style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: C.muted, display: 'flex' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )
}

function StatusPill({ status }: { status: 'draft' | 'submitted' | 'graded' }) {
  if (status === 'submitted') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '3px 10px', borderRadius: 20 }}>
        Submitted
      </span>
    )
  }
  if (status === 'graded') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: 20 }}>
        Graded
      </span>
    )
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f0edef', padding: '3px 10px', borderRadius: 20 }}>
      In Progress
    </span>
  )
}
