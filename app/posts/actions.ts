'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const published = formData.get('published') === 'on'

  const { error } = await supabase.from('posts').insert({
    title,
    content,
    published,
    user_id: user.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/posts')
  redirect('/posts')
}

export async function updatePost(id: number, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      published: formData.get('published') === 'on',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/posts')
  redirect('/posts')
}

export async function deletePost(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/posts')
  redirect('/posts')
}
