export type CourseMetadataInput = {
  title: string
  term?: string
  section?: string
  start_date?: string
  end_date?: string
}

type ValidationResult = { ok: true } | { ok: false; error: string }

export function validateCourseMetadata(input: CourseMetadataInput): ValidationResult {
  if (!input.title.trim()) {
    return { ok: false, error: 'Title is required' }
  }
  if (input.start_date && input.end_date && input.end_date < input.start_date) {
    return { ok: false, error: 'End date must be on or after start date' }
  }
  return { ok: true }
}

// ISO date only (YYYY-MM-DD) — strips anything that isn't a digit or hyphen
// before interpolating into the AI prompt, preventing prompt injection via start_date.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function syllabusTextForPrompt(syllabus: string): string {
  return syllabus
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|h1|h2|h3|li|tr|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/td>/gi, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function buildGeneratePrompt(syllabus: string, startDate: string | null): string {
  const safeDate = startDate && ISO_DATE_RE.test(startDate.trim()) ? startDate.trim() : null
  const dateInstruction = safeDate
    ? `The course starts on ${safeDate}. Week 1 begins that date — anchor all due dates from there.\n\n`
    : ''
  return `${dateInstruction}Here is the course syllabus. Extract the full course structure:\n\n${syllabusTextForPrompt(syllabus)}`
}
