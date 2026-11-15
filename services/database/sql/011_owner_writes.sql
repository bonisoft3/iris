-- Owner writes and column grants over the public tables (ir decision-public-read-owner-writes).
-- Public access emits a SELECT policy and the service catch-all; owner-scoped
-- INSERT, UPDATE, and DELETE policies are added here with explicit column grants
-- so `created_at`, `handle`, and trigger-owned fields stay out of browser reach.

SET lock_timeout = '5s';
SET statement_timeout = '60s';

BEGIN;

DROP POLICY IF EXISTS app_user_app_user_update ON app_user;
CREATE POLICY app_user_app_user_update ON app_user FOR UPDATE TO app_user
  USING (id = auth_uid()) WITH CHECK (id = auth_uid());
REVOKE INSERT, UPDATE, DELETE ON app_user FROM app_user;
GRANT UPDATE (display_name, preferred_model)
  ON app_user TO app_user;
ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_retired_pii_null;
ALTER TABLE app_user ADD CONSTRAINT app_user_retired_pii_null
  CHECK (home_address IS NULL AND address_complement IS NULL AND phone_number IS NULL)
  NOT VALID;

DROP POLICY IF EXISTS track_request_app_user_insert ON track_request;
CREATE POLICY track_request_app_user_insert ON track_request FOR INSERT TO app_user
  WITH CHECK (user_id = auth_uid());
DROP POLICY IF EXISTS track_request_app_user_update ON track_request;
CREATE POLICY track_request_app_user_update ON track_request FOR UPDATE TO app_user
  USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());
DROP POLICY IF EXISTS track_request_app_user_delete ON track_request;
CREATE POLICY track_request_app_user_delete ON track_request FOR DELETE TO app_user
  USING (user_id = auth_uid());
REVOKE INSERT, UPDATE ON track_request FROM app_user;
GRANT INSERT (id, image_url, model, user_language, user_city, latitude, longitude),
      UPDATE (image_url, model, user_language, user_city, latitude, longitude)
  ON track_request TO app_user;

-- TrashItem rows are created by the classification trigger (or seeded), may
-- be flagged as inappropriate by a signed-in steward, and may be deleted only
-- by their owner.
DROP POLICY IF EXISTS trash_item_app_user_update ON trash_item;
CREATE POLICY trash_item_app_user_update ON trash_item FOR UPDATE TO app_user
  USING (true) WITH CHECK (tagged_as_inappropriate = true);
DROP POLICY IF EXISTS trash_item_app_user_delete ON trash_item;
CREATE POLICY trash_item_app_user_delete ON trash_item FOR DELETE TO app_user
  USING (user_id = auth_uid());
REVOKE INSERT, UPDATE ON trash_item FROM app_user;
GRANT UPDATE (tagged_as_inappropriate) ON trash_item TO app_user;

CREATE OR REPLACE FUNCTION cascade_trash_item_children()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM trash_item_translation WHERE item_id = OLD.id;
  DELETE FROM translation_request WHERE item_id = OLD.id;
  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION cascade_trash_item_children() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS trash_item_cascade_children ON trash_item;
CREATE TRIGGER trash_item_cascade_children
  BEFORE DELETE ON trash_item
  FOR EACH ROW
  EXECUTE FUNCTION cascade_trash_item_children();

CREATE OR REPLACE FUNCTION cascade_trash_item_origin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM classify_job WHERE id = OLD.id AND status IN ('done', 'failed');
  IF OLD.request_id IS NOT NULL AND OLD.request_id <> '' THEN
    DELETE FROM track_request WHERE id::text = OLD.request_id AND user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION cascade_trash_item_origin() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS trash_item_cascade_origin ON trash_item;
CREATE TRIGGER trash_item_cascade_origin
  AFTER DELETE ON trash_item
  FOR EACH ROW
  EXECUTE FUNCTION cascade_trash_item_origin();

CREATE OR REPLACE FUNCTION cascade_track_request_children()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM classify_job WHERE id = OLD.id AND status IN ('done', 'failed');
  DELETE FROM trash_item WHERE request_id = OLD.id::text AND user_id = OLD.user_id;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION cascade_track_request_children() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS track_request_cascade_children ON track_request;
CREATE TRIGGER track_request_cascade_children
  AFTER DELETE ON track_request
  FOR EACH ROW
  EXECUTE FUNCTION cascade_track_request_children();

-- TranslationRequest lets any signed-in reader ask for a locale translation of
-- an item; the trigger populates TrashItemTranslation.
DROP POLICY IF EXISTS translation_request_app_user_insert ON translation_request;
CREATE POLICY translation_request_app_user_insert ON translation_request FOR INSERT TO app_user
  WITH CHECK (user_id = auth_uid());
REVOKE INSERT, UPDATE, DELETE ON translation_request FROM app_user;
GRANT INSERT (id, item_id, language) ON translation_request TO app_user;

-- TrashItemTranslation and ClassifyJob are managed by server triggers and Airlock,
-- never directly mutated by a browser.
REVOKE INSERT, UPDATE, DELETE ON trash_item_translation FROM app_user;
DROP POLICY IF EXISTS classify_job_app_user_insert ON classify_job;
DROP POLICY IF EXISTS classify_job_app_user_update ON classify_job;
DROP POLICY IF EXISTS classify_job_app_user_delete ON classify_job;
REVOKE INSERT, UPDATE, DELETE ON classify_job FROM app_user;

-- DisposalPlace: any signed-in user can register a bin and delete their own.
DROP POLICY IF EXISTS disposal_place_app_user_insert ON disposal_place;
CREATE POLICY disposal_place_app_user_insert ON disposal_place FOR INSERT TO app_user
  WITH CHECK (user_id = auth_uid());
DROP POLICY IF EXISTS disposal_place_app_user_delete ON disposal_place;
CREATE POLICY disposal_place_app_user_delete ON disposal_place FOR DELETE TO app_user
  USING (user_id = auth_uid());
REVOKE INSERT, UPDATE ON disposal_place FROM app_user;
GRANT INSERT (id, name, img_url, material_type, material_key, address, phone_number, distance_km, latitude, longitude)
  ON disposal_place TO app_user;

CREATE OR REPLACE FUNCTION sync_disposal_place_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.material_key := 'cat_' || NEW.material_type;
  IF NEW.img_url IS NULL OR NEW.img_url = '' OR NEW.img_url = '/pictures/a614934e492c15e458ff950a50133af5ff2d73f2b53d7a49598b8e0519cdb23f.jpg' THEN
    IF NEW.material_type = 'organic' THEN
      NEW.img_url := '/pictures/11e450d820a485f2ef743fff3ab688df6bf10818258c6f6e6e2db8902df8c154.jpg';
    ELSIF NEW.material_type = 'eletronic' THEN
      NEW.img_url := '/pictures/32efd926e244739e97b3ced8bd3b9e2ce01ca101972eb5c7321ce1543db26877.jpg';
    ELSE
      NEW.img_url := '/pictures/a614934e492c15e458ff950a50133af5ff2d73f2b53d7a49598b8e0519cdb23f.jpg';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION sync_disposal_place_defaults() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS disposal_place_sync_defaults ON disposal_place;
CREATE TRIGGER disposal_place_sync_defaults
  BEFORE INSERT ON disposal_place
  FOR EACH ROW
  EXECUTE FUNCTION sync_disposal_place_defaults();

COMMIT;

ALTER TABLE app_user VALIDATE CONSTRAINT app_user_retired_pii_null;
