-- The tenancy floor: the row-level isolation every mecha database has, whatever
-- generated the tables above it.
--
-- Permissive policies OR together; restrictive policies AND with everything; a
-- table with RLS enabled and no permissive policy denies all. So a restrictive
-- policy is a floor nothing above it can widen, and the design rests on that:
-- a bug in the generated rules layer is an outage, never a breach.
--
-- The policy text lives here and nowhere else. A generator emits
-- `CALL rls_protect('<table>')`, never the policy itself, so it cannot emit a
-- subtly wrong one and a correction reaches every app by migration.

-- The one thing that grants breadth, so its failure modes are the ones that
-- matter: it fails closed on an unset GUC, and drops empty elements rather than
-- minting a '' scope that would match everything. Assertions 6 and 19 say why.
-- STABLE so Postgres evaluates it once per statement and not once per row.
CREATE OR REPLACE FUNCTION public.current_scopes() RETURNS text[]
  LANGUAGE sql STABLE AS $$
    SELECT coalesce(
      array(SELECT s FROM unnest(
        string_to_array(current_setting('app.scopes', true), ',')) AS s
        WHERE s <> ''),
      '{}'::text[])
  $$;

-- The caller supplies `scope_id`: its derivation differs per access mode and
-- belongs to whoever declared the entity. Prefer a generated column --
-- `scope_id text GENERATED ALWAYS AS ('user:' || owner) STORED` -- because
-- Postgres then refuses a client-supplied value, so the derivation cannot be
-- made to lie without a trigger to defend it.
--
-- The missing TO clause and the FORCE are both deliberate and both invisible to
-- a reader who does not know to look for them; assertions 16 and 17 say why. A
-- role that must see across scopes takes BYPASSRLS, which is a row in pg_roles
-- and so auditable, rather than an absence from a TO list, which is not.
DROP PROCEDURE IF EXISTS public.rls_protect(regclass, text);
CREATE OR REPLACE PROCEDURE public.rls_protect(tbl regclass)
  LANGUAGE plpgsql
  -- A policy binds its function references when it is created, and binds them
  -- permanently. Without the pin the caller's search_path at CALL time decides
  -- which `current_scopes()` the floor calls, for the life of the policy.
  SET search_path = pg_catalog, public
  AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_attribute a
                  WHERE a.attrelid = tbl AND a.attname = 'scope_id'
                    AND a.attnotnull AND NOT a.attisdropped) THEN
    RAISE EXCEPTION
      'rls_protect(%): scope_id must exist and be NOT NULL -- a NULL scope fails '
      '= ANY(), so the row is invisible to every role while the audit reports the '
      'table protected', tbl;
  END IF;
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
  EXECUTE format('DROP POLICY IF EXISTS tenancy ON %s', tbl);
  EXECUTE format(
    'CREATE POLICY tenancy ON %s AS RESTRICTIVE FOR ALL '
    'USING (scope_id = ANY(current_scopes())) '
    'WITH CHECK (scope_id = ANY(current_scopes()))', tbl);
END $$;

-- PostgREST calls this once per request, in the request's transaction, after
-- switching to the request role. It is what makes current_scopes() a constant
-- for the statement rather than a subquery per row.
--
-- It must exist wherever PGRST_DB_PRE_REQUEST names it, and that setting is
-- unconditional for a server app -- so it cannot be conditional either, which
-- rules out emitting it per app. It can live here because it reads one setting
-- and writes another and depends on nothing an app declares.
--
-- Not SECURITY DEFINER: it reaches no table.
CREATE OR REPLACE FUNCTION public.app_pre_request() RETURNS void
  LANGUAGE plpgsql AS $$
DECLARE
  sub text := nullif(current_setting('request.jwt.claims', true)::json->>'sub', '');
BEGIN
  IF sub LIKE '%,%' THEN
    RAISE EXCEPTION 'jwt sub contains a comma, which would split into two scopes';
  END IF;
  PERFORM set_config('app.scopes', coalesce('user:' || sub, ''), true);
END $$;

-- Tables the floor cannot cover, declared rather than discovered.
--
-- A restrictive policy is tenancy isolation, and some visibility is finer than
-- tenancy: a per-object share grants one row to one reader, and there is no
-- scope both parties hold that does not also grant everything else the owner
-- has. Such a table is guarded by its permissive policies alone.
--
-- This exists so the audit can stay meaningful. Without it a sharing app's
-- audit is permanently non-empty, and a gate that always fails is one nobody
-- reads. Empty then means every table is either floored or knowingly exempt,
-- and `rls_exempt` is the short list a reviewer actually has to read.
-- Outside `public` on purpose. An app migration granting DML ON ALL TABLES IN
-- SCHEMA public -- 002_grants and 007_publication both do -- would otherwise
-- hand every signed-in user the ability to exempt any table and silence the
-- gate, and a REVOKE here would be undone by the next such grant. Being outside
-- `public` also keeps it off PostgREST, which serves that schema.
CREATE SCHEMA IF NOT EXISTS mecha;
CREATE TABLE IF NOT EXISTS mecha.rls_exempt (
  table_name text PRIMARY KEY,
  reason     text NOT NULL
);
GRANT USAGE ON SCHEMA mecha TO PUBLIC;
GRANT SELECT ON mecha.rls_exempt TO PUBLIC;

