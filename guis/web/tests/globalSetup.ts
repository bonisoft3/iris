import process from 'node:process'

export default function setup() {
  // Vitest will replace process.{stdout,stderr} and will capture console
  // output. We need to modify it in global initialization which is the
  // only place where we can still see the _handle property.
  //
  // _handle is only present when stdout/stderr is a TTY. Under
  // redirection (e.g. `vitest > out.log`, CI piping into a file, or
  // a sayt verb captured into a buffer) _handle is undefined and the
  // setBlocking call would crash global setup before any test runs.
  // Skip the call in that case — the redirect target handles its
  // own buffering.
  const stdout = process.stdout as any
  const stderr = process.stderr as any
  stdout._handle?.setBlocking?.(true)
  stderr._handle?.setBlocking?.(true)
  process.stdout.write('Global setup modified stdout/stderr to be blocking\n')
}
