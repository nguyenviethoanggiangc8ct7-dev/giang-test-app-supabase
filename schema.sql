-- =============================================================================
-- SCHEMA cho Demo App
-- Chạy file này trên Supabase Studio → SQL Editor TRƯỚC khi dùng app
-- =============================================================================

-- 1. PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto tạo profile khi có user mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. POSTS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT USING (published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- 3. MESSAGES (for realtime chat) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone logged in can read messages" ON messages;
CREATE POLICY "Anyone logged in can read messages"
  ON messages FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone logged in can send messages" ON messages;
CREATE POLICY "Anyone logged in can send messages"
  ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bật realtime cho bảng messages và posts
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- 4. STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Chạy riêng trong Storage UI hoặc:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (chỉ user tự quản lý folder của mình)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
