variable "IMAGE" {
  default = "gcr.io/trash-362115/guis.web"
}
variable "PUSH_IMAGE" {
  default = "false"
}
variable "CACHE_SCOPE" {
  default = ""
}

target "release" {
  context    = "."
  dockerfile = ".bayt/Dockerfile.release"
  target     = "release"
  platforms  = ["linux/amd64"]
  tags       = [IMAGE]
  output     = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
  cache-from = CACHE_SCOPE != "" ? ["type=gha,scope=main-guis_web-release", "type=gha,scope=${CACHE_SCOPE}-guis_web-release"] : []
  cache-to   = CACHE_SCOPE != "" ? ["type=gha,mode=max,scope=${CACHE_SCOPE}-guis_web-release"] : []
}
