-- Hoop Harbor fictional sample records for LOCAL / TEST ONLY.
-- Do not run against production. Hosted projects require manual seed execution.
-- Designed for the original schema migration plus the unify_recruit_details migration.

INSERT INTO public.recruits (
    id, first_name, last_name, preferred_name, graduation_year, positions,
    height_inches, high_school, city, state_country, circuit, age_group,
    club_team, jersey_number, video_links, profile_links,
    recruit_email, recruit_phone, guardian_contacts, birthday,
    academic_information, extra_notes
) VALUES
(
    '11111111-1111-4111-8111-111111111111',
    'Jordan', 'Parker', 'JP', 2028, ARRAY['PG', 'SG'],
    68, 'Central High', 'Baltimore', 'Maryland, USA',
    'Nike EYBL', '16U', 'Metro Elite', '00',
    ARRAY['https://example.com/videos/jordan-parker'],
    ARRAY['https://example.com/profiles/jordan-parker'],
    'jordan.parker@example.com', NULL,
    '[{"name":"Morgan Parker","relationship":"Guardian","email":"morgan.parker@example.com","phone":null}]'::jsonb,
    '2009-07-14', 'Sample academic information for testing only',
    'Fictional sample recruit; do not use for outreach.'
),
(
    '22222222-2222-4222-8222-222222222222',
    'Taylor', 'Reed', NULL, 2027, ARRAY['SF', 'PF'],
    72, 'Westside Academy', 'Annapolis', 'Maryland, USA',
    'Under Armour', '17U', 'Bay Hoops', '24',
    ARRAY['https://example.com/videos/taylor-reed'],
    ARRAY['https://example.com/profiles/taylor-reed'],
    'taylor.reed@example.com', NULL,
    '[{"name":"Casey Reed","relationship":"Parent","email":"casey.reed@example.com","phone":null}]'::jsonb,
    '2008-11-02', NULL,
    'Fictional sample recruit; do not use for outreach.'
)
ON CONFLICT (id) DO NOTHING;
