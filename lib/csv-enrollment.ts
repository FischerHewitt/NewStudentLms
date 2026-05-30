import { validateEnrollmentEmail } from '@/lib/enrollment'

export type CsvParseResult = {
  valid: string[]
  invalid: string[]
  skipped: number
}

export function parseCsvEnrollment(csvText: string): CsvParseResult {
  const lines = csvText.split('\n')
  const valid: string[] = []
  const invalid: string[] = []
  let skipped = 0
  const seen = new Set<string>()

  for (const line of lines) {
    const raw = line.trim()

    // Blank lines are silently skipped
    if (!raw) {
      skipped++
      continue
    }

    // Extract first column (handles both bare email and CSV rows)
    const firstCol = raw.split(',')[0].trim().toLowerCase()

    // Skip header rows
    if (firstCol === 'email') continue

    if (!validateEnrollmentEmail(firstCol)) {
      invalid.push(firstCol)
      continue
    }

    if (seen.has(firstCol)) continue
    seen.add(firstCol)
    valid.push(firstCol)
  }

  return { valid, invalid, skipped }
}
