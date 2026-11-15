# Release

iris's `meta.targets` are `docker` and `cloudflare`; both are built from the
same `program.cue` specification, the appliance for a single host and the edge
Worker for global guests.

## Docker appliance

`./saytw release@docker --snapshot` builds `ghcr.io/bonisoft3/iris` (or
`${BAYT_DOCKER_REPOSITORY}`): PostgreSQL 18, PostgREST, Caddy, and the auth
service under process-compose in one container, Caddy listening on `PORT`
(8080), `ORIGIN` setting the public base URL, and `PGDATA` mounting the
persistent volume where `_pronto_migrations` runs pending SQL migrations in
order (`000`–`016`, plus `020_demo_items.sql` on fresh volumes). All 39
content-addressed specimen, drop-off hub, campaign, stepper, and stream icon
assets are baked into the image and served immutably from `/pictures/<sha256>`.

## Cloudflare

`./saytw release@cloudflare --snapshot` builds `dist/cloudflare` as a dry-run
bundle without minting a git tag. Without `--snapshot` it tags
`apps/iris/vX.Y.Z` on HEAD and publishes the Cloudflare Worker with `wrangler`,
provisioning or preserving the JWT secret, loading the seeded waste-specimen
network (`020_demo_items.sql`), and serving the 39 content-addressed
`/pictures/<sha256>` assets and six locale catalogues (`en`, `es`, `pt`, `ru`,
`he`, `kk`) from the edge bundle. Pass `--reset` whenever an emitted migration
script changed since the previous publish so the edge migration ledger reloads
cleanly.

`./saytw verify@cloudflare` sweeps every static asset, locale catalogue, and
document route (Tier 1) and runs the ten Playwright journeys in
`tests/verify.ts` (Tier 2): a guest signs in at the door on `/`, visits
`/images/:id`, `/intro`, `/lp`, `/camera`, `/places`, `/profile`, `/news`, and
`/credits`, exercises GIoU segmentation and scan submission on `/camera` (with
automatic cleanup of transient rows), saves profile preferences on `/profile`,
and verifies zero horizontal overflow at `390×844` phone width under the
zero-tolerance network trap.

[[index|Iris documentation]] · [[../journal.html|Journal]] · [[../ir.html|Application design]]
