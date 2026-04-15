import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware đã chặn nếu chưa login, nhưng vẫn phải narrow type
  if (!user) return null

  const [{ count: postCount }, { data: myPosts }] = await Promise.all([
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('posts')
      .select('id, title, published, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Xin chào, <strong>{user.email}</strong>
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border rounded-lg p-5">
          <div className="text-sm text-gray-500">Tổng bài viết</div>
          <div className="text-3xl font-bold mt-1">{postCount ?? 0}</div>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <div className="text-sm text-gray-500">User ID</div>
          <div className="text-xs mt-1 font-mono break-all">{user.id}</div>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <div className="text-sm text-gray-500">Tạo tài khoản</div>
          <div className="text-sm mt-1">
            {new Date(user.created_at).toLocaleString('vi-VN')}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Bài viết gần đây</h2>
          <Link href="/posts/new" className="text-sm text-blue-600 hover:underline">
            + Tạo mới
          </Link>
        </div>

        {myPosts && myPosts.length > 0 ? (
          <div className="bg-white border rounded-lg divide-y">
            {myPosts.map((p) => (
              <Link
                key={p.id}
                href={`/posts/${p.id}/edit`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(p.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    p.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded border">
            Bạn chưa có bài viết nào.
          </div>
        )}
      </section>
    </div>
  )
}
