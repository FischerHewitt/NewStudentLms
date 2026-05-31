import { RoleProvider } from '@/context/RoleContext'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'
import { TeacherShell } from '@/components/TeacherShell'
import { TeacherHeader } from '@/components/TeacherHeader'
import { TeacherAiFab } from '@/components/TeacherCoach'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <BreadcrumbProvider>
        <TeacherShell>
          <TeacherHeader />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </TeacherShell>
      </BreadcrumbProvider>
      <TeacherAiFab />
    </RoleProvider>
  )
}
