-- Sample directory names and aliases for fictional recruiting activity.
-- Run before seed-pipeline-v2.sql. Preserve custom aliases on repeat runs.
INSERT INTO public.schools (name, aliases) VALUES
('American University', ARRAY['american', 'au', 'american eagles']),
('Boston University', ARRAY['bu', 'boston u', 'boston university terriers']),
('Bucknell University', ARRAY['bucknell', 'bucknell bison']),
('Colgate University', ARRAY['colgate', 'colgate raiders']),
('Lafayette College', ARRAY['lafayette', 'lafayette leopards']),
('Lehigh University', ARRAY['lehigh', 'lehigh mountain hawks']),
('University of Connecticut', ARRAY['uconn', 'connecticut', 'uconn huskies'])
ON CONFLICT (normalized_name) DO UPDATE
SET aliases = schools.aliases || EXCLUDED.aliases;
