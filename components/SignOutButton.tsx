'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-red-600 hover:underline"
    >
      Đăng xuất
    </button>
  )
}
