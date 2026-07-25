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
  // process.std{out,err} are Sockets whose internal `_handle` (only present
  // for a TTY) exposes an undocumented `setBlocking`. Narrow to that shape
  // instead of `any` so the optional-chained access stays type-checked.
  type BlockingHandle = { _handle?: { setBlocking?: (blocking: boolean) => void } }
  const stdout = process.stdout as unknown as BlockingHandle
  const stderr = process.stderr as unknown as BlockingHandle
  stdout._handle?.setBlocking?.(true)
  stderr._handle?.setBlocking?.(true)
  process.stdout.write('Global setup modified stdout/stderr to be blocking\n')
}
