'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push(redirect)
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Nhập email trước')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setError('✓ Đã gửi magic link tới email của bạn')
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg border p-8">
      <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && (
          <div
            className={`text-sm p-2 rounded ${
              error.startsWith('✓')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full border py-2 rounded hover:bg-gray-50"
        >
          Gửi Magic Link
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  )
}
