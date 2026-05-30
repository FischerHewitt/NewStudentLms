export type CourseStatus = 'draft' | 'published'
export type ResourceType = 'file' | 'link'
export type UserStatus = 'pending' | 'active'

const COURSE_STATUSES: ReadonlySet<string> = new Set<CourseStatus>(['draft', 'published'])
const RESOURCE_TYPES: ReadonlySet<string> = new Set<ResourceType>(['file', 'link'])
const USER_STATUSES: ReadonlySet<string> = new Set<UserStatus>(['pending', 'active'])

export const validateCourseStatus = (v: string): v is CourseStatus => COURSE_STATUSES.has(v)
export const validateResourceType = (v: string): v is ResourceType => RESOURCE_TYPES.has(v)
export const validateUserStatus = (v: string): v is UserStatus => USER_STATUSES.has(v)
