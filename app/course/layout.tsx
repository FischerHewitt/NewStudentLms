import { RoleProvider } from '@/context/RoleContext'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { TeacherShell } from '@/components/TeacherShell'
import { TeacherHeader } from '@/components/TeacherHeader'

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <BreadcrumbProvider>
        <TeacherShell initialCollapsed>
          <TeacherHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </TeacherShell>
      </BreadcrumbProvider>
    </RoleProvider>
  )
}
