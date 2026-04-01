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
    "plugins_sayt",
    "guis_web",
    "services_tracker",
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

target "plugins_sayt" {
  inherits   = ["ci-defaults"]
  dockerfile = "./Dockerfile"
  network    = "host"
  secret     = ["id=host.env,env=HOST_ENV"]
  cache-from = cache_from("plugins-sayt")
  cache-to   = cache_to("plugins-sayt")
}

