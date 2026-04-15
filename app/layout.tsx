import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Supabase Self-Hosted Demo',
  description: 'Demo all Supabase use cases with Next.js App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
