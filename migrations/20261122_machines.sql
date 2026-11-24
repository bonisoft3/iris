SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- The row machines restated as the emitter spells them now: their order reads
-- machine_clock(), and a seed restores its row in the state it names,
-- entering nothing (900_seed.sql marks its session as seeding).
-- 010_machines.sql keeps the bytes a database ran.

CREATE OR REPLACE FUNCTION machine_clock() RETURNS timestamptz
LANGUAGE sql STABLE SET search_path = pg_catalog AS $clock$
SELECT transaction_timestamp();
$clock$;
REVOKE ALL ON FUNCTION machine_clock() FROM PUBLIC;

ALTER TABLE "classify_job" DROP CONSTRAINT IF EXISTS "classify_job_status_check";
ALTER TABLE "classify_job" ADD CONSTRAINT "classify_job_status_check" CHECK ("status" IN ('classifying', 'done', 'failed')) NOT VALID;

CREATE OR REPLACE FUNCTION "trg_classify_job_status_machine"() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
SET TimeZone = 'UTC'
SET DateStyle = 'ISO, YMD' AS $$
DECLARE
  outcome jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."status" IN ('classifying') THEN
      RAISE EXCEPTION '% in % awaits an outcome and is not deleted', 'classify_job', OLD."status" USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD."status" = 'classifying' AND (OLD."id" IS DISTINCT FROM NEW."id") THEN
    RAISE EXCEPTION '% in classifying keeps its key until the outcome of %', 'classify_job', 'classify-waste:' || OLD."id"::text USING ERRCODE = 'check_violation';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD."status" = NEW."status" THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW."status" <> 'classifying' THEN
      -- A seed restores its row in the state it names, entering
      -- nothing (900_seed.sql marks its session as seeding). Any
      -- session may set the mark, so it counts only where the session
      -- logged in as the table's owner, as the seed's runner does; a
      -- client logs in as authenticator.
      IF coalesce(current_setting('pronto.seed', true), '') = 'on'
        AND pg_has_role(session_user, (SELECT c.relowner FROM pg_class c WHERE c.oid = TG_RELID), 'MEMBER') THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'new % must start in initial state % (got %)', 'classify_job', 'classifying', NEW."status" USING ERRCODE = 'check_violation';
    END IF;
        INSERT INTO "airlock"."external_effect_ledger" ("key", "effect", "row", "input")
        VALUES ('classify-waste:' || NEW."id"::text, 'classify-waste', jsonb_build_object('id', NEW."id"), jsonb_build_object('image_url', NEW."image_url", 'model', NEW."model", 'user_language', NEW."user_language", 'user_city', NEW."user_city"))
        ON CONFLICT ("key") DO NOTHING;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'external effect % was already performed: entering classifying again needs a new key', 'classify-waste:' || NEW."id"::text USING ERRCODE = 'unique_violation';
        END IF;
        PERFORM graphile_worker.add_job('external_effect', json_build_object('key', 'classify-waste:' || NEW."id"::text), job_key => airlock.job_key('classify-waste:' || NEW."id"::text), max_attempts => 30);
        UPDATE "public"."schedule" SET "due_at" = date_trunc('milliseconds', clock_timestamp()), "last_tick_at" = NULL
         WHERE "name" = 'airlock' AND "last_tick_at" IS NOT NULL
           AND "name" IN (SELECT "name" FROM "public"."schedule" WHERE "name" = 'airlock' FOR UPDATE SKIP LOCKED);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD."status" = 'classifying' THEN
      SELECT l."outcome" INTO outcome FROM "airlock"."external_effect_ledger" l WHERE l."key" = 'classify-waste:' || OLD."id"::text;
      IF outcome IS NULL OR outcome->>'target' IS DISTINCT FROM NEW."status" THEN
        RAISE EXCEPTION '% leaves classifying only by the recorded outcome of %', 'classify_job', 'classify-waste:' || OLD."id"::text USING ERRCODE = 'check_violation';
      END IF;

      IF NEW."status" = 'done' AND outcome->>'kind' = 'done' THEN

        NEW."status" := 'done';
        NEW."result_json" := COALESCE(outcome->'data'->>'result_json', '');
        RETURN NEW;
      END IF;
      IF NEW."status" = 'failed' AND outcome->>'kind' <> 'done' THEN

        NEW."status" := 'failed';
        NEW."result_json" := COALESCE(outcome->>'kind', 'failed');
        RETURN NEW;
      END IF;

      RAISE EXCEPTION 'invalid transition on % from % to %', 'classify_job', OLD."status", NEW."status" USING ERRCODE = 'check_violation';
    END IF;
    IF OLD."status" = 'done' THEN
      RAISE EXCEPTION 'cannot transition from final state % on %', OLD."status", 'classify_job' USING ERRCODE = 'check_violation';
    END IF;
    IF OLD."status" = 'failed' THEN
      RAISE EXCEPTION 'cannot transition from final state % on %', OLD."status", 'classify_job' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS "trg_classify_job_status_machine" ON "classify_job";
CREATE TRIGGER "trg_classify_job_status_machine"
  BEFORE INSERT OR UPDATE OR DELETE ON "classify_job"
  FOR EACH ROW
  EXECUTE FUNCTION "trg_classify_job_status_machine"();

