'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      // Auto-confirm bật → đã có session, chuyển thẳng vào dashboard
      router.refresh()
      router.push('/dashboard')
    } else {
      // Cần confirm email
      setMessage('✓ Đã gửi email xác nhận. Hãy check inbox.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg border p-8">
      <h1 className="text-2xl font-bold mb-6">Đăng ký</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password (≥ 6 ký tự)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && (
          <div className="text-sm p-2 rounded bg-red-50 text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="text-sm p-2 rounded bg-green-50 text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
