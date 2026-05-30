import { describe, expect, it } from 'vitest'
import { buildStudentCoachSystemPrompt } from '@/lib/student-coach'

const BASE = {
  assignmentTitle: 'Connect Homework 1',
  instructions: 'Explain the scientific method and compare prokaryotic vs eukaryotic cells.',
}

describe('buildStudentCoachSystemPrompt — behavioral policy', () => {
  it('encodes the pure Socratic rule: never explain, only ask', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions)
    expect(prompt).toMatch(/never explain/i)
    expect(prompt).toMatch(/ask/i)
  })

  it('encodes the no-draft-evaluation rule: reflect rubric back as question', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions)
    expect(prompt).toMatch(/never evaluate/i)
    expect(prompt).toMatch(/rubric criteria do you think you've addressed/i)
  })

  it('encodes the soft-redirect rule: decline warmly then ask a question', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions)
    expect(prompt).toMatch(/write.{0,30}answer/i)
    expect(prompt).toMatch(/always end with a question/i)
  })

  it('encodes the strict-scope rule: redirect off-topic questions back to the assignment', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions)
    expect(prompt).toMatch(/strict assignment scope/i)
    expect(prompt).toContain(BASE.assignmentTitle)
  })
})

describe('buildStudentCoachSystemPrompt — context embedding', () => {
  it('embeds the assignment title', () => {
    const prompt = buildStudentCoachSystemPrompt('My Custom Title', BASE.instructions)
    expect(prompt).toContain('My Custom Title')
  })

  it('includes rubric block when criteria are provided', () => {
    const criteria = [
      { description: 'Scientific method', points: 3 },
      { description: 'Cell types', points: 2 },
    ]
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions, criteria)
    expect(prompt).toContain('Scientific method (3 pts)')
    expect(prompt).toContain('Cell types (2 pts)')
  })

  it('omits rubric block when no criteria provided', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions, [])
    expect(prompt).not.toContain('Rubric criteria')
  })

  it('includes draft block when student draft is provided', () => {
    const prompt = buildStudentCoachSystemPrompt(
      BASE.assignmentTitle,
      BASE.instructions,
      undefined,
      'My draft text here',
    )
    expect(prompt).toContain('My draft text here')
  })

  it('omits draft block when draft is empty', () => {
    const prompt = buildStudentCoachSystemPrompt(BASE.assignmentTitle, BASE.instructions, undefined, '')
    expect(prompt).not.toContain("Student's current draft")
  })
})
