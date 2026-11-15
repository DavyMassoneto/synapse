import { expect } from "vitest"
import { ShellStatusReader } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"

export function verifyCloseJobObservation(pid: string, observed: string): void {
  expect(pid).toMatch(/^\d+$/)
  expect(observed.trim()).toBe(`CHILD_ABSENT:${pid}`)
}

export function verifyCloseJobStatus(bytes: Buffer): void {
  const reader = new ShellStatusReader()
  reader.receive(bytes.subarray(0, 1))
  expect(reader.state.kind).toBe("created")
  reader.release()
  reader.receive(bytes.subarray(1))
  reader.eof()
  expect(reader.state.kind).toBe("completed")
  expect(reader.empty).toBe(true)
  if (reader.state.kind === "completed") {
    expect(reader.state.exitCode).toBe(0)
    expect(reader.state.acceptedBytes).toBeGreaterThan(0)
  }
}
