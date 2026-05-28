import { z } from 'zod'

export const rubricCriterionSchema = z.object({
  description: z.string().describe('What the criterion measures'),
  points: z.number().describe('Points allocated to this criterion'),
})

export const assignmentSchema = z.object({
  title: z.string().describe('Short assignment title'),
  instructions: z.string().describe('Full assignment instructions for the student'),
  due_date: z
    .string()
    .nullable()
    .describe('ISO date string (YYYY-MM-DD) or null if not specified'),
  points_possible: z.number().describe('Total points for this assignment'),
  rubric: z.object({
    criteria: z.array(rubricCriterionSchema).describe('2-4 grading criteria'),
  }),
})

export const moduleSchema = z.object({
  title: z.string().describe('Module or week title'),
  week_number: z.number().describe('Week number (1-based)'),
  description: z.string().describe('Brief overview of the module content'),
  assignments: z.array(assignmentSchema),
})

export const coursePreviewSchema = z.object({
  title: z.string().describe('Full course title'),
  modules: z.array(moduleSchema),
})

export type CoursePreview = z.infer<typeof coursePreviewSchema>
export type ModulePreview = z.infer<typeof moduleSchema>
export type AssignmentPreview = z.infer<typeof assignmentSchema>
export type RubricCriterion = z.infer<typeof rubricCriterionSchema>
