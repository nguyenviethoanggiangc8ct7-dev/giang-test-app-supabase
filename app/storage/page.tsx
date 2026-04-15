'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'avatars'

type FileItem = {
  name: string
  created_at?: string | null
  publicUrl: string
}

export default function StoragePage() {
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [supabase])

  useEffect(() => {
    if (userId) loadFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadFiles() {
    if (!userId) return
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(userId, { sortBy: { column: 'created_at', order: 'desc' } })

    if (error) {
      setError(error.message)
      return
    }

    const items: FileItem[] =
      data?.map((f) => ({
        name: f.name,
        created_at: f.created_at,
        publicUrl: supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${userId}/${f.name}`).data.publicUrl,
      })) ?? []

    setFiles(items)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploading(true)
    setProgress(10)
    setError(null)

    const filename = `${Date.now()}-${file.name}`
    const path = `${userId}/${filename}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    setProgress(100)
    setUploading(false)

    if (error) {
      setError(error.message)
      return
    }

    await loadFiles()
    e.target.value = ''
  }

  async function handleDelete(name: string) {
    if (!userId) return
    if (!confirm(`Xóa ${name}?`)) return

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${userId}/${name}`])

    if (error) setError(error.message)
    else await loadFiles()
  }

  async function copySignedUrl(name: string) {
    if (!userId) return
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${userId}/${name}`, 3600)

    if (error) return setError(error.message)
    await navigator.clipboard.writeText(data.signedUrl)
    alert('Đã copy signed URL (hết hạn sau 1h)')
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        Bạn cần <a href="/login" className="text-blue-600 underline">đăng nhập</a> để dùng Storage.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Storage</h1>

      <div className="bg-white border rounded-lg p-6">
        <label className="block text-sm font-medium mb-2">
          Upload file (ảnh, tài liệu, ...)
        </label>
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
        />

        {uploading && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Đang upload...</p>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 text-sm bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">File của bạn ({files.length})</h2>

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded border">
            Chưa có file nào.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((f) => (
              <div
                key={f.name}
                className="bg-white border rounded-lg overflow-hidden"
              >
                {/\.(png|jpe?g|gif|webp)$/i.test(f.name) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.publicUrl}
                    alt={f.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-4xl">
                    📄
                  </div>
                )}
                <div className="p-3 text-xs">
                  <div className="truncate font-medium" title={f.name}>
                    {f.name}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => copySignedUrl(f.name)}
                      className="text-blue-600 hover:underline"
                    >
                      Signed URL
                    </button>
                    <button
                      onClick={() => handleDelete(f.name)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
