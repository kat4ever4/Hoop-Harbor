BEGIN;

ALTER TABLE public.recruit_notes_v2
ADD COLUMN rating smallint,
ADD COLUMN client_request_id uuid;

ALTER TABLE public.recruit_notes_v2
ALTER COLUMN client_request_id
SET DEFAULT gen_random_uuid();

-- Preserve historical notes and timestamps.

ALTER TABLE public.recruit_notes_v2
DISABLE TRIGGER recruit_notes_v2_updated_at;

UPDATE public.recruit_notes_v2
SET client_request_id = id
WHERE client_request_id IS NULL;

ALTER TABLE public.recruit_notes_v2
ENABLE TRIGGER recruit_notes_v2_updated_at;

-- Enforce valid ratings and unique request IDs.

ALTER TABLE public.recruit_notes_v2
ALTER COLUMN client_request_id SET NOT NULL,
ADD CONSTRAINT recruit_notes_v2_rating_range_check
CHECK (rating BETWEEN 1 AND 5),
ADD CONSTRAINT recruit_notes_v2_client_request_id_key
UNIQUE (client_request_id);

-- Prevent changing note identity after creation.

CREATE OR REPLACE FUNCTION public.protect_note_v2_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.recruit_id IS DISTINCT FROM OLD.recruit_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.client_request_id IS DISTINCT FROM OLD.client_request_id
    THEN
        RAISE EXCEPTION
        'A note identity, author, recruit, creation time, and request ID cannot be changed';
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
