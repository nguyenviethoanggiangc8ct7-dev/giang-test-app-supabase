import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = [
    {
      title: '🔐 Authentication',
      desc: 'Đăng ký, đăng nhập bằng email/password, quản lý session',
      href: user ? '/dashboard' : '/login',
      cta: user ? 'Vào Dashboard' : 'Thử ngay',
    },
    {
      title: '📝 Database CRUD',
      desc: 'Tạo, đọc, sửa, xóa bài viết với Row Level Security',
      href: '/posts',
      cta: 'Xem posts',
    },
    {
      title: '⚡ Realtime',
      desc: 'Chat realtime + live updates khi data thay đổi',
      href: '/realtime',
      cta: 'Thử realtime',
    },
    {
      title: '📦 Storage',
      desc: 'Upload / download file, signed URL, public URL',
      href: '/storage',
      cta: 'Upload file',
    },
  ]

  return (
    <div className="space-y-10">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold mb-3">
          Supabase Self-Hosted Demo
        </h1>
        <p className="text-gray-600">
          Kết nối tới{' '}
          <code className="bg-gray-200 px-2 py-0.5 rounded text-sm">
            supabase.matbaohosting.com:8000
          </code>
        </p>
        {user && (
          <p className="mt-3 text-sm text-green-600">
            ✓ Đã đăng nhập: {user.email}
          </p>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="block bg-white rounded-lg border p-6 hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{f.title}</h2>
            <p className="text-gray-600 mb-4">{f.desc}</p>
            <span className="text-blue-600 text-sm font-medium">
              {f.cta} →
            </span>
          </Link>
        ))}
      </section>

      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm">
        <strong>⚠️ Trước khi chạy:</strong> Bạn cần chạy file{' '}
        <code className="bg-white px-1.5 py-0.5 rounded">schema.sql</code>{' '}
        trên Supabase Studio SQL Editor để tạo bảng{' '}
        <code>posts</code>, <code>profiles</code>,<code> messages</code> và
        bucket <code>avatars</code>.
      </section>
    </div>
  )
}