-- It reads the catalog rather than the source because a hand-written migration
-- can bypass a generator and cannot bypass this. Every term rejects an object
-- that some earlier version of this called protected, and each is held down by
-- its own assertion. None is decoration; do not simplify one away.
--
-- A function rather than a bare view because `pg_get_expr` renders according to
-- the CALLER's search_path. Unpinned, an auditor with a different one gets false
-- failures, and -- worse -- a policy calling a wide-open `current_scopes()` from
-- another schema on the path renders bare and reads as protected.
--
-- Views and matviews are included because migrations run as the superuser, so
-- every object is superuser-owned: a view without `security_invoker` executes as
-- its owner and bypasses RLS, and a matview is a stored snapshot RLS never
-- evaluates at all. One CREATE VIEW would otherwise defeat the floor silently.
-- Outside `public` for the reason given at `rls_exempt`, and with more to lose:
-- this list names every table the floor does not cover.
--
-- Two drops with different jobs, neither redundant: the unqualified pair clears
-- the objects from `public` in a database created while they lived there; the
-- qualified one is what lets the file be applied to a database that already has
-- it, which is how a correction to the floor reaches one.
DROP VIEW IF EXISTS public.rls_unprotected;
DROP FUNCTION IF EXISTS public.rls_audit();
DROP VIEW IF EXISTS mecha.rls_unprotected;
CREATE OR REPLACE FUNCTION mecha.rls_audit()
  RETURNS TABLE (table_name text, reason text)
  LANGUAGE sql STABLE
  SET search_path = pg_catalog, public
AS $$
  SELECT n.nspname || '.' || c.relname,
         CASE c.relkind
           WHEN 'm' THEN 'materialized view: a snapshot RLS never evaluates'
           WHEN 'v' THEN 'view without security_invoker: runs as its owner'
           ELSE CASE
             WHEN NOT c.relrowsecurity      THEN 'RLS not enabled'
             WHEN NOT c.relforcerowsecurity THEN 'RLS not forced: the owner is exempt'
             ELSE 'no tenancy policy: restrictive, PUBLIC, FOR ALL, both sides the scope test'
           END
         END
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE c.relkind IN ('r', 'p', 'v', 'm')
     AND NOT EXISTS (SELECT 1 FROM mecha.rls_exempt e
                      WHERE e.table_name = n.nspname || '.' || c.relname)
     AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
     AND n.nspname NOT LIKE 'pg\_temp\_%'
     AND n.nspname NOT LIKE 'pg\_toast\_temp\_%'
     AND NOT EXISTS (SELECT 1 FROM pg_depend d
                      WHERE d.objid = c.oid AND d.classid = 'pg_class'::regclass
                        AND d.deptype = 'e')
     AND (c.relkind = 'm'
          OR (c.relkind = 'v'
              AND NOT coalesce(c.reloptions, '{}') @> ARRAY['security_invoker=true'])
          OR (c.relkind IN ('r', 'p')
              AND (NOT c.relrowsecurity
                   OR NOT c.relforcerowsecurity
                   OR NOT EXISTS (
                        SELECT 1 FROM pg_policy p
                         WHERE p.polrelid = c.oid
                           AND NOT p.polpermissive
                           AND p.polroles = '{0}'::oid[]
                           AND p.polcmd = '*'
                           AND pg_get_expr(p.polqual, p.polrelid)
                                 = '(scope_id = ANY (current_scopes()))'
                           AND pg_get_expr(p.polwithcheck, p.polrelid)
                                 = '(scope_id = ANY (current_scopes()))'))))
$$;

-- security_invoker because the audit flags views that lack it, and a check that
-- exempts itself is not one. It runs as the reader either way: rls_audit reads
-- only catalogs.
CREATE VIEW mecha.rls_unprotected WITH (security_invoker = true)
  AS SELECT * FROM mecha.rls_audit();

-- A function is EXECUTE TO PUBLIC by default, so the schema move alone would
-- leave the view denied and the function under it callable by anyone. Both
-- surfaces or neither: assertions 39 and 40. `rls_exempt` is readable by
-- contrast because a GRANT says so.
REVOKE EXECUTE ON FUNCTION mecha.rls_audit() FROM PUBLIC;

-- `rls_exempt` is a table in a schema the audit scans, so it exempts itself
-- -- by a row, in the list a reviewer reads, rather than by a term in the
-- predicate where nobody would find it.
INSERT INTO mecha.rls_exempt VALUES
  ('mecha.rls_exempt', 'the exemption list: readable by all, writable by none')
  ON CONFLICT DO NOTHING;
