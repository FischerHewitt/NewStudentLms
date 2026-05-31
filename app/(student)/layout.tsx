import { RoleProvider } from '@/context/RoleContext'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      {children}
    </RoleProvider>
  )
}
