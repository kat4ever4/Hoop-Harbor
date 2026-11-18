BEGIN;

CREATE TABLE public.import_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_name text NOT NULL CHECK (length(btrim(sheet_name)) > 0),
    imported_at timestamptz NOT NULL DEFAULT now(),
    imported_by_staff_id uuid NOT NULL REFERENCES public.staff_members(id),
    staff_name text NOT NULL
);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.import_batches FROM PUBLIC, anon, authenticated;

ALTER TABLE public.recruits
    ADD COLUMN import_batch_id uuid REFERENCES public.import_batches(id);

ALTER TABLE public.recruit_notes
    ADD COLUMN import_batch_id uuid REFERENCES public.import_batches(id);

CREATE INDEX import_batches_staff_idx ON public.import_batches (imported_by_staff_id);
CREATE INDEX recruits_import_batch_idx ON public.recruits (import_batch_id) WHERE import_batch_id IS NOT NULL;
CREATE INDEX recruit_notes_import_batch_idx ON public.recruit_notes (import_batch_id) WHERE import_batch_id IS NOT NULL;

-- The normal Data API may edit imported records, but cannot change batch ownership.
CREATE FUNCTION public.protect_import_batch_id() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF current_user IN ('anon', 'authenticated') THEN
        IF TG_OP = 'INSERT' AND NEW.import_batch_id IS NOT NULL THEN
            RAISE EXCEPTION 'Import batch IDs are assigned by the import service' USING ERRCODE = '42501';
        ELSIF TG_OP = 'UPDATE' AND NEW.import_batch_id IS DISTINCT FROM OLD.import_batch_id THEN
            RAISE EXCEPTION 'Import batch IDs are assigned by the import service' USING ERRCODE = '42501';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_import_batch_id() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER protect_recruit_import_batch_id BEFORE INSERT OR UPDATE OF import_batch_id
ON public.recruits FOR EACH ROW EXECUTE FUNCTION public.protect_import_batch_id();

CREATE TRIGGER protect_note_import_batch_id BEFORE INSERT OR UPDATE OF import_batch_id
ON public.recruit_notes FOR EACH ROW EXECUTE FUNCTION public.protect_import_batch_id();

COMMIT;
