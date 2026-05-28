import { describe, it, expect } from 'vitest'
import { explodeCoursePreview, type CoursePreview } from '../course-generator'

const VALID_PREVIEW: CoursePreview = {
  title: 'Introduction to Computer Science',
  modules: [
    {
      title: 'Week 1: Foundations',
      week_number: 1,
      description: 'Core concepts and setup',
      assignments: [
        {
          title: 'Hello World Exercise',
          instructions: 'Write a program that prints Hello World.',
          due_date: '2026-09-07',
          points_possible: 10,
          rubric: {
            criteria: [
              { description: 'Program runs without errors', points: 5 },
              { description: 'Output matches expected', points: 5 },
            ],
          },
        },
      ],
    },
    {
      title: 'Week 2: Variables',
      week_number: 2,
      description: 'Types and variables',
      assignments: [
        {
          title: 'Variable Quiz',
          instructions: 'Answer all questions about variable types.',
          due_date: '2026-09-14',
          points_possible: 20,
          rubric: {
            criteria: [
              { description: 'Correct answer for each question', points: 20 },
            ],
          },
        },
        {
          title: 'Type Conversion Exercise',
          instructions: 'Convert between int and string types.',
          due_date: '2026-09-14',
          points_possible: 15,
          rubric: { criteria: [] },
        },
      ],
    },
  ],
}

describe('explodeCoursePreview', () => {
  it('returns the correct course title', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.title).toBe('Introduction to Computer Science')
  })

  it('produces one ModuleRow per module', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.modules).toHaveLength(2)
  })

  it('assigns sequential order to modules', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.modules[0].order).toBe(0)
    expect(result.modules[1].order).toBe(1)
  })

  it('preserves week_number on modules', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.modules[0].week_number).toBe(1)
    expect(result.modules[1].week_number).toBe(2)
  })

  it('produces one AssignmentRow per assignment across all modules', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.assignments).toHaveLength(3)
  })

  it('each AssignmentRow carries the correct moduleIndex', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.assignments[0].moduleIndex).toBe(0) // Week 1 assignment
    expect(result.assignments[1].moduleIndex).toBe(1) // Week 2, first
    expect(result.assignments[2].moduleIndex).toBe(1) // Week 2, second
  })

  it('produces one RubricRow per assignment', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.rubrics).toHaveLength(3)
  })

  it('each RubricRow carries the correct assignmentIndex', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.rubrics[0].assignmentIndex).toBe(0)
    expect(result.rubrics[1].assignmentIndex).toBe(1)
    expect(result.rubrics[2].assignmentIndex).toBe(2)
  })

  it('preserves rubric criteria', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.rubrics[0].criteria).toHaveLength(2)
    expect(result.rubrics[0].criteria[0].points).toBe(5)
  })

  it('handles missing rubric criteria gracefully — returns empty array', () => {
    const result = explodeCoursePreview(VALID_PREVIEW)
    expect(result.rubrics[2].criteria).toEqual([])
  })

  it('handles a module with no assignments', () => {
    const preview: CoursePreview = {
      title: 'Empty Course',
      modules: [{ title: 'Intro', week_number: 1, description: '', assignments: [] }],
    }
    const result = explodeCoursePreview(preview)
    expect(result.modules).toHaveLength(1)
    expect(result.assignments).toHaveLength(0)
    expect(result.rubrics).toHaveLength(0)
  })

  it('defaults to "Untitled Course" when title is missing', () => {
    const preview = { modules: [] } as unknown as CoursePreview
    const result = explodeCoursePreview(preview)
    expect(result.title).toBe('Untitled Course')
  })

  it('defaults points_possible to 100 when missing', () => {
    const preview: CoursePreview = {
      title: 'Test',
      modules: [
        {
          title: 'M1',
          week_number: 1,
          description: '',
          assignments: [
            {
              title: 'A1',
              instructions: '',
              due_date: null,
              points_possible: undefined as unknown as number,
              rubric: { criteria: [] },
            },
          ],
        },
      ],
    }
    const result = explodeCoursePreview(preview)
    expect(result.assignments[0].points_possible).toBe(100)
  })

  it('handles null due_date', () => {
    const preview: CoursePreview = {
      title: 'Test',
      modules: [
        {
          title: 'M1',
          week_number: 1,
          description: '',
          assignments: [
            { title: 'A1', instructions: '', due_date: null, points_possible: 10, rubric: { criteria: [] } },
          ],
        },
      ],
    }
    const result = explodeCoursePreview(preview)
    expect(result.assignments[0].due_date).toBeNull()
  })
})
