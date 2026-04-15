import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createPost } from '../actions'

export default async function NewPostPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/posts/new')

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/posts" className="text-sm text-blue-600 hover:underline">
        ← Quay lại
      </Link>

      <h1 className="text-3xl font-bold my-6">Tạo bài viết mới</h1>

      <form action={createPost} className="space-y-4 bg-white border rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <input
            name="title"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <textarea
            name="content"
            rows={6}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" />
          Publish ngay
        </label>

        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
        >
          Tạo bài viết
        </button>
      </form>
    </div>
  )
}
