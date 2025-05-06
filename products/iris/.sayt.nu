use std log

def main [] {}

def "main setup" [] {
	let version = "4.3.2"

  if $nu.os-info.name == "windows" {
	  let zipname = "ksops.zip"
	  let filename = $"v($version)/ksops_($version)_Windows_x86_64.tar.gz"
	  let install_path = $nu.home-path | path join scoop shims
	  let download_url = $"https://github.com/viaduct-ai/kustomize-sops/releases/download/($filename)"
	  http get $download_url --raw | save $zipname
	  tar -xf $zipname
	  mv "ksops.exe" $install_path
	  rm $zipname
	}
}

