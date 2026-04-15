'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: number
  content: string
  user_email: string
  created_at: string
}

export default function RealtimePage() {
  const supabase = createClient()

  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [supabase])

  // ─── Fetch initial messages + subscribe to postgres_changes ───
  useEffect(() => {
    let mounted = true

    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (mounted && data) setMessages(data)
      })

    const changesChannel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as Message).id))
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(changesChannel)
    }
  }, [supabase])

  // ─── Presence – theo dõi users online ───
  useEffect(() => {
    if (!email) return

    const presence = supabase.channel('presence:room', {
      config: { presence: { key: email } },
    })

    presence
      .on('presence', { event: 'sync' }, () => {
        const state = presence.presenceState()
        setOnlineUsers(Object.keys(state))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presence.track({ email, online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(presence)
    }
  }, [supabase, email])

  // Auto scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !email) return

    const { error } = await supabase
      .from('messages')
      .insert({ content: input.trim(), user_email: email })

    if (error) {
      alert(error.message)
      return
    }

    setInput('')
  }

  if (!email) {
    return (
      <div className="text-center py-12">
        Bạn cần <a href="/login" className="text-blue-600 underline">đăng nhập</a> để chat.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Realtime Chat</h1>
      <p className="text-sm text-gray-600 mb-4">
        Mở 2 tab trình duyệt khác nhau để thấy realtime hoạt động 🚀
      </p>

      <div className="bg-white border rounded-lg overflow-hidden flex flex-col h-[500px]">
        {/* Online users */}
        <div className="border-b px-4 py-2 bg-gray-50 text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-medium">{onlineUsers.length} online:</span>
          <span className="text-gray-600 truncate">
            {onlineUsers.join(', ') || '—'}
          </span>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">
              Chưa có tin nhắn. Hãy gửi tin đầu tiên!
            </div>
          )}
          {messages.map((m) => {
            const mine = m.user_email === email
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                    mine
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!mine && (
                    <div className="text-xs opacity-70 mb-0.5">
                      {m.user_email}
                    </div>
                  )}
                  <div>{m.content}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t p-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="bg-black text-white px-5 rounded hover:bg-gray-800"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  )
}
