const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEnrollmentEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export function parseEnrollmentEmails(input: string): string[] {
  const raw = input.split(/[\n,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean)
  const seen = new Set<string>()
  return raw.filter((e) => {
    if (!validateEnrollmentEmail(e)) return false
    if (seen.has(e)) return false
    seen.add(e)
    return true
  })
}
