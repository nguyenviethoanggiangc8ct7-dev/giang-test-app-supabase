import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            ⚡ Supabase Demo
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/posts" className="hover:text-blue-600">Posts</Link>
            <Link href="/realtime" className="hover:text-blue-600">Realtime</Link>
            <Link href="/storage" className="hover:text-blue-600">Storage</Link>
            {user && (
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-600">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Đăng nhập</Link>
              <Link
                href="/register"
                className="bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
