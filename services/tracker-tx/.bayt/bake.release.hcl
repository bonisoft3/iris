variable "IMAGE" {
  default = "gcr.io/trash-362115/services.tracker-tx-gcp"
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
  cache-from = CACHE_SCOPE != "" ? ["type=gha,scope=main-services_tracker-tx-release", "type=gha,scope=${CACHE_SCOPE}-services_tracker-tx-release"] : []
  cache-to   = CACHE_SCOPE != "" ? ["type=gha,mode=max,scope=${CACHE_SCOPE}-services_tracker-tx-release"] : []
}
