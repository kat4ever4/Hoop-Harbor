-- Give an account access to recruit data.
-- Row Level Security only shows recruits to signed-in users listed in staff_members.
-- 1. Sign up in the app first (that creates the row in auth.users).
-- 2. Run this in the Supabase dashboard -> SQL Editor, on hoop-harbor-test.
--    Locally: http://127.0.0.1:54323 -> SQL Editor.
-- 3. Change the email. Use 'admin' or 'staff'.

INSERT INTO public.staff_members (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'you@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
