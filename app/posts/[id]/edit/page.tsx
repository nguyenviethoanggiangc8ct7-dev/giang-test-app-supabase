import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePost, deletePost } from '../../actions'

export default async function EditPostPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()
  if (post.user_id !== user.id) {
    return <div className="text-red-600">Bạn không có quyền sửa bài này.</div>
  }

  const updateWithId = updatePost.bind(null, id)
  const deleteWithId = deletePost.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/posts" className="text-sm text-blue-600 hover:underline">
        ← Quay lại
      </Link>

      <h1 className="text-3xl font-bold my-6">Sửa bài viết</h1>

      <form
        action={updateWithId}
        className="space-y-4 bg-white border rounded-lg p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <input
            name="title"
            defaultValue={post.title}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <textarea
            name="content"
            rows={6}
            defaultValue={post.content}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post.published}
          />
          Published
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
          >
            Cập nhật
          </button>
        </div>
      </form>

      <form action={deleteWithId} className="mt-4">
        <button
          type="submit"
          className="text-red-600 text-sm hover:underline"
        >
          Xóa bài viết
        </button>
      </form>
    </div>
  )
}
