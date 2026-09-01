// The virtual terminal, published as CUE: omnishell's unconfigured shell for
// one app — the entry page and the static-file wiring the cluster's proxy
// serves, against default entrypoints (shell/shell.yaml, the interpreter at
// /omnishell/interpreter/). Configure or override by unification; pin or fork
// this package to version the terminal independently of the app.
@extern(embed)

package terminal

import (
	"list"
	"strings"
)

#Path:   string
#Jessie: #Path & =~"\\.js$"

// Embedded locally: @embed cannot cross a directory boundary, so this only
// works because shell.html/shell.css/boot.js live beside this file. Exposed
// on #Terminal.surface.assets; emit.cue reads them as plain CUE values
// (text:), never a src: path — write.ts refuses any src leaving the app's
// own directory (checked directly).
_shellHtmlAsset: _ @embed(file="shell.html", type=text)
_shellCssAsset:  _ @embed(file="shell.css", type=text)
_bootJsAsset:    _ @embed(file="boot.js", type=text)

// @embed may descend into this package's own subdirectories, though never
// above it — the same rule that keeps the shell assets local. The
// `bundle:zag` script clears this directory before writing, so what is matched
// here is exactly what the build produced — including the shared chunks, whose
// names are the bundler's to choose.
_zagBundle: _ @embed(glob="interpreter/vendor/zag/*.js", type=text)

// cluster.#Static-shaped, not imported — see the terminal-planes doc's
// note on why terminal.cue and cluster.cue each define their own copy
// rather than coupling the two packages together.
#Static: {
	source: string
	file:   #Path
	target: string
	watch:  *false | bool
}

