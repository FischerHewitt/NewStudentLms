export const courseHref = (courseId: string) => `/course/${courseId}`

export const assignmentHref = (courseId: string, assignmentId: string) =>
  `/course/${courseId}/assignment/${assignmentId}`

export const speedgraderHref = (courseId: string, submissionId: string) =>
  `/course/${courseId}/speedgrader/${submissionId}`
