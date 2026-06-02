// Pure grade computation functions — no Next.js or Supabase dependencies.
// All inputs are plain data; all outputs are plain data.

export type AssignmentInput = {
  id: string
  courseId: string
  title: string
  due: string | null
  points: number
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded'
  grade?: number
}

export type CourseGradeResult = {
  percentage: number
  letter: string
  gpaPoints: number
}

export type GradeWithFeedback = {
  assignmentId: string
  courseId: string
  assignmentTitle: string
  finalScore: number
  finalFeedback: string
  approvedAt: string
  pointsPossible: number
}

export type Milestone = {
  label: string
  assignmentId: string
  pointsPossible: number
  requiredPct: number
  done: boolean
}

export type CourseGradeInput = {
  courseId: string
  result: CourseGradeResult
  assignments: AssignmentInput[]
}

// Standard US letter-grade boundaries (upper-inclusive).
export function percentageToLetterGrade(pct: number): string {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 67) return 'D+'
  if (pct >= 63) return 'D'
  if (pct >= 60) return 'D-'
  return 'F'
}

// Standard 4.0 GPA scale.
export function letterGradeToGpaPoints(letter: string): number {
  const map: Record<string, number> = {
    A: 4.0, 'A-': 3.7,
    'B+': 3.3, B: 3.0, 'B-': 2.7,
    'C+': 2.3, C: 2.0, 'C-': 1.7,
    'D+': 1.3, D: 1.0, 'D-': 0.7,
    F: 0.0,
  }
  return map[letter] ?? 0.0
}

// Minimum percentage required to achieve each letter grade.
function gpaToMinPct(targetGpa: number): number {
  if (targetGpa >= 4.0) return 93
  if (targetGpa >= 3.7) return 90
  if (targetGpa >= 3.3) return 87
  if (targetGpa >= 3.0) return 83
  if (targetGpa >= 2.7) return 80
  if (targetGpa >= 2.3) return 77
  if (targetGpa >= 2.0) return 73
  if (targetGpa >= 1.7) return 70
  if (targetGpa >= 1.3) return 67
  if (targetGpa >= 1.0) return 63
  if (targetGpa >= 0.7) return 60
  return 0
}

/**
 * Computes the overall grade for a single course.
 * Only graded assignments contribute — ungraded do not affect the denominator.
 */
export function computeCourseGrade(assignments: AssignmentInput[]): CourseGradeResult {
  const graded = assignments.filter((a) => a.status === 'graded' && a.grade !== undefined)
  if (graded.length === 0) {
    return { percentage: 0, letter: 'F', gpaPoints: 0.0 }
  }

  const earned = graded.reduce((sum, a) => sum + (a.grade ?? 0), 0)
  const possible = graded.reduce((sum, a) => sum + a.points, 0)
  if (possible === 0) return { percentage: 0, letter: 'F', gpaPoints: 0.0 }

  const percentage = (earned / possible) * 100
  const letter = percentageToLetterGrade(percentage)
  return { percentage, letter, gpaPoints: letterGradeToGpaPoints(letter) }
}

/**
 * Simple unweighted average of GPA points across all courses.
 * Returns 0 when the input is empty.
 */
export function computeOverallGpa(courseGrades: CourseGradeResult[]): number {
  if (courseGrades.length === 0) return 0
  const total = courseGrades.reduce((sum, g) => sum + g.gpaPoints, 0)
  return total / courseGrades.length
}

/**
 * Returns the grade with the most-recent approved_at timestamp, or null if
 * the list is empty.
 */
export function getJustGradedAssignment(grades: GradeWithFeedback[]): GradeWithFeedback | null {
  if (grades.length === 0) return null
  return grades.reduce((latest, g) => (g.approvedAt > latest.approvedAt ? g : latest))
}

/** Returns the fraction [0, 1] of the GPA donut arc to fill. */
export function gpaToArcFraction(gpa: number): number {
  return Math.min(1, Math.max(0, gpa / 4.0))
}

/**
 * Builds a short list of milestones toward the target GPA.
 *
 * For each course currently below target, the function finds the highest-points
 * upcoming (non-graded) assignment and emits a pending milestone, plus any
 * already-graded assignment that met the required score (done milestone).
 * Milestones are sorted by pointsPossible descending (highest leverage first).
 */
export function buildPathToTarget(courses: CourseGradeInput[], targetGpa: number): Milestone[] {
  const requiredPct = gpaToMinPct(targetGpa)
  const milestones: Milestone[] = []

  for (const { result, assignments } of courses) {
    // Already meeting the target for this course — show a done milestone for the
    // highest-point graded assignment that cleared the bar.
    if (result.gpaPoints >= targetGpa) {
      const doneCandidates = assignments
        .filter(
          (a) =>
            a.status === 'graded' &&
            a.grade !== undefined &&
            a.points > 0 &&
            (a.grade / a.points) * 100 >= requiredPct,
        )
        .sort((a, b) => b.points - a.points)

      if (doneCandidates.length > 0) {
        const top = doneCandidates[0]
        milestones.push({
          label: `${top.title} (Done)`,
          assignmentId: top.id,
          pointsPossible: top.points,
          requiredPct,
          done: true,
        })
      }
      continue
    }

    // Course is below target — find the highest-points upcoming assignment.
    const upcoming = assignments
      .filter((a) => a.status !== 'graded')
      .sort((a, b) => b.points - a.points)

    if (upcoming.length > 0) {
      const top = upcoming[0]
      milestones.push({
        label: `${top.title} > ${Math.round(requiredPct)}%`,
        assignmentId: top.id,
        pointsPossible: top.points,
        requiredPct,
        done: false,
      })
    }
  }

  return milestones.sort((a, b) => b.pointsPossible - a.pointsPossible)
}
