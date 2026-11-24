BEGIN;

ALTER TABLE public.import_batches ADD COLUMN undone_at timestamptz;
ALTER TABLE public.recruits ADD COLUMN import_source text;

-- Preserve the profile's last-edited timestamp when filling in historical imports.
ALTER TABLE public.recruits DISABLE TRIGGER recruits_v2_updated_at;
UPDATE public.recruits AS recruit
SET import_source = batch.sheet_name
FROM public.import_batches AS batch
WHERE recruit.import_batch_id = batch.id;
ALTER TABLE public.recruits ENABLE TRIGGER recruits_v2_updated_at;

CREATE FUNCTION public.protect_import_source() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF current_user IN ('anon', 'authenticated') THEN
        IF TG_OP = 'INSERT' AND NEW.import_source IS NOT NULL THEN
            RAISE EXCEPTION 'Import sources are assigned by the import service' USING ERRCODE = '42501';
        ELSIF TG_OP = 'UPDATE' AND NEW.import_source IS DISTINCT FROM OLD.import_source THEN
            RAISE EXCEPTION 'Import sources are assigned by the import service' USING ERRCODE = '42501';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_import_source() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER protect_recruit_import_source BEFORE INSERT OR UPDATE OF import_source
ON public.recruits FOR EACH ROW EXECUTE FUNCTION public.protect_import_source();

NOTIFY pgrst, 'reload schema';
COMMIT;
