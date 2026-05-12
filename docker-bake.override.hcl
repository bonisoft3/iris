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
  # iris is driven separately by `just sayt -d guis/iris integrate`
  # (see the `iris-integrate` step in .github/workflows/ci.yml). Its
  # integrate is compose-up-driven (no `args: "--bake"` in
  # iris/.say.yaml), and double-building it via bake plus compose blew
  # past the runner's ~14 GB free disk on the first attempt. Everything
  # else stays bake-driven through this group.
  targets = [
    "services_tracker_tx",
    "services_tracker",
    "services_boxer",
    "guis_web",
    "plugins_devserver",
    "plugins_omnishell",
    "plugins_sayt",
    "libraries_mecha",
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
  # The ci-group targets only need to populate the build cache so
  # downstream consumers can resolve them on subsequent runs. No image
  # needs to land on the host docker daemon or be pushed anywhere —
  # `type=cacheonly` makes that intent explicit and silences buildx's
  # "No output specified for ... target(s)" warning.
  output = ["type=cacheonly"]
}

target "services_tracker" {
  inherits   = ["ci-defaults"]
  cache-from = cache_from("services-tracker")
  cache-to   = cache_to("services-tracker")
}

target "services_boxer" {
  inherits   = ["ci-defaults"]
  cache-from = cache_from("services-boxer")
  cache-to   = cache_to("services-boxer")
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
  cache-from = cache_from("guis-iris")
  cache-to   = cache_to("guis-iris")
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
  cache-from = cache_from("plugins-omnishell")
  cache-to   = cache_to("plugins-omnishell")
}

