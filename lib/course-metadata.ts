export type CourseMetadataInput = {
  title: string
  term?: string
  section?: string
  start_date?: string
  end_date?: string
}

export type CourseDurationInput = {
  weeks: number
  days: number
}

export type CourseMetadataHints = {
  start_date?: string
  end_date?: string
  duration?: CourseDurationInput
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

function dateFromIso(date: string): Date | null {
  if (!ISO_DATE_RE.test(date)) return null
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function dateToIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

function parseInstructionDate(value: string, referenceYear: number): string | null {
  const trimmed = value
    .trim()
    .replace(/^(mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\b[,]?\s*/i, '')

  const iso = trimmed.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  if (iso) return iso[1]

  const slash = trimmed.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
  if (slash) {
    const month = Number(slash[1])
    const day = Number(slash[2])
    const rawYear = slash[3] ? Number(slash[3]) : referenceYear
    const year = rawYear < 100 ? 2000 + rawYear : rawYear
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return dateToIso(new Date(Date.UTC(year, month - 1, day)))
    }
  }

  const monthName = trimmed.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i,
  )
  if (monthName) {
    const month = MONTHS[monthName[1].toLowerCase().replace(/\.$/, '')]
    const day = Number(monthName[2])
    const year = monthName[3] ? Number(monthName[3]) : referenceYear
    if (month != null && day >= 1 && day <= 31) {
      return dateToIso(new Date(Date.UTC(year, month, day)))
    }
  }

  return null
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function totalCourseDurationDays(duration: CourseDurationInput): number {
  return Math.max(0, duration.weeks) * 7 + Math.max(0, duration.days)
}

export function addCourseDurationToStartDate(
  startDate: string,
  duration: CourseDurationInput,
): string | null {
  const start = dateFromIso(startDate)
  if (!start) return null
  start.setUTCDate(start.getUTCDate() + totalCourseDurationDays(duration))
  return dateToIso(start)
}

export function subtractCourseDurationFromEndDate(
  endDate: string,
  duration: CourseDurationInput,
): string | null {
  const end = dateFromIso(endDate)
  if (!end) return null
  end.setUTCDate(end.getUTCDate() - totalCourseDurationDays(duration))
  return dateToIso(end)
}

export function courseDurationBetweenDates(
  startDate: string,
  endDate: string,
): CourseDurationInput | null {
  const start = dateFromIso(startDate)
  const end = dateFromIso(endDate)
  if (!start || !end || end < start) return null

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  }
}

export function extractCourseMetadataHintsFromInstructions(
  instructions: string,
  referenceYear = new Date().getFullYear(),
): CourseMetadataHints {
  const hints: CourseMetadataHints = {}

  const duration = instructions.match(
    /(?:course\s+)?(?:length|duration)\s*(?:is|:)?\s*(\d+)\s*(?:weeks?|wks?)(?:\s*(?:and)?\s*(\d+)\s*(?:days?|d))?/i,
  ) ?? instructions.match(
    /\b(\d+)\s*(?:weeks?|wks?)(?:\s*(?:and)?\s*(\d+)\s*(?:days?|d))?\b/i,
  )
  if (duration) {
    hints.duration = {
      weeks: Number(duration[1]),
      days: duration[2] ? Math.min(Number(duration[2]), 6) : 0,
    }
  }

  const lines = instructions.split(/\r?\n/)
  for (const line of lines) {
    const start = line.match(/\b(?:set\s+the\s+)?(?:course\s+)?(?:start|starts|begin|begins)(?:\s+date)?\b\s*(?:on|to|is|:)?\s*(.+)$/i)
    if (start && !hints.start_date) {
      const parsed = parseInstructionDate(start[1], referenceYear)
      if (parsed) hints.start_date = parsed
    }

    const end = line.match(/\b(?:set\s+the\s+)?(?:course\s+)?(?:end|ends|finish|finishes)(?:\s+date)?\b\s*(?:on|to|is|:)?\s*(.+)$/i)
    if (end && !hints.end_date) {
      const parsed = parseInstructionDate(end[1], referenceYear)
      if (parsed) hints.end_date = parsed
    }
  }

  return hints
}

export function rescheduleDateForCourseRange(
  dueDate: string | null,
  previous: Pick<CourseMetadataInput, 'start_date' | 'end_date'>,
  next: Pick<CourseMetadataInput, 'start_date' | 'end_date'>,
): string | null {
  if (!dueDate) return dueDate
  const due = dateFromIso(dueDate)
  if (!due) return dueDate

  const previousStart = previous.start_date ? dateFromIso(previous.start_date) : null
  const previousEnd = previous.end_date ? dateFromIso(previous.end_date) : null
  const nextStart = next.start_date ? dateFromIso(next.start_date) : null
  const nextEnd = next.end_date ? dateFromIso(next.end_date) : null

  if (previousStart && previousEnd && nextStart && nextEnd) {
    const previousSpan = daysBetween(previousStart, previousEnd)
    const nextSpan = daysBetween(nextStart, nextEnd)
    if (previousSpan > 0 && nextSpan >= 0) {
      const dueOffset = daysBetween(previousStart, due)
      const nextOffset = Math.round((dueOffset / previousSpan) * nextSpan)
      return dateToIso(addDays(nextStart, nextOffset))
    }
  }

  if (previousStart && nextStart) {
    return dateToIso(addDays(due, daysBetween(previousStart, nextStart)))
  }

  if (previousEnd && nextEnd) {
    return dateToIso(addDays(due, daysBetween(previousEnd, nextEnd)))
  }

  return dueDate
}

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

export function buildGeneratePrompt(syllabus: string, startDate: string | null, instructions?: string | null): string {
  const safeDate = startDate && ISO_DATE_RE.test(startDate.trim()) ? startDate.trim() : null
  const dateInstruction = safeDate
    ? `The course starts on ${safeDate}. Week 1 begins that date — anchor all due dates from there.\n\n`
    : ''
  const teacherInstructions = instructions?.trim()
    ? `Teacher instructions (requirements for the generated draft; preserve these when deciding course length, module count, due dates, assignment style, and page simplicity):\n${syllabusTextForPrompt(instructions)}\n\n`
    : ''
  return `${dateInstruction}${teacherInstructions}Here is the course syllabus or course source material. Extract the full course structure:\n\n${syllabusTextForPrompt(syllabus)}`
}
