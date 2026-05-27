variable "IMAGE" {
  default = "gcr.io/trash-362115/services.tracker"
}
variable "PUSH_IMAGE" {
  default = "false"
}

target "release" {
  tags   = [IMAGE]
  output = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
}
