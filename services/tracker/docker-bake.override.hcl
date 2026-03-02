variable "IMAGE" {
  default = "gcr.io/trash-362115/services.tracker"
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
    "type=gha,scope=main-services-tracker",
    "type=gha,scope=main-services-tracker-release",
    "type=gha,scope=${CACHE_SCOPE}-services-tracker",
    "type=gha,scope=${CACHE_SCOPE}-services-tracker-release",
  ] : []
  cache-to = CACHE_SCOPE != "" ? [
    "type=gha,mode=max,scope=${CACHE_SCOPE}-services-tracker-release"
  ] : []
}
