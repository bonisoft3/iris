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
  tags      = [IMAGE]
  output    = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
  platforms = ["linux/amd64"]
  cache-from = CACHE_SCOPE != "" ? [
    "type=gha,scope=main-services-tracker-tx",
    "type=gha,scope=main-services-tracker-tx-release",
    "type=gha,scope=${CACHE_SCOPE}-services-tracker-tx",
    "type=gha,scope=${CACHE_SCOPE}-services-tracker-tx-release",
  ] : []
  cache-to = CACHE_SCOPE != "" ? [
    "type=gha,mode=max,scope=${CACHE_SCOPE}-services-tracker-tx-release"
  ] : []
}
