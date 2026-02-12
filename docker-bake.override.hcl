variable "CACHE_SCOPE" {
  default = ""
}

function "cache_from" {
  params = [name]
  result = CACHE_SCOPE != "" ? [
    "type=gha,scope=main",
    "type=gha,scope=${CACHE_SCOPE}-${name}",
  ] : []
}

function "cache_to" {
  params = [name]
  result = CACHE_SCOPE != "" ? ["type=gha,mode=max,scope=${CACHE_SCOPE}-${name}"] : []
}

group "integrate" {
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
  cache-from = CACHE_SCOPE != "" ? ["type=gha,scope=main"] : []
  cache-to = []
}

target "services_tracker" {
  inherits   = ["ci-defaults"]
  contexts   = { devserver = "target:plugins_devserver" }
  cache-from = cache_from("services-tracker")
  cache-to   = cache_to("services-tracker")
}

target "services_tracker_tx" {
  inherits   = ["ci-defaults"]
  contexts   = { devserver = "target:plugins_devserver" }
  target     = "debug"
  cache-from = cache_from("services-tracker-tx")
  cache-to   = cache_to("services-tracker-tx")
}

target "guis_web" {
  inherits   = ["ci-defaults"]
  contexts   = { devserver = "target:plugins_devserver" }
  cache-from = cache_from("guis-web")
  cache-to   = cache_to("guis-web")
}

target "services_shelfie" {
  inherits   = ["ci-defaults"]
  cache-from = cache_from("services-shelfie")
  cache-to   = cache_to("services-shelfie")
}

target "plugins_devserver" {
  inherits   = ["ci-defaults"]
  target     = "devserver"
  cache-from = cache_from("plugins-devserver")
  cache-to   = cache_to("plugins-devserver")
}

target "plugins_sayt" {
  inherits   = ["ci-defaults"]
  cache-from = cache_from("plugins-sayt")
  cache-to   = cache_to("plugins-sayt")
}

