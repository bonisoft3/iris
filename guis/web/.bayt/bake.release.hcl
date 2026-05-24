variable "IMAGE" {
  default = "gcr.io/trash-362115/guis.web"
}
variable "PUSH_IMAGE" {
  default = "false"
}

target "release" {
  context    = "."
  dockerfile = ".bayt/Dockerfile.release"
  target     = "release"
  platforms  = ["linux/amd64"]
  tags       = [IMAGE]
  output     = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
}