#Terminal: T={
	app: string
	// Fills the entry page's meta description. Double quotes would close the
	// attribute they land in.
	description: string
	description: !~ "\""

	state: {
		navigation: true
	}

	capabilities: {
		// Platform doctrine, published as data. Pronto reads this at compile
		// time: the prelude describes it to hop 1, and #emit refuses an app auth
		// mode the terminal does not offer. Users never type identifiers — a
		// passkey ceremony is one tap with a server-generated display handle,
		// and a guest mint (always rendered, origin-independent, no ceremony)
		// issues the same identity shape; social hand-off (firebase) is the
		// planned third mode.
		// `chrome` is the strip the terminal draws for a signed-in person and
		// what an app may tell it about that person: `self.path`, the route
		// that is their own page, whose :params the terminal fills from the
		// session user; and `self.name`, the table and column the name they
		// chose lives in, read live so a rename reaches the strip as it
		// reaches a byline. An app with no page for a person declares no
		// `self` and the handle stands alone — but then the one identity a
		// reader always has on screen leads nowhere.
		auth: {
			modes:    [...string]
			identity: string
			chrome:   string
		}
		auth: {
			modes:    ["passkey", "guest"]
			identity: "generated"
			chrome:   "<name · handle> · sign out; self.path and self.name are the app's"
		}

		// What data-text-format may name without the app declaring anything.
		// plain and datetime are value formatting, text in and text out; an app
		// formatting its own timestamps has reimplemented a platform affordance
		// and will differ from every other app for no reason a reader benefits
		// from. The list is not closed — any other name is an app's own
		// renderer, per `renderer` below.
		"text-formats": [Name=string]: {renders: string, note: string}
		"text-formats": plain:    {renders: "the column's text, placeholders interpolated", note: "the default when data-text-format is absent"}
		"text-formats": datetime: {renders: "one fixed UTC human timestamp (\"Aug 2, 09:00\")", note: "raw ISO / postgres timestamptz never reaches a reader"}

		// The renderer role, and the terminal's DOM mutation story. A renderer
		// is a pure (value) => nodes function; interpreter/render.js states why
		// and enforces it. The terminal owns the trusted half and only that: an
		// app wanting highlighting, diagrams or maths declares the renderer it
		// wants rather than waiting for this list to grow one.
		//
		// data-text-format names a built-in format or an app renderer
		// resolved by basename out of the route's files.renderers — the same
		// resolution a data-handler gets. A name colliding with a built-in is
		// refused rather than shadowed.
		renderer: {
			role:    string
			returns: string
			owns: [Name=string]: {is: string, note: string}
			note: string
		}
		renderer: {
			role:    "jessie, evaluated in a compartment with nothing endowed, like handler and adapter"
			returns: "an array of nodes, where a node is a string (always text) or {tag, attrs?, children?}"
			owns: schema: {is: "the node description", note: "there is no node kind for raw markup, so no renderer can ask for it and no value can smuggle it"}
			owns: tags: {is: "a prose-element allowlist", note: "no script/style, no iframe/object/embed (that is the hatch, under a sandbox), no form/input (mutations are forms a screen author wrote), no svg/math"}
			owns: attributes: {is: "a per-tag attribute allowlist", note: "on* and style refused; data-* refused hardest, since it is the terminal's own binding vocabulary and a renderer emitting one could forge a region, a binding or a hatch mount out of a reader's prose"}
			owns: urls: {is: "the http/https/mailto scheme check", note: "applied by the builder whether or not the renderer consulted it; a refused URL drops the attribute rather than throwing, because a reader's content must not take the screen down"}
			owns: reconciliation: {is: "the DOM write itself", note: "an unchanged description is not written at all, so a re-bind cannot cost the reader their text selection and idempotence is structural rather than each renderer's to earn"}
			note: "a structural violation — unknown tag, malformed node, refused attribute — throws, because that is a bug in the renderer and not in anyone's data"
		}

		// What data-widget may name. Each kind is its own module, fetched the
		// first time a screen mounts one, so an app's widget cost is the kinds
		// it uses and not the vocabulary's size. The dispatcher is generic
		// (interpreter/widget.js): the app supplies a Jessie adapter turning its
		// rows into {value, label} items and a selection back into mutation
		// values, and each kind's own anatomy — not this list — is the authority
		// on its part names.
		//
		// A kind can only appear here if that generic path drives it. A
		// row-backed kind builds its collection from a flat item list and
		// accepts COLLECTION.SET; a field-backed one dresses a form control and
		// describes the parts the machine computes. Both report through
		// onValueChange, which is the seam every kind shares.
		widgets: [Name=string]: {selects: string, parts: [...string], note: string}
		widgets: combobox: {
			selects: "one row, by typing"
			parts: ["clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "root", "trigger"]
			note: "type-ahead over a live region's rows; the list is a popover Zag positions, so positioner is required and the input is the part a reader types into"
		}
		widgets: select: {
			selects: "one row, from a popover"
			parts: ["clearTrigger", "content", "control", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "root", "trigger", "valueText"]
			note: "combobox's collection without the text filter; valueText renders the current selection where combobox puts its input"
		}
		widgets: listbox: {
			selects: "one or more rows, always visible"
			parts: ["content", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "root", "valueText"]
			note: "no popover, so the only kind that needs no positioner — the inline choice a form shows without a click"
		}
		widgets: "date-picker": {
			selects: "one date, from a calendar"
			parts: ["clearTrigger", "content", "control", "input", "nextTrigger", "positioner", "prevTrigger", "root", "table", "tableBody", "tableCell", "tableHead", "tableRow", "trigger", "view", "viewControl", "viewTrigger"]
			note: #"field-backed: it dresses a native <input type="date">, which keeps the name, validity and value the form submits, so nothing downstream learns a widget was here. The day grid is the machine's own — no region holds those cells and no markup could author them — so this kind describes them and the terminal builds them under the renderer's allowlist"#
		}

		widgets: "file-upload": {
			selects: "one or more files, from a dialog or a drop"
			parts: ["clearTrigger", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "root", "trigger"]
			note: #"field-backed: it dresses a native <input type="file">, whose FileList stays what the form submits — written through a DataTransfer, the only way a machine's list can become a control's value. The chosen files are the machine's own list, arriving from a dialog and a drop rather than from a query, so this kind describes one row per file and the terminal builds them. A dropzone is the one affordance the platform supplies no primitive for"#
		}

		sensors: [Name=string]: {yields: string, note: string}
		sensors: camera:               {yields: "captured frame (Blob), via a returned request", note: "one MediaStream per tab; CameraView is terminal chrome, not a mountable unit"}
		sensors: microphone:           {yields: "captured audio clip (Blob), via a returned request", note: "getUserMedia's audio half"}
		sensors: "screen-capture":     {yields: "a captured frame or recording (Blob), via a returned request", note: "getDisplayMedia"}
		sensors: geolocation:          {yields: "{lat: number, lng: number, accuracy: number}, via a returned request", note: "one-shot read only"}
		sensors: "device-orientation": {yields: "an orientation/acceleration reading", note: "fires continuously — blocked on Q3 (do subscriptions generalize?), declared but not yet grantable"}

		background: [Name=string]: {yields: string, note: string}
		background: notifications:     {yields: "a shown notification, via a returned request", note: "Notifications API"}
		background: push:              {yields: "a push subscription (endpoint + keys), via a returned request", note: "the push event itself fires in the service worker, never in a unit — blocked on service-worker registration support, not yet grantable"}
		background: "background-sync": {yields: "a registered sync tag, via a returned request", note: "same service-worker-only firing as push — same block"}
		background: "wake-lock":       {yields: "an active, auto-released wake lock, via a returned request", note: "Screen Wake Lock API"}

		hardware: [Name=string]: {yields: string, note: string}
		hardware: usb:       {yields: "a connected USB device handle, via a returned request", note: "WebUSB"}
		hardware: hid:       {yields: "a connected HID device handle, via a returned request", note: "WebHID"}
		hardware: serial:    {yields: "a connected serial port handle, via a returned request", note: "Web Serial"}
		hardware: bluetooth: {yields: "a connected Bluetooth device handle, via a returned request", note: "Web Bluetooth"}
		hardware: nfc:       {yields: "a scanned NFC tag reading, via a returned request", note: "Web NFC"}

		"os-bridge":    [Name=string]: {yields: string, note: string}
		"network-peer": [Name=string]: {yields: string, note: string}

		// Boundaries a unit can be given. "compartment" is SES, and it is what
		// generated logic runs in — pure, endowment-free, the terminal's own
		// code. "iframe" is the hatch's: a vendored unit the app brings, which
		// is trusted because an engineer audited it, and contained because what
		// it renders (a provider's embed) was audited by nobody. "worker" is
		// declared by #App.capabilities.vendored and not implemented here — a
		// unit asking for it is refused at mount rather than quietly given a
		// different boundary.
		isolation: [...string]
		isolation: *["compartment", "iframe"] | [...string]

		// The terminal-tier hatch. Props in are the mount element's
		// data-prop-* attributes, resolved against the row by the same binder
		// as every other attribute and resynchronised on every refresh, so a
		// hatch in a live region tracks its row for free. Events out are named
		// messages the unit posts over its lifetime; the terminal performs the
		// names it knows and hands the rest to the screen.
		hatch: {
			isolation: string
			mount:     string
			props:     string
			events: [Name=string]: {performs: string, note: string}
			grants: [...string]
			note: string
		}
		hatch: {
			isolation: "iframe"
			mount:     "data-hatch=\"<unit>\", naming an #App.capabilities.vendored entry"
			props:     "data-prop-* attributes, delivered as one current-value object"
			events: height: {performs: "sets the unit frame's height", note: "the unit measures itself; clamped so a wrong answer cannot blow out the page"}
			// An opaque origin is granted nothing, and the terminal refuses a
			// unit that asks for a capability rather than granting silence.
			grants: []
			note: "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox, never allow-same-origin — the unit runs in an opaque origin and cannot reach this one. Props are delivered with targetOrigin \"*\", which an opaque origin leaves no alternative to, so a hatch is never given a secret"
		}
	}

	surface: {
		// entry/css/boot are app-relative TARGET paths — where these land in
		// the app's own served tree, alongside shell.yaml and design.css
		// (pronto/emit.cue-owned, not declared here). Their CONTENT comes from
		// assets below; see _shellHtmlAsset. design.css isn't listed here —
		// it's #App's own generated file, nothing omnishell-specific about it.
		entry: #Path
		entry: *"shell/index.html" | string
		css: #Path
		css: *"shell/shell.css" | string
		boot: #Path
		boot: *"shell/boot.js" | string

		assets: {
			html: strings.Replace(
				strings.Replace(_shellHtmlAsset, "{description}", T.description, 1),
				"{modulepreload}", _preloadHtml, 1)
			css:  _shellCssAsset
			boot: _bootJsAsset
		}

		interpreterRoot: #Path
		interpreterRoot: *"../../plugins/omnishell/interpreter" | string

		// The entry page fetches the boot graph in parallel at t=0 instead of
		// discovering each import a round-trip after its parent executes.
		// data.js and storybook.js are tier-gated and stay lazy; ses stays
		// undeclared here too — jessie.js injects it for handlers, after first
		// paint, and preloading its bytes at t=0 starves the paint-critical
		// modules on a slow link.
		_preloadSkip: {"data.js": true, "storybook.js": true, "vendor/ses.umd.min.js": true}
		_preloadHtml: strings.Join([for m in modules if _preloadSkip[m] == _|_ {
			"<link rel=\"modulepreload\" href=\"/omnishell/interpreter/\(m)\">"
		}], "\n")

		modules: [...#Path]
		modules: list.Concat([
			[
				"shell.js", "screen.js", "fragment.js", "data.js", "data-crud.js", "render.js",
				"hatch.js", "storybook.js", "widget.js", "tier2-engine.js", "jessie.js",
				"vendor/mecha-client.js", "vendor/js-yaml.js", "vendor/ses.umd.min.js",
			],
			// One module per kind in capabilities.widgets plus their shared
			// chunks, hash-named and so globbed rather than listed.
			[for p, _ in _zagBundle {strings.TrimPrefix(p, "interpreter/")}],
		])

		screens: [...{name: string, html: #Path, css: #Path}]

		handlers: [...#Jessie]
		handlers: *[] | [...#Jessie]

		// The renderer modules backing app-declared `data-text-format` names
		// (see `renderer` above). Served like a handler and resolved like one,
		// by basename out of each route's files.renderers.
		renderers: [...#Jessie]
		renderers: *[] | [...#Jessie]

		// Stylesheets screens share. Served like any other static; the list is
		// the union of what screens name, so it holds only referenced files.
		shared: [...#Path]
		shared: *[] | [...#Path]

		// Fold modules named by `pipelines[].fold`. Served because the terminal
		// runs them itself — over the local collections, to show a sink's total
		// before the CDC loop has folded this session's own writes in.
		folds: [...#Jessie]
		folds: *[] | [...#Jessie]

		// Invariants of the terminal's own rendering surface, which no app can
		// re-derive — the same reason auth, text-formats and widgets are
		// published here. `verb` is the layer the check needs: this battery
		// measures a laid-out page against real content, so it cannot run
		// without the cluster up, however cheap `lint` would look.
		checks: [Name=string]: {verb: "setup" | "lint" | "test" | "integrate", cmds: [...string], note: string}
		checks: visual: {
			verb: "integrate"
			cmds: [
				"docker compose up -d --wait launch",
				// Broad permissions are playwright's, not the checker's: it reads
				// the browser bundle, writes a throwaway profile, spawns the
				// browser and reads the host platform.
				// The door is TLS on a per-developer mkcert certificate this
				// runner does not trust. Playwright's own contexts are told to
				// ignore it in the checker, but the checker ALSO fetches
				// /auth/guest with Deno's fetch, which that flag does not reach —
				// hence the runtime flag here as well.
				"deno run --allow-read --allow-write --allow-net --allow-env --allow-run --allow-sys --unsafely-ignore-certificate-errors \(T.surface.visualCheck) .",
			]
			note: "DOM checks over every route at two viewports; only critical findings fail"
		}
		visualCheck: #Path
		visualCheck: *"../../plugins/omnishell/check-visual.ts" | string

		statics: [...#Static]
		statics: list.Concat([
			[
				{source: "shell-entry", file: T.surface.entry, target: "/srv/\(T.surface.entry)", watch: false},
				{source: "shell-css", file: T.surface.css, target: "/srv/\(T.surface.css)", watch: false},
				{source: "shell-boot", file: T.surface.boot, target: "/srv/\(T.surface.boot)", watch: false},
				{source: "shell-config", file: "shell/shell.yaml", target: "/srv/shell/shell.yaml", watch: false},
				{source: "shell-design-css", file: "shell/design.css", target: "/srv/shell/design.css", watch: false},
			],
			[for s in T.surface.screens for kind in ["html", "css"] {
				source: "screen-\(s.name)-\(kind)"
				file:   s[kind]
				target: "/srv/\(s[kind])"
				watch:  true
			}],
			[for h in T.surface.handlers {
				source: "handler-\(strings.Replace(h, "/", "-", -1))"
				file:   h
				target: "/srv/\(h)"
				watch:  true
			}],
			[for r in T.surface.renderers {
				source: "renderer-\(strings.Replace(r, "/", "-", -1))"
				file:   r
				target: "/srv/\(r)"
				watch:  true
			}],
			[for c in T.surface.shared {
				source: "shared-\(strings.Replace(c, "/", "-", -1))"
				file:   c
				target: "/srv/\(c)"
				watch:  true
			}],
			[for f in T.surface.folds {
				source: "fold-\(strings.Replace(f, "/", "-", -1))"
				file:   f
				target: "/srv/\(f)"
				watch:  true
			}],
			[for m in T.surface.modules {
				source: "omnishell-\(strings.Replace(m, "/", "-", -1))"
				file:   "\(T.surface.interpreterRoot)/\(m)"
				target: "/omnishell/interpreter/\(m)"
				watch:  false
			}],
		])
	}
}
