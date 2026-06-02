# generated from bayt.cue — do not edit
variable "IMAGE" {
  default = "gcr.io/trash-362115/services.tracker-tx-gcp"
}
variable "PUSH_IMAGE" {
  default = "false"
}

target "release" {
  tags   = [IMAGE]
  output = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
}
