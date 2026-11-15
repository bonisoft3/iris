-- Waste specimen classification pipeline (ir decision-classify-trigger).
-- Static content-addressed /pictures/*.svg fixtures settle synchronously inside
-- the INSERT transaction for deterministic ledger assertions; real camera and
-- uploaded photos (data:image/*;base64,... or https://...) enqueue a ClassifyJob
-- row whose Mecha state machine invokes the Airlock classify-waste Vision AI
-- effect via tsbifrost and settles the resulting TrashItem row on completion.
-- Seeded demo personas (clara-mendes, mateo-silva, noa-levy, timur-aliev) are
-- skipped so 020_demo_items.sql preserves its curated specimen count and phase mix.

SET lock_timeout = '5s';
SET statement_timeout = '60s';

BEGIN;

CREATE OR REPLACE FUNCTION classify_track_request() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_kind text;
  v_caption text;
  v_label text;
  v_label_key text;
  v_material text;
  v_instructions text;
  v_subs text;
  v_price text;
  v_places text;
BEGIN
  IF NEW.status <> 'submitted' OR EXISTS (
    SELECT 1 FROM app_user u
    WHERE u.id = NEW.user_id
      AND u.handle IN ('clara-mendes', 'mateo-silva', 'noa-levy', 'timur-aliev')
  ) THEN
    RETURN NULL;
  END IF;

  IF NEW.image_url NOT LIKE '/pictures/%' THEN
    UPDATE track_request
       SET status = 'classifying'
     WHERE id = NEW.id;

    INSERT INTO classify_job (
      id,
      user_id,
      image_url,
      model,
      user_language,
      user_city,
      latitude,
      longitude,
      status,
      result_json
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.image_url,
      NEW.model,
      NEW.user_language,
      NEW.user_city,
      NEW.latitude,
      NEW.longitude,
      'classifying',
      ''
    ) ON CONFLICT (id) DO NOTHING;

    RETURN NULL;
  END IF;

  IF NEW.image_url = '/pictures/4271dbcdab4a00c153b897c9f2958d549250e04a468635b80085e64b22d1d19c.jpg' THEN
    v_kind := 'organic';
  ELSIF NEW.image_url = '/pictures/334466b4324a8c80f3204ef4c63cf6892ec20a954880af364b0ad4936aa6093a.jpg' THEN
    v_kind := 'ewaste';
  ELSIF NEW.image_url = '/pictures/b9f9c914ebdd06f358a2a7fe4e8f625c45665c9d6ae7c64980f9f20ee00f0d3b.jpg' THEN
    v_kind := 'ceramic';
  ELSIF NEW.image_url = '/pictures/947288224d612f8c7dced73d0ac17ab9608caa6627ef8d5da5628fce3a7a3579.jpg' THEN
    v_kind := 'aluminum';
  ELSE
    v_kind := 'pet';
  END IF;

  IF v_kind = 'organic' THEN
    v_caption := CASE WHEN NEW.model = 'openai'
      THEN 'Citrus & Banana Peelings with Spent Arabica Grounds'
      ELSE 'Citrus & Banana Peelings with Coffee Grounds'
    END;
    v_label := 'organic';
    v_label_key := 'cat_organic';
    v_material := CASE WHEN NEW.model = 'openai'
      THEN 'Biodegradable Lignocellulose, Pectin & Nitrogen-Rich Grounds (C:N ~24:1)'
      ELSE 'Biodegradable Lignocellulose & Fruit Pectin'
    END;
    v_instructions := '1. Remove any fruit stickers or plastic ties. 2. Layer with dry leaves or sawdust in a home worm bin or take to the municipal composting yard.';
    v_subs := 'Organic · Kitchen Scraps · Vermicompost Feedstock';
    v_price := 'Compost humic value (~US$ 0.12 / kg)';
    v_places := 'Pátio de Compostagem Lapa (1.8 km) · Horta Comunitária Pinheiros (0.9 km)';
  ELSIF v_kind = 'ewaste' THEN
    v_caption := 'Swollen 18650 Lithium-Ion Battery Pack';
    v_label := 'eletronic';
    v_label_key := 'cat_eletronic';
    v_material := CASE WHEN NEW.model = 'openai'
      THEN 'Lithium Cobalt Oxide (LiCoO2) Cathode, Copper Foil & ABS Enclosure'
      ELSE 'Lithium Cobalt Oxide (LiCoO2) Cell & ABS Casing'
    END;
    v_instructions := '1. Never place in household or dry recycling bins — fire hazard. 2. Tape both metal terminals with non-conductive tape and deliver to a certified e-waste drop-off point.';
    v_subs := 'Electronic Waste · Lithium Battery · Hazardous WEEE';
    v_price := 'US$ 3.20 / kg (cobalt & copper recovery)';
    v_places := 'Ponto Verde Eletrônicos Paulista (0.7 km) · Ecoponto Pinheiros (1.9 km)';
  ELSIF v_kind = 'ceramic' THEN
    v_caption := 'Chipped Glazed Stoneware Coffee Mug';
    v_label := 'non_recyclable';
    v_label_key := 'cat_non_recyclable';
    v_material := 'Vitrified Aluminosilicate Ceramic (Stoneware)';
    v_instructions := '1. Do not mix with glass bottles — ceramic has a higher melting point. 2. Wrap sharp edges in thick paper and place in inert general waste or mineral rubble recovery.';
    v_subs := 'Non-Recyclable · Vitrified Ceramic · Inert Rubble';
    v_price := 'US$ 0.00 / kg (inert aggregate only)';
    v_places := 'Ecoponto Pinheiros — Entulho Inerte (0.8 km)';
  ELSIF v_kind = 'aluminum' THEN
    v_caption := CASE WHEN NEW.model = 'openai'
      THEN 'Pressed Aluminum Beverage Can (350 ml · ALU #41)'
      ELSE 'Crushed Aluminum Beverage Can (350 ml)'
    END;
    v_label := 'recyclable';
    v_label_key := 'cat_recyclable';
    v_material := 'Beverage-grade Aluminum Alloy (AA 3004 / 5182 · ALU #41)';
    v_instructions := '1. Drain remaining liquid completely. 2. Keep the pull-tab attached and place in the dry recyclables bin for closed-loop smelting.';
    v_subs := 'Metal · Aluminum #41 · Infinite Loop Recyclable';
    v_price := 'US$ 1.45 / kg (approx. US$ 0.02 per can)';
    v_places := 'Cooperativa Vila Mariana (1.4 km) · Ecoponto Pinheiros (0.6 km)';
  ELSE
    v_caption := CASE WHEN NEW.model = 'openai'
      THEN 'Clear PET #1 Bottle with HDPE #2 Neck Ring (500 ml)'
      ELSE 'Clear PET #1 Mineral Water Bottle (500 ml)'
    END;
    v_label := 'recyclable';
    v_label_key := 'cat_recyclable';
    v_material := 'Polyethylene Terephthalate (PET #1) with HDPE #2 cap';
    v_instructions := '1. Empty any remaining liquid completely. 2. Quick-rinse and crush the bottle lengthwise. 3. Keep the screw cap attached and place in the dry recyclables bin.';
    v_subs := 'Plastic · PET #1 · Beverage Container · Dry Recyclable';
    v_price := 'US$ 0.85 / kg (approx. US$ 0.03 per bottle)';
    v_places := 'Ecoponto Pinheiros (0.6 km) · Cooperativa Vila Mariana (2.1 km)';
  END IF;

  INSERT INTO trash_item (
    id,
    request_id,
    user_id,
    picture,
    caption,
    label,
    label_key,
    object_material,
    disposal_instructions,
    sub_classifications,
    price,
    is_disposal_place,
    nearby_recycling_places,
    tagged_as_inappropriate,
    user_language,
    latitude,
    longitude,
    created_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.user_id,
    NEW.image_url,
    v_caption,
    v_label,
    v_label_key,
    v_material,
    v_instructions,
    v_subs,
    v_price,
    false,
    v_places,
    false,
    NEW.user_language,
    NEW.latitude,
    NEW.longitude,
    NEW.created_at
  ) ON CONFLICT (request_id) DO NOTHING;

  UPDATE track_request
     SET status = 'classified'
   WHERE id = NEW.id;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION settle_classify_job() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_json jsonb := '{}'::jsonb;
  v_caption text;
  v_label text;
  v_label_key text;
  v_material text;
  v_instructions text;
  v_subs text;
  v_price text;
  v_places text;
BEGIN
  IF NEW.status NOT IN ('done', 'failed') THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM track_request WHERE id = NEW.id) THEN
    DELETE FROM classify_job WHERE id = NEW.id;
    RETURN NULL;
  END IF;

  IF NEW.status = 'failed' THEN
    UPDATE track_request
       SET status = 'failed'
     WHERE id = NEW.id;
    RETURN NULL;
  END IF;

  v_json := NEW.result_json::jsonb;

  v_label := nullif(btrim(v_json->>'label'), '');
  IF v_label IS NULL OR v_label NOT IN ('recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash') THEN
    RAISE EXCEPTION 'classify_job % settled done with invalid label %', NEW.id, coalesce(v_label, '<null>') USING ERRCODE = 'check_violation';
  END IF;
  v_label_key := 'cat_' || v_label;

  v_caption := left(coalesce(btrim(v_json->>'caption'), ''), 160);
  v_material := left(coalesce(btrim(v_json->>'object_material'), ''), 160);
  v_instructions := left(coalesce(btrim(v_json->>'disposal_instructions'), ''), 2000);
  IF v_caption = '' OR v_material = '' OR v_instructions = '' THEN
    RAISE EXCEPTION 'classify_job % settled done with incomplete classification payload', NEW.id USING ERRCODE = 'check_violation';
  END IF;

  v_subs := left(coalesce(btrim(v_json->>'sub_classifications'), ''), 500);
  v_price := left(coalesce(btrim(v_json->>'price'), ''), 64);
  v_places := left(coalesce(btrim(v_json->>'nearby_recycling_places'), ''), 600);

  INSERT INTO trash_item (
    id,
    request_id,
    user_id,
    picture,
    caption,
    label,
    label_key,
    object_material,
    disposal_instructions,
    sub_classifications,
    price,
    is_disposal_place,
    nearby_recycling_places,
    tagged_as_inappropriate,
    user_language,
    latitude,
    longitude,
    created_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.user_id,
    NEW.image_url,
    v_caption,
    v_label,
    v_label_key,
    v_material,
    v_instructions,
    v_subs,
    v_price,
    false,
    v_places,
    false,
    NEW.user_language,
    NEW.latitude,
    NEW.longitude,
    now()
  ) ON CONFLICT (request_id) DO NOTHING;

  UPDATE track_request
     SET status = 'classified'
   WHERE id = NEW.id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS classify_request_on_insert ON track_request;
CREATE TRIGGER classify_request_on_insert
  AFTER INSERT ON track_request
  FOR EACH ROW EXECUTE FUNCTION classify_track_request();

DROP TRIGGER IF EXISTS settle_classify_job_on_update ON classify_job;
CREATE TRIGGER settle_classify_job_on_update
  AFTER UPDATE OF status ON classify_job
  FOR EACH ROW EXECUTE FUNCTION settle_classify_job();

REVOKE EXECUTE ON FUNCTION classify_track_request() FROM PUBLIC, app_user, anon;
REVOKE EXECUTE ON FUNCTION settle_classify_job() FROM PUBLIC, app_user, anon;

COMMIT;
