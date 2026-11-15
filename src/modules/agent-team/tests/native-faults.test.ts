import { once } from "node:events"
import { expect, test } from "vitest"
import {
  SHELL_NATIVE_DEATH_TITLE,
  SHELL_NATIVE_EXPIRED_TITLE,
  SHELL_NATIVE_FROZEN_TITLE,
  SHELL_NATIVE_TEST_MS,
} from "./constants"
import { NativeTransport } from "./native-transport"
import { type ShellTestResolve } from "./types"

async function reservationDeath(): Promise<void> {
  const transport = await NativeTransport.create("exit 0")
  const pid = await transport.reservationPid()
  await once(transport.status, "data")
  const closed = transport.closed()
  process.kill(pid, "SIGKILL")
  expect(await closed).not.toBe(0)
}
async function expiredDeadline(): Promise<void> {
  const transport = await NativeTransport.create("exit 0")
  await transport.reservationPid()
  await once(transport.status, "data")
  const closed = transport.closed()
  transport.stop(process.hrtime.bigint() - 1n)
  expect(await closed).not.toBe(0)
}
async function frozenReservation(): Promise<void> {
  const transport = await NativeTransport.create("exit 0")
  const pid = await transport.reservationPid()
  await once(transport.status, "data")
  process.kill(pid, "SIGSTOP")
  const closed = transport.closed()
  transport.stop(process.hrtime.bigint() + 1000000n)
  await new Promise<void>(delayResume.bind(undefined, pid))
  expect(await closed).not.toBe(0)
}
function delayResume(pid: number, resolve: ShellTestResolve): void {
  setTimeout(resumeReservation.bind(undefined, pid, resolve), 20)
}
function resumeReservation(pid: number, resolve: ShellTestResolve): void {
  process.kill(pid, "SIGCONT")
  resolve()
}

test.skipIf(process.platform === "win32")(SHELL_NATIVE_DEATH_TITLE, reservationDeath, SHELL_NATIVE_TEST_MS)
test.skipIf(process.platform === "win32")(SHELL_NATIVE_EXPIRED_TITLE, expiredDeadline, SHELL_NATIVE_TEST_MS)
test.skipIf(process.platform === "win32")(SHELL_NATIVE_FROZEN_TITLE, frozenReservation, SHELL_NATIVE_TEST_MS)
