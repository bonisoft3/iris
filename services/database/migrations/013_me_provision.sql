-- The reader's own row, provisioned inside the auth service's own insert (ir
-- decision-me-row): a trigger rather than a pipeline because the row must
-- exist on the first paint after a one-click guest sign-in, and a CDC round
-- trip is seconds. AFTER INSERT because me.id REFERENCES app_user(id).
-- BEFORE INSERT translates guest UUIDs into readable fruit-animal-slug mnemonics
-- via mecha.guest_mnemonic_vocab and sets default doorstep collection coordinates
-- while preserving explicit seeded values from 020_demo_items.sql.

SET lock_timeout = '5s';
SET statement_timeout = '60s';

BEGIN;

CREATE TABLE IF NOT EXISTS mecha.guest_mnemonic_vocab (
  kind  text NOT NULL CHECK (kind IN ('fruit', 'animal')),
  idx   bigint NOT NULL CHECK (idx >= 0 AND idx < 32),
  slug  text NOT NULL,
  label text NOT NULL,
  PRIMARY KEY (kind, idx)
);

GRANT SELECT ON mecha.guest_mnemonic_vocab TO PUBLIC;

INSERT INTO mecha.rls_exempt (table_name, reason)
VALUES ('mecha.guest_mnemonic_vocab', 'read-only fruit and animal mnemonic vocabulary for guest handles')
ON CONFLICT (table_name) DO NOTHING;

INSERT INTO mecha.guest_mnemonic_vocab (kind, idx, slug, label) VALUES
  ('fruit',  0, 'acerola',    'Acerola'),
  ('fruit',  1, 'amora',      'Amora'),
  ('fruit',  2, 'avocado',    'Avocado'),
  ('fruit',  3, 'banana',     'Banana'),
  ('fruit',  4, 'caju',       'Caju'),
  ('fruit',  5, 'carambola',  'Carambola'),
  ('fruit',  6, 'cherry',     'Cherry'),
  ('fruit',  7, 'citrus',     'Citrus'),
  ('fruit',  8, 'coconut',    'Coconut'),
  ('fruit',  9, 'cupuacu',    'Cupuaçu'),
  ('fruit', 10, 'fig',        'Fig'),
  ('fruit', 11, 'guava',      'Guava'),
  ('fruit', 12, 'jabuticaba', 'Jabuticaba'),
  ('fruit', 13, 'jackfruit',  'Jackfruit'),
  ('fruit', 14, 'kiwi',       'Kiwi'),
  ('fruit', 15, 'lemon',      'Lemon'),
  ('fruit', 16, 'lime',       'Lime'),
  ('fruit', 17, 'lychee',     'Lychee'),
  ('fruit', 18, 'mango',      'Mango'),
  ('fruit', 19, 'maracuja',   'Maracujá'),
  ('fruit', 20, 'melon',      'Melon'),
  ('fruit', 21, 'nectarine',  'Nectarine'),
  ('fruit', 22, 'olive',      'Olive'),
  ('fruit', 23, 'orange',     'Orange'),
  ('fruit', 24, 'papaya',     'Papaya'),
  ('fruit', 25, 'peach',      'Peach'),
  ('fruit', 26, 'pear',       'Pear'),
  ('fruit', 27, 'persimmon',  'Persimmon'),
  ('fruit', 28, 'pineapple',  'Pineapple'),
  ('fruit', 29, 'pitanga',    'Pitanga'),
  ('fruit', 30, 'plum',       'Plum'),
  ('fruit', 31, 'tangerine',  'Tangerine'),
  ('animal',  0, 'albatross',   'Albatross'),
  ('animal',  1, 'armadillo',   'Armadillo'),
  ('animal',  2, 'badger',      'Badger'),
  ('animal',  3, 'capybara',    'Capybara'),
  ('animal',  4, 'chameleon',   'Chameleon'),
  ('animal',  5, 'condor',      'Condor'),
  ('animal',  6, 'dolphin',     'Dolphin'),
  ('animal',  7, 'falcon',      'Falcon'),
  ('animal',  8, 'flamingo',    'Flamingo'),
  ('animal',  9, 'fox',         'Fox'),
  ('animal', 10, 'gecko',       'Gecko'),
  ('animal', 11, 'heron',       'Heron'),
  ('animal', 12, 'hummingbird', 'Hummingbird'),
  ('animal', 13, 'ibis',        'Ibis'),
  ('animal', 14, 'iguana',      'Iguana'),
  ('animal', 15, 'jaguar',      'Jaguar'),
  ('animal', 16, 'kingfisher',  'Kingfisher'),
  ('animal', 17, 'koala',       'Koala'),
  ('animal', 18, 'lemur',       'Lemur'),
  ('animal', 19, 'lynx',        'Lynx'),
  ('animal', 20, 'macaw',       'Macaw'),
  ('animal', 21, 'manatee',     'Manatee'),
  ('animal', 22, 'meerkat',     'Meerkat'),
  ('animal', 23, 'ocelot',      'Ocelot'),
  ('animal', 24, 'otter',       'Otter'),
  ('animal', 25, 'owl',         'Owl'),
  ('animal', 26, 'panda',       'Panda'),
  ('animal', 27, 'pelican',     'Pelican'),
  ('animal', 28, 'penguin',     'Penguin'),
  ('animal', 29, 'quokka',      'Quokka'),
  ('animal', 30, 'tapir',       'Tapir'),
  ('animal', 31, 'toucan',      'Toucan')
