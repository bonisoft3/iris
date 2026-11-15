# iris

An intelligent waste-classification field guide and circular recovery companion,
as pronto builds one: people photograph or pick discarded specimens, inspect
their material composition and step-by-step disposal instructions across six
languages (`en`, `es`, `pt`, `ru`, `he`, `kk` with right-to-left Hebrew layout),
locate or register neighbourhood drop-off bins, offer reusable items for
community donation, and track sustainability impact across light and dark
appearances. Twelve classified specimens, four drop-off hubs, three reuse
offers, and seven localized dispatches already live in the seed (`020_demo_items.sql`),
served from 39 content-addressed `/pictures/<sha256>` assets.

It exercises the server-durable circular-recovery shape: public tables with
additive owner-write policies and explicit column grants (`011_owner_writes.sql`),
a private `Me` row and `AppUser` defaults provisioned synchronously on guest
creation (`012_me_readonly.sql`, `013_me_provision.sql`), deterministic SQL
triggers that promote a `TrackRequest` into a `TrashItem` (`015_classify_request.sql`)
and a `TranslationRequest` into a `TrashItemTranslation` (`016_translate_item.sql`),
and seven pure Jessie handlers (`gallery_view.js`, `detail_view.js`,
`onboarding_step.js`, `scan_draft.js`, `places_view.js`, `news_view.js`,
`localize_content.js`) over tab-durable view registers.

Five instruments decide what a walk cannot: `tests/ledger.ts`, a priority-1
build check that runs at `integrate` against the cluster with multiple guest
sessions; `tests/screens.test.ts`, over screens mounted on posed rows and all
seven pure Jessie handlers; `tests/appearance.test.ts`, `tests/catalogues.test.ts`,
and `tests/pictures.test.ts`, over dual-appearance WCAG AA contrast, six-locale
RTL catalogues, and 39 content-addressed assets; and `tests/verify.ts`, the
browser journeys every release is verified with.

The [[ir.html|application design]] describes the implemented behavior, the
[[DESIGN.md|visual design]] the authored presentation, [[acceptance.md]] what
done looks like one check a line, [[brief.md]] where the work stands, and the
[[journal.html|journal]] each turn's evidence. Every document is indexed in
[[docs/index|docs/index.md]].

## Running it

`./saytw <verb>` from the app's directory: `setup` mints the local certificate,
`generate && lint` compiles the program and gates the spec, `build && test`
runs the surface batteries, `integrate@host` runs the replay, the visual gate,
and the multi-session ledger driver against the host stack, and `launch@host`
publishes the door at https://localhost:27246. Stop the launch stack before
`integrate` when running the container stack.

## Releasing it

`meta.targets` is `docker` and `cloudflare`. `release@cloudflare --snapshot`
builds the self-contained edge Worker bundle in `dist/cloudflare`; without
`--snapshot` it tags the release, publishes the edge Worker and custom domain,
and loads the seeded waste-specimen network (`--reset` when a migration changed
since the last publish). `verify@cloudflare` sweeps every route and runs the
ten browser journeys in `tests/verify.ts` against the deployment. See
[[docs/release|the release doc]] for what each target needs.
