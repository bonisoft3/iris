# generated from bayt.cue — do not edit
variable "IMAGE" {
  default = ""
}
variable "PUSH_IMAGE" {
  default = "false"
}

target "release" {
  matrix = { t = ["guis_web-release"] }
  name   = t
  tags   = [IMAGE]
  output = PUSH_IMAGE == "true" ? ["type=registry"] : ["type=docker"]
}
