export type UpcomingDeadline = {
  assignmentTitle: string
  courseName: string
  dueAt: string
  daysUntilDue: number
}

type DeadlineInput = {
  title: string
  courseName: string
  dueAt: string | null
}

function utcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function filterAndSortDeadlines(
  assignments: DeadlineInput[],
  now: Date,
  limit = 5,
): UpcomingDeadline[] {
  const todayMs = utcDayMs(now)

  return assignments
    .filter((a): a is DeadlineInput & { dueAt: string } => {
      if (a.dueAt === null) return false
      return utcDayMs(new Date(a.dueAt)) >= todayMs
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, limit)
    .map((a) => ({
      assignmentTitle: a.title,
      courseName: a.courseName,
      dueAt: a.dueAt,
      daysUntilDue: Math.round((utcDayMs(new Date(a.dueAt)) - todayMs) / (1000 * 60 * 60 * 24)),
    }))
}
