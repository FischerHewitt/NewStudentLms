import { z } from 'zod'

export const rubricCriterionSchema = z.object({
  description: z.string().describe('What the criterion measures'),
  points: z.number().describe('Points allocated to this criterion'),
})

export const contentBlockSchema = z.object({
  id: z.string(),
  kind: z.enum(['text', 'math', 'download']),
  label: z.string(),
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
  content_blocks: z
    .array(contentBlockSchema)
    .optional()
    .describe('Ordered content blocks shown to the student; synthesized from instructions when absent'),
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
export type ContentBlock = z.infer<typeof contentBlockSchema>
export type BlockKind = ContentBlock['kind']
