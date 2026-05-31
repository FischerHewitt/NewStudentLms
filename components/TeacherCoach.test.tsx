import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TeacherCoachPanel, TeacherAiFab } from './TeacherCoach'

describe('TeacherCoachPanel', () => {
  it('renders the Teacher Coach with the default greeting for teachers', () => {
    const html = renderToStaticMarkup(<TeacherCoachPanel role="teacher" />)

    expect(html).toContain('Teacher Coach')
    expect(html).toContain('What do you need help with?')
    expect(html).toContain('/api/teacher-coach')
  })

  it('does not render the Teacher Coach for students', () => {
    const html = renderToStaticMarkup(<TeacherCoachPanel role="student" />)

    expect(html).toBe('')
  })
})

// ─── #68 TeacherAiFab ─────────────────────────────────────────────────────────

describe('#68 TeacherAiFab', () => {
  it('renders a FAB button with accessible label for the AI assistant', () => {
    const html = renderToStaticMarkup(<TeacherAiFab />)
    expect(html).toContain('Open AI assistant')
  })

  it('renders the unread badge on the FAB', () => {
    const html = renderToStaticMarkup(<TeacherAiFab />)
    expect(html).toContain('1')
  })

  it('renders the Luminous Intelligence heading when defaultOpen is true', () => {
    const html = renderToStaticMarkup(<TeacherAiFab defaultOpen />)
    expect(html).toContain('Luminous Intelligence')
  })

  it('renders the chat input when defaultOpen is true', () => {
    const html = renderToStaticMarkup(<TeacherAiFab defaultOpen />)
    expect(html).toContain('/api/teacher-coach')
  })

  it('does not render chat panel when closed (default state)', () => {
    const html = renderToStaticMarkup(<TeacherAiFab />)
    expect(html).not.toContain('Luminous Intelligence')
  })
})
