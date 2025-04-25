if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  Invoke-RestMethod https://get.scoop.sh | Invoke-Expression
}
scoop install nu@0.96.1
scoop install just@1.34.0
