set shell := ["nu", "-c"]

@_default:
  just --list --unsorted


[no-cd]
setup:
  just sayt setup
[no-cd]
doctor:
  just sayt doctor

[no-cd]
chat:
  just sayt chat
[no-cd]
vet:
  just sayt vet

[no-cd]
build:
  just sayt build
[no-cd]
test:
  just sayt test

[no-cd]
develop:
  just sayt develop
[no-cd]
integrate:
  just sayt integrate

[no-cd]
preview:
  just sayt preview
[no-cd]
verify:
  just sayt verify

[no-cd]
stage:
  just sayt stage
[no-cd]
loadtest:
  just sayt acceptance

[no-cd]
publish:
  just sayt release
[no-cd]
observe:
  just sayt observe
[no-cd]
setup-butler:
  just sayt setup-butler

[private]
[no-cd]
sayt target *args:
  nu {{justfile_directory()}}/plugins/sayt/sayt.nu {{target}} {{args}}
