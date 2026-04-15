import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, published, created_at, user_id')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        {user && (
          <Link
            href="/posts/new"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            + Tạo bài viết
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
          <strong>Lỗi:</strong> {error.message}
          <br />
          <span className="text-xs">
            Nhớ chạy schema.sql trên Supabase để tạo bảng posts.
          </span>
        </div>
      )}

      {posts && posts.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded border">
          Chưa có bài viết nào.
        </div>
      )}

      <div className="space-y-3">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{post.title}</h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span>
                    {new Date(post.created_at).toLocaleString('vi-VN')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      post.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {user?.id === post.user_id && (
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Sửa
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
