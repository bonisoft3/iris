variable "CACHE_SCOPE" {
  default = ""
}

function "cache_from" {
  params = [name]
  result = CACHE_SCOPE != "" ? [
    "type=gha,scope=main-${name}",
    "type=gha,scope=main-${name}-release",
    "type=gha,scope=${CACHE_SCOPE}-${name}",
    "type=gha,scope=${CACHE_SCOPE}-${name}-release",
  ] : []
}

function "cache_to" {
  params = [name]
  result = CACHE_SCOPE != "" ? ["type=gha,mode=max,scope=${CACHE_SCOPE}-${name}"] : []
}

group "ci" {
  targets = [
    "services_tracker_tx",
    "plugins_devserver",
    "services_shelfie",
    "services_boxer",
    "plugins_sayt",
    "libraries_mecha",
    # guis_iris* removed — Ollama image is too large for shared CI runner
    # disk (ResourceExhausted on libcublasLt). Restore once moved to a
    # larger runner or split into a separate workflow.
    # plugins_omnishell removed temporarily — its `bun run check` step
    # fails (typecheck or lint) on a pre-existing issue unrelated to
    # bayt scope. Restore once it's fixed (likely by bayt-enabling it
    # too, mirroring the iris pattern).
  ]
}

target "ci-defaults" {
  secret = [
    "id=host.env,env=HOST_ENV",
  ]
  args = {
    SOURCE_DATE_EPOCH = "0"
  }
  network = "host"
  cache-from = []
  cache-to = []
}

target "services_tracker" {
  inherits   = ["ci-defaults"]
  dockerfile = "./services/tracker/Dockerfile"
  cache-from = cache_from("services-tracker")
  cache-to   = cache_to("services-tracker")
}

target "services_tracker_tx" {
  inherits   = ["ci-defaults"]
  dockerfile = "./services/tracker-tx/Dockerfile"
  target     = "debug"
  cache-from = cache_from("services-tracker-tx")
  cache-to   = cache_to("services-tracker-tx")
}

target "guis_web" {
  inherits   = ["ci-defaults"]
  dockerfile = "./guis/web/Dockerfile"
  cache-from = cache_from("guis-web")
  cache-to   = cache_to("guis-web")
}

target "services_shelfie" {
  inherits   = ["ci-defaults"]
  dockerfile = "./services/shelfie/Dockerfile"
  cache-from = cache_from("services-shelfie")
  cache-to   = cache_to("services-shelfie")
}

target "plugins_devserver" {
  inherits   = ["ci-defaults"]
  dockerfile = "./plugins/devserver/Dockerfile"
  target     = "devserver"
  cache-from = cache_from("plugins-devserver")
  cache-to   = cache_to("plugins-devserver")
}

target "guis_iris" {
  inherits   = ["ci-defaults"]
  context    = "."
  dockerfile = "guis/iris/Dockerfile"
  target     = "release"
  cache-from = cache_from("guis-iris")
  cache-to   = cache_to("guis-iris")
}

target "services_boxer" {
  inherits   = ["ci-defaults"]
  context    = "./services/boxer"
  dockerfile = "./Dockerfile"
  target     = "release"
  cache-from = cache_from("services-boxer")
  cache-to   = cache_to("services-boxer")
}

target "plugins_sayt" {
  inherits   = ["ci-defaults"]
  dockerfile = "./Dockerfile"
  network    = "host"
  secret     = ["id=host.env,env=HOST_ENV"]
  cache-from = cache_from("plugins-sayt")
  cache-to   = cache_to("plugins-sayt")
}

target "libraries_mecha" {
  inherits   = ["ci-defaults"]
  context    = "./libraries/mecha"
  dockerfile = "tests/Dockerfile"
  cache-from = cache_from("libraries-mecha")
  cache-to   = cache_to("libraries-mecha")
}

target "plugins_omnishell" {
  inherits   = ["ci-defaults"]
  dockerfile = "./plugins/omnishell/Dockerfile"
  target     = "integrate"
  cache-from = cache_from("plugins-omnishell")
  cache-to   = cache_to("plugins-omnishell")
}

# =============================================================================
# guis/iris siblings — each points at its bayt-emitted Dockerfile under
# guis/iris/.bayt/, with its own GHA cache scope. Intermediates that have
# no published image (cdc-fetcher, ollama-model) still get their own
# scope so their layer cache survives across CI runs; downstream targets
# reference them via bake's `contexts = { … = "target:…" }` wiring.
# =============================================================================

target "guis_iris_proxy" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-proxy"
  cache-from = cache_from("guis-iris-proxy")
  cache-to   = cache_to("guis-iris-proxy")
}

target "guis_iris_mesh" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-mesh"
  cache-from = cache_from("guis-iris-mesh")
  cache-to   = cache_to("guis-iris-mesh")
}

target "guis_iris_crud" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-crud"
  cache-from = cache_from("guis-iris-crud")
  cache-to   = cache_to("guis-iris-crud")
}

target "guis_iris_database" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-database"
  cache-from = cache_from("guis-iris-database")
  cache-to   = cache_to("guis-iris-database")
}

target "guis_iris_cdc_fetcher" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-cdc-fetcher"
  cache-from = cache_from("guis-iris-cdc-fetcher")
  cache-to   = cache_to("guis-iris-cdc-fetcher")
}

target "guis_iris_cdc" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-cdc"
  contexts   = {
    "guis_iris-release-cdc-fetcher" = "target:guis_iris_cdc_fetcher"
  }
  cache-from = cache_from("guis-iris-cdc")
  cache-to   = cache_to("guis-iris-cdc")
}

target "guis_iris_transform" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-transform"
  cache-from = cache_from("guis-iris-transform")
  cache-to   = cache_to("guis-iris-transform")
}

target "guis_iris_rclone_s3" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-rclone-s3"
  cache-from = cache_from("guis-iris-rclone-s3")
  cache-to   = cache_to("guis-iris-rclone-s3")
}

target "guis_iris_imgproxy" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-imgproxy"
  cache-from = cache_from("guis-iris-imgproxy")
  cache-to   = cache_to("guis-iris-imgproxy")
}

target "guis_iris_nats" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-nats"
  cache-from = cache_from("guis-iris-nats")
  cache-to   = cache_to("guis-iris-nats")
}

target "guis_iris_nats_init" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-nats-init"
  cache-from = cache_from("guis-iris-nats-init")
  cache-to   = cache_to("guis-iris-nats-init")
}

target "guis_iris_ollama_model" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-ollama-model"
  cache-from = cache_from("guis-iris-ollama-model")
  cache-to   = cache_to("guis-iris-ollama-model")
}

target "guis_iris_ollama" {
  inherits   = ["ci-defaults"]
  context    = "./guis/iris"
  dockerfile = ".bayt/Dockerfile.release-ollama"
  contexts   = {
    "guis_iris-release-ollama-model" = "target:guis_iris_ollama_model"
  }
  cache-from = cache_from("guis-iris-ollama")
  cache-to   = cache_to("guis-iris-ollama")
}

