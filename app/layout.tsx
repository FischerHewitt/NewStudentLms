import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RoleProvider } from '@/context/RoleContext'
import { Header } from '@/components/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI-Native LMS',
  description: 'The LMS rebuilt for the AI era',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <RoleProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </RoleProvider>
      </body>
    </html>
  )
}
