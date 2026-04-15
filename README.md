# Supabase Self-Hosted Demo App

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase SSR.
Demo đầy đủ **Auth · Database CRUD · Realtime · Storage**.

Kết nối tới Supabase tự host: `http://supabase.com`

---

## 🚀 Hướng dẫn chạy

### 1. Cài dependencies

```bash
cd demo-app
npm install
```

### 2. Chạy schema SQL trên Supabase

Mở **Supabase Studio** (`http://supabase.com`) → **SQL Editor** → paste toàn bộ file [schema.sql](schema.sql) và chạy.

File này sẽ tạo:

- Bảng `profiles`, `posts`, `messages`
- Row Level Security policies
- Trigger tự tạo profile khi user đăng ký
- Bucket `avatars` cho Storage
- Bật realtime cho `messages` và `posts`

### 3. Chạy dev server

```bash
npm run dev
```

Mở http://localhost:3000

---

## 🗂 Cấu trúc dự án

```
demo-app/
├── app/
│   ├── layout.tsx                # Root layout + Navbar
│   ├── page.tsx                  # Homepage
│   ├── login/page.tsx            # Đăng nhập (password + magic link)
│   ├── register/page.tsx         # Đăng ký
│   ├── auth/callback/route.ts    # OAuth/Magic link callback
│   ├── dashboard/page.tsx        # 🔒 Protected page
│   ├── posts/
│   │   ├── page.tsx              # List posts (SSR)
│   │   ├── actions.ts            # Server Actions (CRUD)
│   │   ├── new/page.tsx          # Create post
│   │   └── [id]/edit/page.tsx    # Edit/Delete post
│   ├── storage/page.tsx          # Upload/list/delete files
│   └── realtime/page.tsx         # Realtime chat + presence
├── components/
│   ├── Navbar.tsx
│   └── SignOutButton.tsx
├── lib/supabase/
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server client (Server Component)
│   └── middleware.ts             # Middleware client (session refresh)
├── middleware.ts                 # Auth guard
├── schema.sql                    # Database schema
└── .env.local                    # Supabase URL + anon key
```

---

## ✨ Use cases đã demo

| Feature                               | Trang                            | File                                                         |
| ------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| Đăng ký email/password                | `/register`                      | [app/register/page.tsx](app/register/page.tsx)               |
| Đăng nhập + Magic Link                | `/login`                         | [app/login/page.tsx](app/login/page.tsx)                     |
| Auth callback                         | `/auth/callback`                 | [app/auth/callback/route.ts](app/auth/callback/route.ts)     |
| Middleware bảo vệ route               | `/dashboard/*`                   | [middleware.ts](middleware.ts)                               |
| Server Component fetch                | `/posts`                         | [app/posts/page.tsx](app/posts/page.tsx)                     |
| Server Actions (INSERT/UPDATE/DELETE) | `/posts/new`, `/posts/[id]/edit` | [app/posts/actions.ts](app/posts/actions.ts)                 |
| Dynamic route + ownership check       | `/posts/[id]/edit`               | [app/posts/[id]/edit/page.tsx](app/posts/[id]/edit/page.tsx) |
| Storage upload + public URL           | `/storage`                       | [app/storage/page.tsx](app/storage/page.tsx)                 |
| Storage signed URL                    | `/storage`                       | [app/storage/page.tsx](app/storage/page.tsx)                 |
| Realtime postgres_changes             | `/realtime`                      | [app/realtime/page.tsx](app/realtime/page.tsx)               |
| Realtime Presence                     | `/realtime`                      | [app/realtime/page.tsx](app/realtime/page.tsx)               |
| Row Level Security                    | tất cả bảng                      | [schema.sql](schema.sql)                                     |

---

## 🧪 Cách test

1. **Đăng ký** một tài khoản tại `/register`
2. Vào `/posts/new` để tạo vài bài viết
3. Vào `/storage` upload 1 vài ảnh
4. Mở `/realtime` ở **2 tab** khác nhau và chat thử
5. Mở tab ẩn danh, vào `/posts` → sẽ chỉ thấy bài **published** (RLS hoạt động)

---

## ⚙️ Config Supabase Studio

Nếu đăng ký không thành công do "Email not confirmed", vào:
**Authentication → Providers → Email** → tắt **Confirm email** (cho dev).

Để bật OAuth (Google, GitHub), config trong **Authentication → Providers**.

---

## 🔒 Bảo mật

- File `.env.local` đã chứa `anon key` – an toàn để expose ra browser
- **KHÔNG BAO GIỜ** commit `service_role` key
- RLS trong `schema.sql` đảm bảo user chỉ sửa/xóa được data của chính mình