ON CONFLICT (kind, idx) DO UPDATE
  SET slug = EXCLUDED.slug,
      label = EXCLUDED.label;

CREATE OR REPLACE FUNCTION public.uuid_to_fruit_animal_handle(u uuid) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, mecha, pg_temp AS $$
DECLARE
  v_hex        text := replace(lower(u::text), '-', '');
  v_fruit_idx  bigint := (get_byte(decode(substr(v_hex, 1, 2), 'hex'), 0) % 32)::bigint;
  v_animal_idx bigint := (get_byte(decode(substr(v_hex, 3, 2), 'hex'), 0) % 32)::bigint;
  v_slug       text := right(v_hex, 4);
  v_fruit      text;
  v_animal     text;
BEGIN
  SELECT slug INTO v_fruit FROM mecha.guest_mnemonic_vocab WHERE kind = 'fruit' AND idx = v_fruit_idx;
  SELECT slug INTO v_animal FROM mecha.guest_mnemonic_vocab WHERE kind = 'animal' AND idx = v_animal_idx;
  RETURN COALESCE(v_fruit, 'mango') || '-' || COALESCE(v_animal, 'capybara') || '-' || v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.uuid_to_fruit_animal_display(u uuid) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, mecha, pg_temp AS $$
DECLARE
  v_hex        text := replace(lower(u::text), '-', '');
  v_fruit_idx  bigint := (get_byte(decode(substr(v_hex, 1, 2), 'hex'), 0) % 32)::bigint;
  v_animal_idx bigint := (get_byte(decode(substr(v_hex, 3, 2), 'hex'), 0) % 32)::bigint;
  v_slug       text := right(v_hex, 4);
  v_fruit      text;
  v_animal     text;
BEGIN
  SELECT label INTO v_fruit FROM mecha.guest_mnemonic_vocab WHERE kind = 'fruit' AND idx = v_fruit_idx;
  SELECT label INTO v_animal FROM mecha.guest_mnemonic_vocab WHERE kind = 'animal' AND idx = v_animal_idx;
  RETURN COALESCE(v_fruit, 'Mango') || ' ' || COALESCE(v_animal, 'Capybara') || ' · ' || v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION app_user_defaults() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, mecha, pg_temp AS $$
DECLARE
  v_hex           text := replace(lower(NEW.id::text), '-', '');
  v_guest_handle  text := public.uuid_to_fruit_animal_handle(NEW.id);
BEGIN
  IF NEW.handle IS NULL OR btrim(NEW.handle) = '' OR NEW.handle LIKE 'guest-%' OR NEW.handle = v_guest_handle THEN
    NEW.handle := v_guest_handle;
    IF EXISTS (SELECT 1 FROM app_user WHERE handle = NEW.handle AND id <> NEW.id) THEN
      NEW.handle := NEW.handle || '-' || substr(v_hex, 5, 4);
    END IF;
    NEW.display_name := COALESCE(NULLIF(btrim(NEW.display_name), ''), public.uuid_to_fruit_animal_display(NEW.id));
  ELSE
    NEW.display_name := COALESCE(NULLIF(btrim(NEW.display_name), ''), NEW.handle);
  END IF;
  NEW.preferred_model := COALESCE(NULLIF(btrim(NEW.preferred_model), ''), 'gemini');
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION app_user_defaults() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS default_app_user ON app_user;
CREATE TRIGGER default_app_user
  BEFORE INSERT ON app_user
  FOR EACH ROW EXECUTE FUNCTION app_user_defaults();

CREATE OR REPLACE FUNCTION me_provision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO me (id, handle) VALUES (NEW.id, NEW.handle) ON CONFLICT DO NOTHING;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION me_provision() FROM PUBLIC, app_user, anon;

DROP TRIGGER IF EXISTS provision_me ON app_user;
CREATE TRIGGER provision_me
  AFTER INSERT ON app_user
  FOR EACH ROW EXECUTE FUNCTION me_provision();

COMMIT;
