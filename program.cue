// The machine rung: hand-compiled hop 2 from ir.html.
@extern(embed)

package iris

import (
	"list"
	bayt "github.com/bonisoft3/bayt/core:bayt"
	"github.com/bonisoft3/pronto"
)

_designMd:          _ @embed(file="DESIGN.md", type=text)
_catalogues:        _ @embed(glob="messages/*.json")
_pictures:          _ @embed(file="assets/manifest.json")
_ugcTranslationSql: _ @embed(file="migrations/20261114_ugc_translation.sql", type=text)

code: pronto.#App & {
	meta: name:        "iris"
	meta: description: "Multilingual waste classification and circular-recovery field guide: snap discarded items, read step-by-step recycling instructions, and locate neighbourhood drop-off bins."
	meta: ir: sha256: ""
	meta: targets: ["docker", "cloudflare"]
	meta: clocks: ["docker", "cloudflare"]
	meta: domain: "iris.cleaning"
	meta: i18n: {
		default: "en"
		locales: {
			en: path: "en"
			es: path: "es"
			pt: path: "pt"
			ru: path: "ru"
			he: path: "he"
			kk: path: "kk"
		}
		catalogues: _catalogues
	}

	capabilities: auth: {required: false, service: "/auth", promote: true}
	capabilities: blobs: false
	capabilities: ai: {
		text: ["browser", "cheap", "heavy"]
		image: ["browser", "cheap", "heavy"]
		targets: local: {
			text: {
				cheap: "gemma3:4b"
				heavy: "gemma3:12b"
			}
			image: {
				cheap: {model: "sd-turbo-q8_0", size: "256x256", steps: 1}
				heavy: {model: "flux1-schnell-q4_k", size: "384x384", steps: 2}
			}
		}
		targets: docker: {
			text: {
				cheap: "gemma3:4b"
				heavy: "gemma3:12b"
			}
		}
		targets: cloudflare: {
			text: {
				cheap: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
				heavy: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
			}
		}
		targets: gcp: {
			text: {
				cheap: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
				heavy: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
			}
		}
		targets: k8s: {
			text: {
				cheap: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
				heavy: {provider: "google", model: "gemini-2.5-flash", params: generationConfig: thinkingConfig: thinkingBudget: 0}
			}
		}
	}
	capabilities: resources: pictures: {
		kind:   "img"
		source: "https:"
		note:   "external waste specimen or news images when supplied as https links"
	}
	capabilities: vendored: "camera-lens": {
		isolation: "realm"
		grants: ["camera"]
		ports: {
			reads: ["ScanDraft"]
			raises: capture: {
				type: "object"
				fields: {
					image_url:      {type: "string", maxLength: 65536}
					segment_region: {type: "string", maxLength: 16, values: ["center", "neck", "base", "full"]}
					segment_status: {type: "string", maxLength: 16, values: ["ready", "segmented"]}
					preset_label:   {type: "string", maxLength: 32, values: ["camera_preset_pet", "camera_preset_organic", "camera_preset_ewaste", "camera_preset_ceramic", "camera_preset_aluminum"]}
					auto_classify:  {type: "string", maxLength: 8, values: ["true", "false"]}
				}
			}
		}
		src:   "shell/units/camera-lens/index.html"
		files: ["shell/units/camera-lens/index.html"]
		note:  "Live camera viewfinder (getUserMedia via realm camera grant) with cover-crop frame capture and local MediaPipe InteractiveSegmenter (magic_touch.tflite pinned by SHA-384 SRI)."
	}

	state: rawMigrations: [
		{name: "003_rls.sql", src: "services/database/sql/003_rls.txt"},
		// As deployed before atomic RLS DDL (#2444); live directories check its digest.
		{name: "005_create_tables.sql", src: "services/database/baseline/005_create_tables.sql"},
		{name: "013_me_provision.sql", src: "services/database/sql/013_me_provision.sql"},
		{name: "014_default_privileges.sql", src: "services/database/sql/014_default_privileges.sql"},
		{name: "015_classify_request.sql", src: "services/database/sql/015_classify_request.sql"},
		{name: "016_translate_item.sql", src: "services/database/sql/016_translate_item.sql"},
		{name: "017_owner_writes.sql", src: "services/database/sql/011_owner_writes.sql"},
		{name: "018_me_readonly.sql", src: "services/database/sql/012_me_readonly.sql"},
		{name: "020_demo_items.sql", src: "services/database/sql/020_demo_items.sql"},
	]

	state: migrations: "20261114_ugc_translation": {operations: [{sql: {up: _ugcTranslationSql, onComplete: true}}]}

	surface: design: (pronto.#DesignMd & {text: _designMd}).design

	state: entities: {
		AppUser: {
			id: "0xa5790856c7af801d"
			table:      "app_user"
			durability: "server"
			access: {scope: "public"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true},
				{ordinal: 2, name: "handle", type: "string", unique: true, cel: "this.size() > 0"},
				{ordinal: 3, name: "display_name", type: "string", required: false, cel: "this.size() <= 60"},
				{ordinal: 4, name: "home_address", type: "string", retired: true},
				{ordinal: 5, name: "address_complement", type: "string", retired: true},
				{ordinal: 6, name: "phone_number", type: "string", retired: true},
				{ordinal: 7, name: "preferred_model", type: "string", default: "'gemini'", cel: "this in ['gemini', 'openai']"},
				{ordinal: 8, name: "created_at", type: "timestamp", default: "now()"},
			]
		}
		Me: {
			id: "0xf5d6b843ee761a50"
			table:      "me"
			durability: "live"
			access: {scope: "private", owner: "id"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, ref: "app_user"},
				{ordinal: 2, name: "handle", type: "string", cel: "this.size() > 0"},
			]
		}
		TrackRequest: {
			id: "0xdeea885db8450bf3"
			table:      "track_request"
			durability: "live"
			access: {scope: "public"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, default: "gen_random_uuid()"},
				{ordinal: 2, name: "user_id", type: "uuid", ref: "app_user", default: "auth_uid()"},
				{ordinal: 3, name: "image_url", type: "string", cel: "this.matches('^(https://|data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$|/pictures/[0-9a-f]{64}\\.(jpg|png|webp)$)') && this.size() <= 65536"},
				{ordinal: 4, name: "model", type: "string", default: "'gemini'", cel: "this in ['gemini', 'openai']"},
				{ordinal: 5, name: "status", type: "string", default: "'submitted'", cel: "this in ['submitted', 'synced', 'classifying', 'classified', 'failed']"},
				{ordinal: 6, name: "user_language", type: "string", default: "'en'", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 7, name: "user_city", type: "string", default: "'São Paulo'", cel: "this.size() <= 80"},
				{ordinal: 8, name: "latitude", type: "string", default: "'-23.5614'", cel: "this.size() <= 32"},
				{ordinal: 9, name: "longitude", type: "string", default: "'-46.6559'", cel: "this.size() <= 32"},
				{ordinal: 10, name: "created_at", type: "timestamp", default: "now()"},
			]
			indexes: [{on: "user_id"}]
		}
		TrashItem: {
			id: "0xd7e715ad4e0ddbb0"
			table:      "trash_item"
			durability: "live"
			access: {scope: "public"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, default: "gen_random_uuid()"},
				{ordinal: 2, name: "request_id", type: "string", unique: true, cel: "this.size() > 0 && this.size() <= 64"},
				{ordinal: 3, name: "user_id", type: "uuid", ref: "app_user", default: "auth_uid()"},
				{ordinal: 4, name: "picture", type: "string", cel: "this.matches('^(https://|data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$|/pictures/[0-9a-f]{64}\\.(jpg|png|webp)$)') && this.size() <= 65536"},
				{ordinal: 5, name: "caption", type: "string", cel: "this.trim().size() > 0 && this.size() <= 160"},
				{ordinal: 6, name: "label", type: "string", cel: "this in ['recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash']"},
				{ordinal: 7, name: "label_key", type: "string", cel: "this in ['cat_recyclable', 'cat_organic', 'cat_eletronic', 'cat_non_recyclable', 'cat_trash']"},
				{ordinal: 8, name: "object_material", type: "string", cel: "this.trim().size() > 0 && this.size() <= 160"},
				{ordinal: 9, name: "disposal_instructions", type: "string", cel: "this.trim().size() > 0 && this.size() <= 2000"},
				{ordinal: 10, name: "sub_classifications", type: "string", cel: "this.size() <= 500"},
				{ordinal: 11, name: "price", type: "string", cel: "this.size() <= 64"},
				{ordinal: 12, name: "is_disposal_place", type: "bool", default: "false"},
				{ordinal: 13, name: "nearby_recycling_places", type: "string", cel: "this.size() <= 600"},
				{ordinal: 14, name: "tagged_as_inappropriate", type: "bool", default: "false"},
				{ordinal: 15, name: "user_language", type: "string", default: "'en'", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 16, name: "latitude", type: "string", default: "'-23.5614'", cel: "this.size() <= 32"},
				{ordinal: 17, name: "longitude", type: "string", default: "'-46.6559'", cel: "this.size() <= 32"},
				{ordinal: 18, name: "created_at", type: "timestamp", default: "now()"},
				{ordinal: 19, name: "search_text", type: "string", generated: "coalesce(caption, '') || ' ' || coalesce(object_material, '') || ' ' || coalesce(label, '')"},
			]
			indexes: [{on: "user_id"}, {on: "label"}]
		}
		TrashItemTranslation: {
			id: "0xd19b0b56796b189d"
			table:      "trash_item_translation"
			durability: "live"
			access: {scope: "public"}
			uniques: [{name: "uq_trash_item_translation_pair", cols: ["item_id", "language"]}]
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, default: "gen_random_uuid()"},
				{ordinal: 2, name: "item_id", type: "uuid", ref: "trash_item"},
				{ordinal: 3, name: "language", type: "string", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 4, name: "caption", type: "string", cel: "this.trim().size() > 0 && this.size() <= 160"},
				{ordinal: 5, name: "disposal_instructions", type: "string", cel: "this.trim().size() > 0 && this.size() <= 2000"},
				{ordinal: 6, name: "created_at", type: "timestamp", default: "now()"},
				{ordinal: 7, name: "object_material", type: "string", default: "''", cel: "this.size() <= 160"},
				{ordinal: 8, name: "sub_classifications", type: "string", default: "''", cel: "this.size() <= 500"},
				{ordinal: 9, name: "price", type: "string", default: "''", cel: "this.size() <= 64"},
				{ordinal: 10, name: "nearby_recycling_places", type: "string", default: "''", cel: "this.size() <= 600"},
			]
			indexes: [{on: "item_id"}]
		}
		TranslationRequest: {
			id: "0xceae60f163b37144"
			table:      "translation_request"
			durability: "server"
			access: {scope: "public"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, default: "gen_random_uuid()"},
				{ordinal: 2, name: "item_id", type: "uuid", ref: "trash_item"},
				{ordinal: 3, name: "user_id", type: "uuid", ref: "app_user", default: "auth_uid()"},
				{ordinal: 4, name: "language", type: "string", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 5, name: "created_at", type: "timestamp", default: "now()"},
			]
			indexes: [{on: "item_id"}]
		}
		DisposalPlace: {
			id: "0xe4310d8e856a5788"
			table:      "disposal_place"
			durability: "live"
			access: {scope: "public"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true, default: "gen_random_uuid()"},
				{ordinal: 2, name: "user_id", type: "uuid", ref: "app_user", default: "auth_uid()"},
				{ordinal: 3, name: "name", type: "string", cel: "this.trim().size() > 0 && this.size() <= 120"},
				{ordinal: 4, name: "img_url", type: "string", default: "'/pictures/a614934e492c15e458ff950a50133af5ff2d73f2b53d7a49598b8e0519cdb23f.jpg'", cel: "this.matches('^(https://|/pictures/[0-9a-f]{64}\\\\.(jpg|png|webp)$)') && this.size() <= 2048"},
				{ordinal: 5, name: "material_type", type: "string", cel: "this in ['recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash']"},
				{ordinal: 6, name: "material_key", type: "string", default: "'cat_recyclable'", cel: "this in ['cat_recyclable', 'cat_organic', 'cat_eletronic', 'cat_non_recyclable', 'cat_trash']"},
				{ordinal: 7, name: "address", type: "string", cel: "this.trim().size() > 0 && this.size() <= 240"},
				{ordinal: 8, name: "phone_number", type: "string", cel: "this.size() <= 40"},
				{ordinal: 9, name: "distance_km", type: "string", default: "'0.8 km'", cel: "this.size() <= 24"},
				{ordinal: 10, name: "latitude", type: "string", default: "'-23.5614'", cel: "this.size() <= 32"},
				{ordinal: 11, name: "longitude", type: "string", default: "'-46.6559'", cel: "this.size() <= 32"},
				{ordinal: 12, name: "created_at", type: "timestamp", default: "now()"},
			]
			indexes: [{on: "material_type"}]
		}
		GalleryView: {
			id: "0x9c8f7015554e5f89"
			table:      "gallery_view"
			durability: "tab"
			fields: [
				{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'view'"},
				{ordinal: 2, name: "tab", type: "string", default: "'global'", cel: "this in ['global', 'my_items']"},
				{ordinal: 3, name: "preview_id", type: "string", default: "'cc000000-0000-4000-8000-000000000001'", cel: "this.size() > 0 && this.size() <= 64"},
				{ordinal: 4, name: "category", type: "string", default: "'all'", cel: "this in ['all', 'recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash']"},
				{ordinal: 5, name: "query", type: "string", default: "''", cel: "this.size() <= 80"},
			]
			seed: [
				{id: "view", tab: "global", preview_id: "cc000000-0000-4000-8000-000000000001", category: "all", query: ""},
			]
		}
		DetailView: {
			id: "0xc0041b25806194d0"
			table:      "detail_view"
			durability: "tab"
			fields: [
				{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'view'"},
				{ordinal: 2, name: "tab", type: "string", default: "'discard'", cel: "this in ['discard', 'details', 'nearby']"},
			]
			seed: [
				{id: "view", tab: "discard"},
			]
		}
		OnboardingStep: {
			id: "0xa28e1047df44d53a"
			table:      "onboarding_step"
			durability: "device"
			fields: [
				{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'step'"},
				{ordinal: 2, name: "step", type: "string", default: "'1'", cel: "this in ['1', '2', '3']"},
				{ordinal: 3, name: "visited", type: "string", default: "'false'", cel: "this in ['false', 'true']"},
			]
		}
		ScanDraft: {
			id: "0x877c9da90e137c4b"
			table:      "scan_draft"
			durability: "tab"
			fields: [
				{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'draft'"},
				{ordinal: 2, name: "image_url", type: "string", default: "'/pictures/aab36d5a8153cdf5533467fffdb0fa843ed0db87f46bbd19f0f634eb2fde11fc.jpg'", cel: "this.matches('^(https://|data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$|/pictures/[0-9a-f]{64}\\\\.(jpg|png|webp|svg)$)') && this.size() <= 65536"},
				{ordinal: 3, name: "preset_label", type: "string", default: "'camera_preset_pet'", cel: "this in ['camera_preset_pet', 'camera_preset_organic', 'camera_preset_ewaste', 'camera_preset_ceramic', 'camera_preset_aluminum']"},
				{ordinal: 4, name: "model", type: "string", default: "'gemini'", cel: "this in ['gemini', 'openai']"},
				{ordinal: 5, name: "user_city", type: "string", default: "'São Paulo'", cel: "this.size() <= 80"},
				{ordinal: 6, name: "segment_region", type: "string", default: "'center'", cel: "this in ['center', 'neck', 'base', 'full']"},
				{ordinal: 7, name: "segment_status", type: "string", default: "'ready'", cel: "this in ['ready', 'segmented']"},
				{ordinal: 8, name: "giou_score", type: "string", default: "'camera_giou_center'", cel: "this in ['camera_giou_center', 'camera_giou_neck', 'camera_giou_base', 'camera_giou_full']"},
				{ordinal: 9, name: "bbox_summary", type: "string", default: "'camera_bbox_center'", cel: "this in ['camera_bbox_center', 'camera_bbox_neck', 'camera_bbox_base', 'camera_bbox_full']"},
				{ordinal: 10, name: "user_language", type: "string", default: "'en'", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
			]
			seed: [
				{id: "draft", image_url: "/pictures/aab36d5a8153cdf5533467fffdb0fa843ed0db87f46bbd19f0f634eb2fde11fc.jpg", preset_label: "camera_preset_pet", model: "gemini", user_city: "São Paulo", segment_region: "center", segment_status: "ready", giou_score: "camera_giou_center", bbox_summary: "camera_bbox_center", user_language: "en"},
			]
		}
		LocalizedItem: {
			id: "0xc21ecdf03eeea896"
			table:      "localized_item"
			durability: "tab"
			fields: [
				{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() > 0 && this.size() <= 64"},
				{ordinal: 2, name: "locale", type: "string", default: "'en'", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 3, name: "caption", type: "string", cel: "this.size() <= 160"},
				{ordinal: 4, name: "original_caption", type: "string", cel: "this.size() <= 160"},
				{ordinal: 5, name: "disposal_instructions", type: "string", cel: "this.size() <= 2000"},
				{ordinal: 6, name: "translated", type: "string", default: "'false'", cel: "this in ['true', 'false', 'pending', 'failed']"},
				{ordinal: 7, name: "object_material", type: "string", default: "''", cel: "this.size() <= 160"},
				{ordinal: 8, name: "sub_classifications", type: "string", default: "''", cel: "this.size() <= 500"},
				{ordinal: 9, name: "price", type: "string", default: "''", cel: "this.size() <= 64"},
				{ordinal: 10, name: "nearby_recycling_places", type: "string", default: "''", cel: "this.size() <= 600"},
			]
		}
		ClassifyJob: {
			id: "0xf5076130d2f50864"
			table:      "classify_job"
			durability: "server"
			access: {scope: "private", owner: "user_id"}
			fields: [
				{ordinal: 1, name: "id", type: "uuid", pk: true},
				{ordinal: 2, name: "user_id", type: "uuid", ref: "app_user"},
				{ordinal: 3, name: "image_url", type: "string", cel: "this.size() > 0 && this.size() <= 65536"},
				{ordinal: 4, name: "model", type: "string", default: "'gemini'", cel: "this in ['gemini', 'openai']"},
				{ordinal: 5, name: "user_language", type: "string", default: "'en'", cel: "this in ['en', 'es', 'pt', 'ru', 'he', 'kk']"},
				{ordinal: 6, name: "user_city", type: "string", default: "'São Paulo'", cel: "this.size() <= 80"},
				{ordinal: 7, name: "latitude", type: "string", default: "'-23.5614'", cel: "this.size() <= 32"},
				{ordinal: 8, name: "longitude", type: "string", default: "'-46.6559'", cel: "this.size() <= 32"},
				{ordinal: 9, name: "status", type: "string", default: "'classifying'", cel: "this in ['classifying', 'done', 'failed']"},
				{ordinal: 10, name: "result_json", type: "string", default: "''", cel: "this.size() <= 8192"},
				{ordinal: 11, name: "created_at", type: "timestamp", default: "now()"},
			]
		}
	}

	state: entityOrder: ["AppUser", "Me", "TrackRequest", "TrashItem", "TrashItemTranslation", "TranslationRequest", "DisposalPlace", "GalleryView", "DetailView", "OnboardingStep", "ScanDraft", "LocalizedItem", "ClassifyJob"]

	state: steps: {jobKey: "019", note: "The steps 013 to 018 write no classify_job row: 015's inserts are inside trigger functions, which the demo items at 020 are the first to fire."}

	state: effects: "classify-waste": {
		key: ["id"]
		input: {
			image_url:     "NEW.image_url"
			model:         "NEW.model"
			user_language: "NEW.user_language"
			user_city:     "NEW.user_city"
		}
		sink: {
			ai:         "text"
			tier:       "heavy"
			idempotent: true
		}
		note: "tsbifrost multimodal vision classification of a captured waste specimen photo into category, material composition, and localized disposal instructions"
	}

	state: mecha: rows: ClassifyJobMachine: {
		entity:  "ClassifyJob"
		field:   "status"
		initial: "classifying"
		states: {
			classifying: {
				invoke: {
					src: "classify-waste"
					onDone: {
						target: "done"
						actions: [{assign: {result_json: {raw: "COALESCE(outcome->'data'->>'result_json', '')"}}}]
					}
					onError: {
						target: "failed"
						actions: [{assign: {result_json: {raw: "COALESCE(outcome->>'kind', 'failed')"}}}]
					}
				}
			}
			done:   {type: "final"}
			failed: {type: "final"}
		}
	}

	surface: handlers: {
		gallery_view: {
			of:   "gallery"
			src:  "shell/handlers/gallery_view.js"
			note: "Switches the gallery between the global community feed and the reader's personal items, updates the desktop specimen preview panel, and steps through the first-time visit onboarding walkthrough."
		}
		detail_view: {
			of:   "detail"
			src:  "shell/handlers/detail_view.js"
			note: "Switches the specimen detail inspection tabs between How to Discard, Material & Streams, and Nearby Centers."
		}
		localize_content: {
			of:   "detail"
			src:  "shell/handlers/localize_content.js"
			note: "Derives tab-local LocalizedItem rows from TrashItem and TrashItemTranslation for the active locale and requests missing UGC translations."
		}
		localize_content_gallery: {
			of:   "gallery"
			src:  "shell/handlers/localize_content.js"
			note: "Derives tab-local LocalizedItem rows on /:shelf? and requests missing UGC translations."
		}
		localize_content_landing: {
			of:   "landing"
			src:  "shell/handlers/localize_content.js"
			note: "Derives tab-local LocalizedItem rows on /lp and requests missing UGC translations."
		}
		localize_content_camera: {
			of:   "camera"
			src:  "shell/handlers/localize_content.js"
			note: "Derives tab-local LocalizedItem rows on /camera and requests missing UGC translations."
		}
		onboarding_step: {
			of:   "intro"
			src:  "shell/handlers/onboarding_step.js"
			note: "Advances or completes the 3-step onboarding walkthrough on /intro."
		}
		scan_draft: {
			of:   "camera"
			src:  "shell/handlers/scan_draft.js"
			note: "Updates the segmented specimen image from camera-lens capture events and classifies with Gemini Flash in the reader's active locale."
		}
	}

	surface: screens: {
		gallery: {
			title: "Explore"
			label: "tab_global"
			// One route, three addresses: Explore (/), My Items (/mine), and Gallery (/gallery).
			route: "/:shelf?"
			entries: [
				{label: "My Items", key: "tab_my_items", params: {shelf: "mine"}},
				{label: "Gallery", key: "nav_gallery", params: {shelf: "gallery"}},
			]
			ssr:   "spa"
			forms: []
			states: ["loading", "populated", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			paths: {
				first_load: {
					states: ["loading", "populated"]
					accepts: ["accept-door", "accept-signin-google", "accept-signin-gallery", "accept-demo-items", "accept-gallery-grid", "accept-intro-stepper", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				switch_tabs: {
					states: ["populated"]
					accepts: ["accept-gallery-tabs", "accept-my-items-phases"]
				}
				preview_panel: {
					states: ["populated"]
					accepts: ["accept-gallery-preview"]
				}
				filter_and_search: {
					states: ["populated"]
					accepts: ["accept-gallery-search-filter"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
		detail: {
			title: "Specimen Detail"
			route: "/images/:id"
			ssr:   "spa"
			forms: [
				{
					id:     "request-translation"
					entity: "TranslationRequest"
					action: "create"
					flow:   "request-translation"
					fields: [
						{name: "item_id", control: "hidden", value: "{id}"},
						{name: "language", control: "select", required: true, options: ["en", "es", "pt", "ru", "he", "kk"]},
					]
				},
			]
			states: ["loading", "populated", "empty", "validation-error", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			keep:  2
			paths: {
				visit: {
					states: ["loading", "populated"]
					accepts: ["accept-detail-page", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				inspect_tabs: {
					states: ["populated"]
					accepts: ["accept-detail-tabs"]
				}
				translate: {
					states: ["populated", "populated"]
					accepts: ["accept-translation-trigger"]
				}
				refused: {
					states: ["populated", "validation-error"]
					accepts: ["accept-translation-trigger"]
				}
				unknown_id: {
					states: ["loading", "empty"]
					accepts: ["accept-detail-unknown"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
		intro: {
			title: "How It Works"
			route: "/intro"
			strip: false
			ssr:   "spa"
			forms: []
			states: ["loading", "populated", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			paths: {
				walkthrough: {
					states: ["loading", "populated"]
					accepts: ["accept-intro-stepper", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
		landing: {
			title: "Iris Campaigns"
			route: "/lp"
			strip: false
			ssr:   "spa"
			forms: []
			states: ["loading", "populated", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			paths: {
				campaigns: {
					states: ["loading", "populated"]
					accepts: ["accept-landing-campaigns", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
		camera: {
			title: "Scan Item"
			label: "nav_camera"
			route: "/camera"
			ssr:   "spa"
			forms: [
				{
					id:     "submit-scan"
					entity: "TrackRequest"
					action: "create"
					flow:   "submit-scan"
					fields: [
						{name: "image_url", control: "hidden", value: "{image_url}"},
						{name: "model", control: "hidden", value: "{model}"},
						{name: "user_language", control: "hidden", value: "{user_language}"},
						{name: "user_city", control: "text", required: true, maxLength: 80},
					]
				},
			]
			states: ["loading", "populated", "validation-error", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			paths: {
				visit: {
					states: ["loading", "populated"]
					accepts: ["accept-camera-scan", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				segment: {
					states: ["populated"]
					accepts: ["accept-camera-segmentation"]
				}
				submit: {
					states: ["populated", "populated"]
					accepts: ["accept-camera-scan", "accept-classify-trigger"]
				}
				refused: {
					states: ["populated", "validation-error"]
					accepts: ["accept-camera-scan"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
		about: {
			title: "About"
			label: "nav_about"
			route: "/about"
			ssr:   "spa"
			forms: []
			states: ["loading", "populated", "populated-dark"]
			files: shared: ["shell/shared/chrome.css", "shell/shared/iris.css"]
			paths: {
				visit: {
					states: ["loading", "populated"]
					accepts: ["accept-about-page", "accept-responsive-geometry", "accept-six-locales-rtl", "accept-specimens-shipped"]
				}
				appearance: {
					states: ["populated", "populated-dark"]
					accepts: ["accept-dual-appearance"]
				}
			}
		}
	}

	surface: flows: {
		"submit-scan": {of: "camera", entity: "TrackRequest", action: "create"}
		"request-translation": {of: "detail", entity: "TranslationRequest", action: "create"}
	}

	meta: tests: {
		"test-door-signin": {
			of:    "gallery"
			says:  "Iris opens directly without a blocking login wall (required: false), offers the Access & Portability modal via the nav rail with Passkey, Google OIDC, and Guest options, and updates the nav rail and modal status when committed as a guest or promoted to a user."
			given: {guest: true}
			when:  "query"
			then:  "output.gate.has_passkey && output.gate.has_google && output.gate.has_guest && output.after_signin.route == 'gallery' && output.after_signin.strip_who.size() > 0 && output.after_signin.has_signout && output.after_signin.has_promote"
		}
		"test-demo-items": {
			of:    "TrashItem"
			says:  "A fresh database holds twelve classified public waste specimens spanning all five categories (recyclable, organic, eletronic, non_recyclable, trash), four disposal places, and localized translations, with every picture served from content-addressed /pictures/ paths."
			given: {seeded: true}
			when:  "query"
			then:  "output.items.size() == 12 && ['recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash'].all(cat, output.items.exists(i, i.label == cat)) && output.places.size() >= 4 && output.translations.size() >= 5 && output.items.all(i, i.picture.startsWith('/pictures/'))"
		}
		"test-gallery-grid": {
			of:    "gallery"
			says:  "The gallery lists non-flagged waste specimens newest first, each card carrying its picture, caption, localized category badge, material summary, and link to /images/:id."
			given: {reader: "aa000000-0000-4000-8000-000000000001"}
			when:  "query"
			then:  "output.cards.size() == 12 && range(output.cards.size() - 1).all(i, output.cards[i].created_at >= output.cards[i + 1].created_at) && output.cards.all(c, !c.tagged_as_inappropriate && c.caption.size() > 0 && c.object_material.size() > 0 && c.link_id == c.id)"
		}
		"test-dual-appearance": {
			of:    "gallery"
			says:  "Every token declared in DESIGN.md carries both a light and a dark value in shell/design.css, and no authored screen or shared stylesheet contains a raw hex colour literal."
			given: {design: "shell/design.css", authored: ["shell/screens/gallery.css", "shell/screens/detail.css", "shell/screens/intro.css", "shell/screens/landing.css", "shell/screens/camera.css", "shell/screens/about.css", "shell/shared/chrome.css", "shell/shared/iris.css"]}
			when:  "read"
			then:  "output.tokens.size() > 0 && output.tokens.all(t, t.light != '' && t.dark != '') && output.authored.all(css, !css.matches('#[0-9a-fA-F]{3,8}'))"
		}
		"test-gallery-tabs": {
			of:    "gallery"
			says:  "Switching the gallery workspace tab between global and my_items patches gallery_view.tab and reveals the personal workspace with its four localized phase pills (submitted, synced, classifying, classified)."
			given: {from: "tab-mine"}
			when:  "click"
			then:  "output.initial_tab == 'global' && output.switched_tab == 'my_items' && output.phases == ['submitted', 'synced', 'classifying', 'classified'] && output.active_requests.size() >= 2 && output.active_requests.all(r, r.user_city.size() > 0)"
		}
		"test-gallery-preview": {
			of:    "gallery"
			says:  "Clicking a specimen card's preview button patches gallery_view.preview_id and updates the desktop side-panel preview to display that specimen's caption, category badge, material, disposal instructions, and link to /images/:id without leaving /."
			given: {target_id: "cc000000-0000-4000-8000-000000000002"}
			when:  "click"
			then:  "output.before_id != output.after_id && output.after_id == input.target_id && output.preview.picture.startsWith('/pictures/') && output.preview.label_key.size() > 0 && output.preview.caption.size() > 0 && output.preview.object_material.size() > 0 && output.preview.disposal_instructions.size() > 0 && output.preview.link_id == input.target_id"
		}
		"test-gallery-search-filter": {
			of:    "gallery"
			says:  "The / gallery screen filters waste specimens by waste stream category (all, recyclable, organic, eletronic, non_recyclable, trash) and case-insensitive caption search query via GalleryView and gallery_view.js, and resets both via #search-clear."
			given: {category: "recyclable", query: "PET"}
			when:  "click"
			then:  "output.initial_category == 'all' && output.initial_query == '' && output.categories == ['all', 'recyclable', 'organic', 'eletronic', 'non_recyclable', 'trash'] && output.after_category == input.category && output.after_query == input.query && output.matching_items.size() >= 1 && output.matching_items.all(i, i.caption.contains(input.query)) && output.cleared_category == 'all' && output.cleared_query == ''"
		}
		"test-detail-page": {
			of:    "detail"
			says:  "An item's detail page reads the specimen by {param.id} and renders its picture, caption, category badge, material, numbered disposal instructions, sub-classifications, estimated recovery value, contributor name, and nearby recycling centers; an unknown id resolves to the empty collection and renders the not-found message with the link back to the gallery."
			given: {id: "cc000000-0000-4000-8000-000000000001"}
			when:  "query"
			then:  "output.found.id == input.id && output.found.picture.startsWith('/pictures/') && output.found.label_key.size() > 0 && output.found.caption.size() > 0 && output.found.disposal_instructions.size() > 0 && output.found.object_material.size() > 0 && output.found.sub_classifications.size() > 0 && output.found.price.size() > 0 && output.found.nearby_recycling_places.size() > 0 && output.found.back_route == 'gallery' && output.unknown.rows == [] && output.unknown.empty_text.size() > 0 && output.unknown.back_route == 'gallery'"
		}
		"test-detail-tabs": {
			of:    "detail"
			says:  "Switching the specimen detail inspection tabs between discard, details, and nearby patches detail_view.tab and displays localized disposal translations on the discard tab and matching neighbourhood drop-off hubs (DisposalPlace) filtered by material_type on the nearby tab."
			given: {id: "cc000000-0000-4000-8000-000000000001"}
			when:  "click"
			then:  "output.initial_tab == 'discard' && output.tabs == ['discard', 'details', 'nearby'] && output.translations.size() >= 5 && output.translations.all(t, t.item_id == input.id && t.caption.size() > 0 && t.disposal_instructions.size() > 0) && output.hubs.size() >= 2 && output.hubs.all(h, h.material_type == 'recyclable' && h.address.size() > 0 && h.distance_km.size() > 0)"
		}
		"test-intro-stepper": {
			of:    "intro"
			says:  "First-time visitors on / see the 3-step onboarding walkthrough (OnboardingStep with visited == 'false'), advance through steps 1, 2, and 3, and set visited == 'true' on Skip or Start Iris now to reveal the gallery permanently on that device, while /intro remains available on demand."
			given: {start: "1"}
			when:  "click"
			then:  "output.initial_step == '1' && output.steps == ['1', '2', '3'] && output.slides.all(s, s.img.startsWith('/pictures/') && s.title.size() > 0 && s.sub.size() > 0) && output.visited_after_start == 'true'"
		}
		"test-about-page": {
			of:    "about"
			says:  "The /about page renders Iris's product overview with fanned specimen cards, the 3-step How it works summary, links to the /lp ad campaign landing pages and /intro walkthrough, and the bonisoft3.com studio attribution card."
			given: {seeded: true}
			when:  "query"
			then:  "output.fan_cards == 3 && output.steps == 3 && output.campaign_links == 3 && output.has_studio_link"
		}
		"test-landing-campaigns": {
			of:    "landing"
			says:  "The /lp campaign showcase presents the three campaign tracks (Snap & Recycle, Small Choices Big Impact, AI for Recycling) with content-addressed visuals, channel badges, and audience notes alongside live non-flagged community specimens and CTAs into / and /intro."
			given: {seeded: true}
			when:  "query"
			then:  "output.campaigns.size() == 3 && output.campaigns.all(c, c.img.startsWith('/pictures/') && c.channel.size() > 0 && c.title.size() > 0 && c.hook.size() > 0 && c.audience.size() > 0) && output.specimens.size() == 12 && output.cta_gallery == 'gallery' && output.cta_intro == 'intro'"
		}
		"test-camera-scan": {
			of:    "camera"
			says:  "The /camera screen mounts the camera-lens unit, classifies with Gemini Flash (model == 'gemini') in the active locale via scan_draft, and submits a TrackRequest with image_url, model, user_language, and user_city."
			given: {model: "gemini", city: "São Paulo"}
			when:  "submit"
			then:  "output.draft.image_url.startsWith('/pictures/') && output.created.model == 'gemini' && output.created.user_city == input.city && output.created.status == 'classified'"
		}
		"test-camera-segmentation": {
			of:    "camera"
			says:  "Tapping an object in the camera-lens unit on /camera runs MediaPipe InteractiveSegmenter and emits a capture event handled by scan_draft.js, updating ScanDraft.image_url, segment_region, and segment_status."
			given: {region: "neck"}
			when:  "click"
			then:  "output.initial_region == 'center' && output.after_region == input.region && output.after_status == 'segmented'"
		}
		"test-classify-trigger": {
			of:    "TrashItem"
			says:  "Inserting a TrackRequest row triggers classify_track_request (015_classify_request.sql), promoting the request to status == 'classified' and creating a corresponding TrashItem row with request_id == request.id, matching waste stream label and label_key, and idempotent conflict handling on request_id."
			given: {request_id: "dd000000-0000-4000-8000-000000000001", image_url: "/pictures/334466b4324a8c80f3204ef4c63cf6892ec20a954880af364b0ad4936aa6093a.jpg"}
			when:  "insert"
			then:  "output.request_status == 'classified' && output.item.request_id == input.request_id && output.item.picture == input.image_url && output.item.label == 'eletronic' && output.item.label_key == 'cat_eletronic' && output.item.caption.size() > 0 && output.item.disposal_instructions.size() > 0 && output.duplicate_count == 1"
		}
		"test-translation-trigger": {
			of:    "TrashItemTranslation"
			says:  "Submitting a TranslationRequest row via request-translation on /images/:id triggers translate_trash_item (016_translate_item.sql), upserting a localized TrashItemTranslation row for (item_id, language) with non-empty caption and disposal_instructions."
			given: {item_id: "cc000000-0000-4000-8000-000000000002", language: "es"}
			when:  "insert"
			then:  "output.translation.item_id == input.item_id && output.translation.language == input.language && output.translation.caption.size() > 0 && output.translation.disposal_instructions.size() > 0 && output.pair_count == 1"
		}
		"test-responsive-geometry": {
			of:    "gallery"
			says:  "Every screen stylesheet declares container-type: inline-size and @container responsive rules, enforces control-height touch targets (--control-h or --control-h-sm), and every screen template specifies explicit width and height attributes on all <img> elements to prevent layout shift."
			given: {stylesheets: ["shell/screens/gallery.css", "shell/screens/detail.css", "shell/screens/intro.css", "shell/screens/landing.css", "shell/screens/camera.css", "shell/screens/about.css"], templates: ["shell/screens/gallery.html", "shell/screens/detail.html", "shell/screens/intro.html", "shell/screens/landing.html", "shell/screens/camera.html", "shell/screens/about.html"]}
			when:  "read"
			then:  "output.stylesheets.size() == 6 && output.stylesheets.all(css, css.contains('container-type: inline-size') && css.contains('@container') && (css.contains('var(--control-h)') || css.contains('var(--control-h-sm)'))) && output.templates.size() == 6 && output.all_imgs_sized"
		}
		"test-six-locales-rtl": {
			of:    "gallery"
			says:  "All six locale catalogues (en, es, pt, ru, he, kk) carry identical key sets, non-empty strings in their target scripts, and matching placeholders, every template and route message key resolves across all six catalogues, and authored stylesheets use logical inline properties for RTL (he) layout."
			given: {locales: ["en", "es", "pt", "ru", "he", "kk"]}
			when:  "read"
			then:  "output.locales == ['en', 'es', 'pt', 'ru', 'he', 'kk'] && output.identical_keys && output.placeholders_match && output.all_refs_resolved && output.logical_rtl_css"
		}
		"test-specimens-shipped": {
			of:    "about"
			says:  "Every /pictures/<sha256> path named across SQL seeds, triggers, program.cue, and screen templates exists under pictures/ and hashes to its filename prefix; assets/manifest.json (39 entries) and pictures/ are in 1-to-1 bijection; and bayt.json serves every picture and every image embedded by ir.html and journal.html."
			given: {manifest: "assets/manifest.json"}
			when:  "read"
			then:  "output.manifest_count == 39 && output.pictures_count == 39 && output.all_sha256_verified && output.seed_copies_agree && output.all_docs_images_served"
		}
	}

	meta: decisions: {
		"decision-auth-door": {}
		"decision-public-read-owner-writes": {}
		"decision-me-row": {}
		"decision-demo-items": {}
		"decision-specimens-shipped": {}
		"decision-inert-first-turn": {}
		"decision-design-identity": {}
		"decision-gallery-workspace": {}
		"decision-detail-tabs": {}
		"decision-intro-and-landing": {}
		"decision-camera-scan": {}
		"decision-escape-hatches": {}
		"decision-classify-trigger": {}
		"decision-translation-trigger": {}
		"decision-responsive-geometry": {}
		"decision-six-locales-rtl": {}
		"decision-driver": {}
	}
}

terminal: (pronto.#DefaultTerminal & {"code": code}).out
_pictureStatics: [for _, v in _pictures {file: "pictures/\(v.file)", target: "/srv/pictures/\(v.file)"}]
cluster:  (pronto.#DefaultCluster & {"code": code, statics: list.Concat([terminal.surface.statics, _pictureStatics])}).out
cluster: surface: targets: {
	// Hermetic Ollama double for `AI_TARGET=docker` CI integration (`airlock-egress` has no internet or GPU);
	// live deployments route through `targets.{cloudflare,gcp,k8s}` and `BAYT_LOCAL_MOCK_AI=0` uses host Ollama.
	smollm3: bayt.healthcheck.http & {
		cmd: "builtin": null
		activate: ""
		"process-compose": activate: "mise x --"
		compose: networks: ["default", "airlock-egress"]
		healthcheck: {
			port:         11434
			path:         "/api/tags"
			start_period: "30s"
		}
		expose: api: {port: 11434, env: "PORT"}
		entrypoint: {
			env: {
				BAYT_LOCAL_MOCK_AI: "${BAYT_LOCAL_MOCK_AI:-1}"
				OLLAMA_UPSTREAM:    "${OLLAMA_UPSTREAM:-http://host.docker.internal:11434}"
			}
			shell: "nu"
			do:    "if (($env.BAYT_LOCAL_MOCK_AI? | default '1') == '0') { if (which ollama | is-empty) { error make { msg: 'ollama not found on PATH' } }; with-env { OLLAMA_HOST: $'127.0.0.1:($env.PORT? | default \"11434\")' } { ^ollama serve } } else { let f = (($env.BAYT_LOCAL_WORK_DIR? | default $nu.temp-dir) | path join 'ollama-iris-mock.ts'); open --raw .bayt/Dockerfile.smollm3 | lines | skip until {|l| $l =~ '^COPY <<.EOF. /srv/ollama.ts$' } | skip 1 | take until {|l| $l == 'EOF' } | str join (char nl) | save -f $f; with-env { HOST: '127.0.0.1' } { ^deno run --allow-net --allow-env $f } }"
			dockerfile: {shell: "sh", do: "deno run --allow-net --allow-env /srv/ollama.ts"}
		}
		dockerfile: {
			from: name: "denoland/deno:debian-2.9.7@sha256:fa335acdf6b72106eda2cb6a8cb5f4187e7630e357467489db4b2e7352d5e432"
			preamble: [
				"""
					COPY <<'EOF' /srv/ollama.ts
					const port = Number(Deno.env.get("PORT") || 11434);
					const host = Deno.env.get("HOST") || "0.0.0.0";
					const mock = (Deno.env.get("BAYT_LOCAL_MOCK_AI") ?? "1") !== "0";
					const upstream = (Deno.env.get("OLLAMA_UPSTREAM") || "http://host.docker.internal:11434").replace(/\\/$/, "");
					Deno.serve({ hostname: host, port }, async (req) => {
					  const url = new URL(req.url);
					  if (!mock) {
					    const proxied = await fetch(`${upstream}${url.pathname}${url.search}`, {
					      method: req.method,
					      headers: req.headers,
					      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
					    });
					    return new Response(proxied.body, { status: proxied.status, headers: proxied.headers });
					  }
					  if (url.pathname === "/api/tags") {
					    return Response.json({ models: [{ name: "gemma3:4b" }, { name: "gemma3:12b" }] });
					  }
					  if (url.pathname === "/api/chat") {
					    const body = await req.json().catch(() => ({}));
					    const model = String(body.model || "gemma3:4b");
					    const rawMessages = JSON.stringify(body.messages || "");
					    if (rawMessages.includes("[TRANSLATE:")) {
					      return Response.json({
					        model,
					        done: true,
					        message: {
					          role: "assistant",
					          content: JSON.stringify({
					            caption: "Botella de agua mineral PET #1 transparente (500 ml)",
					            object_material: "Tereftalato de polietileno (PET #1) con tapa HDPE #2",
					            disposal_instructions: "1. Vacíe el líquido restante por completo. 2. Enjuague brevemente y deposítela en reciclables secos.",
					            sub_classifications: "Reciclable · Envase de bebida · Ciclo cerrado",
					            price: "US$ 0,85 / kg (flujo reciclable seco)",
					            nearby_recycling_places: "Ecoponto Pinheiros (0,6 km) · Cooperativa Vila Mariana (1,4 km)"
					          })
					        }
					      });
					    }
					    const isHeavy = model.includes("12b") || model.includes("26b");
					    return Response.json({
					      model,
					      done: true,
					      message: {
					        role: "assistant",
					        content: JSON.stringify({
					          caption: isHeavy ? "Clear PET #1 Mineral Water Bottle (500 ml)" : "Pressed Aluminum Beverage Can (350 ml · ALU #41)",
					          label: "recyclable",
					          object_material: isHeavy ? "Polyethylene Terephthalate (PET #1) with HDPE #2 cap" : "Beverage-grade Aluminum Alloy (AA 3004 / 5182 · ALU #41)",
					          disposal_instructions: "1. Empty any remaining liquid completely. 2. Quick-rinse and place in the dry recyclables bin.",
					          sub_classifications: "Recyclable · Beverage Container · Closed-Loop Stream",
					          price: "US$ 0.85 / kg (sorted recyclable stream)",
					          nearby_recycling_places: "Ecoponto Pinheiros (0.6 km) · Cooperativa Vila Mariana (1.4 km)"
					        })
					      }
					    });
					  }
					  return new Response("Not Found", { status: 404 });
					});
					EOF
					""",
			]
		}
	}
	tsbifrost: entrypoint: env: {
		AI_LOCAL_OLLAMA_HOST: {peer: "smollm3", port: "api", prefix: "http://"}
	}
	launch: compose: depends_on: smollm3: {condition: "service_healthy"}
}
loop:     (pronto.#DefaultLoop & {"code": code, "cluster": cluster, "terminal": terminal}).out
build:    (pronto.#DefaultBuild & {"code": code, "loop": loop, "cluster": cluster, "terminal": terminal}).out
out:      pronto.#emit & {"code": code, "cluster": cluster, "terminal": terminal, "loop": loop, "build": build}

loop: surface: checks: "screens": {
	verb: "test"
	cmds: [
		"\(pronto.#Harness.rule); deno test \(pronto.#Harness.flags) --no-check --allow-env --allow-read tests/screens.test.ts",
	]
	note: "mounted screen poses over posed rows, first-time visit onboarding walkthrough, and pure Jessie handler folds across all five handlers"
}

loop: surface: checks: "appearance": {
	verb: "test"
	cmds: [
		"deno test --config tests/deno.json --lock tests/deno.lock --frozen --allow-read tests/appearance.test.ts",
	]
	note: "dual-appearance token parity, WCAG AA contrast across light and dark modes, zero raw colour literals, and custom property resolution across authored stylesheets"
}

loop: surface: checks: "catalogues": {
	verb: "test"
	cmds: [
		"deno test --config tests/deno.json --lock tests/deno.lock --frozen --allow-read tests/catalogues.test.ts",
	]
	note: "six-locale catalogue completeness (en, es, pt, ru, he, kk), target-script translations, template message-key resolution, and logical RTL CSS properties"
}

loop: surface: checks: "pictures": {
	verb: "test"
	cmds: [
		"deno test --config tests/deno.json --lock tests/deno.lock --frozen --allow-read tests/pictures.test.ts",
	]
	note: "content-addressed specimen manifest bijection, SHA-256 file integrity, and bayt.json static asset serving"
}

build: checks: "ledger": {
	priority: 1
	cmds: [
		"\(pronto.#Harness.check); deno test \(pronto.#Harness.flags) --allow-env --allow-read --allow-net --unsafely-ignore-certificate-errors=caddy,localhost,127.0.0.1 tests/ledger.ts",
	]
	note: "multi-session guest RLS, forged-write refusal, synchronous classification and translation triggers, and request_id idempotency"
}

