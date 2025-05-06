import process from 'node:process'

export default function setup() {
  // Vitest will replace process.{stdout,stderr} and will capture console
  // output. We need to modify it in global initialization which is the
  // only place where we can still see the _handle property.
  const stdout = process.stdout as any
  const stderr = process.stdout as any
  stdout._handle.setBlocking(true)
  stderr._handle.setBlocking(true)
  process.stdout.write('Global setup modified stdout/stderr to be blocking\n')
}
