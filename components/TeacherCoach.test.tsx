import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TeacherCoachPanel } from './TeacherCoach'

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
