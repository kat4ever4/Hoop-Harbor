-- Preserve original recruit data when moving to v2.

ALTER TABLE public.recruits_v2
ADD COLUMN IF NOT EXISTS extra_notes text;

INSERT INTO public.recruits_v2 (
    id, first_name, last_name, preferred_name,
    birthday, height_inches, positions, jersey_number,
    high_school, graduation_year, academic_information,
    city, state_country, club_team, circuit, age_group,
    recruit_email, recruit_phone, guardian_contacts,
    video_links, profile_links, extra_notes,
    created_at, updated_at
)
SELECT
    r.id, r.first_name, r.last_name, r.preferred_name,
    r.birthday, r.height_inches, r.positions,
    r.jersey_number, r.high_school, r.graduation_year,
    r.academic_information, r.city, r.state_country,
    r.club_team, r.circuit, r.age_group,
    r.recruit_email, r.recruit_phone,
    r.guardian_contacts, r.video_links,
    r.profile_links, r.extra_notes,
    r.created_at, r.updated_at
FROM public.recruits r
ON CONFLICT (id) DO NOTHING;

-- Preserve existing authorized staff accounts.

INSERT INTO public.staff_members_v2 (
    user_id, display_name, role, created_at
)
SELECT
    old.user_id,
    COALESCE(
        NULLIF(btrim(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(btrim(u.raw_user_meta_data->>'name'), ''),
        NULLIF(split_part(u.email, '@', 1), ''),
        'Staff member'
    ),
    old.role,
    now()
FROM public.staff_members old
JOIN auth.users u ON u.id = old.user_id
ON CONFLICT (user_id) DO NOTHING;

-- Attribution-only coaches without login accounts.

INSERT INTO public.staff_members_v2 (
    id, display_name, role
)
VALUES
    ('b2000000-0000-4000-8000-000000000004', 'Coach A', 'staff'),
    ('b2000000-0000-4000-8000-000000000005', 'Coach B', 'staff')
ON CONFLICT (id) DO NOTHING;
