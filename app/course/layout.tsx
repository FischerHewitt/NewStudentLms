import { RoleProvider } from '@/context/RoleContext'
import { CourseRouteChrome } from '@/components/CourseRouteChrome'

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <CourseRouteChrome>{children}</CourseRouteChrome>
    </RoleProvider>
  )
}
