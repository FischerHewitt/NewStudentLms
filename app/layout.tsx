import type { Metadata } from 'next'
import { Syne, DM_Sans, Hanken_Grotesk, Inter } from 'next/font/google'
import './globals.css'

// Root layout: bare html/body shell + fonts only.
// Each route group adds its own shell:
//   app/(student)/layout.tsx  → Header + RoleProvider + TeacherCoach
//   app/(teacher)/layout.tsx  → sidebar + top bar + RoleProvider

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

// Luminous Intelligence design system fonts
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ALUMOS',
  description: 'A Brighter Path Through Every Class.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols Outlined — used by sidebar and header icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${hanken.variable} ${inter.variable} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
