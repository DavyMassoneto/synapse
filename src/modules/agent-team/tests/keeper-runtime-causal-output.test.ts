import { once } from "node:events"
import { expect, test } from "vitest"
import {
  confirmUnixKeeperClosed,
  terminateUnixKeeper,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { CausalOutputSink } from "./causal-output-sink"
import { SHELL_NATIVE_TEST_MS, SHELL_RUNTIME_CAUSAL_TITLE, SHELL_RUNTIME_LARGE_CAUSAL_TITLE } from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"
import { ShellWireTestSink } from "./shell-wire-support"

async function outputAfterExit(background: boolean): Promise<void> {
  const command = background ? "printf foreground; sleep 8 &" : "printf foreground"
  const transport = await KeeperRuntimeScenario.create(command)
  const sink = new ShellWireTestSink()
  const lease = new SupervisedWireLease(
    {
      process: transport.process,
      status: transport.status,
      output: transport.output,
      input: transport.control,
      requiresEmptyAck: true,
      preparationTerminal: true,
      confirmEmpty: confirmUnixKeeperClosed.bind(undefined, transport.process),
      terminate: terminateUnixKeeper.bind(undefined, transport.process, transport.control),
    },
    sink,
  )
  await lease.ready()
  transport.output.pause()
  transport.status.prependOnceListener("data", assertBeforeData.bind(undefined, sink))
  const exited = once(transport.status, "data")
  lease.release()
  try {
    await exited
    expect(await lease.completion).toBe(0)
    expect(sink.bytes).toBe(Buffer.byteLength("foreground"))
  } finally {
    await lease.terminate()
  }
}

function assertBeforeData(sink: ShellWireTestSink): void {
  expect(sink.bytes).toBe(0)
}

test.skipIf(process.platform === "win32").each([false, true])(
  SHELL_RUNTIME_CAUSAL_TITLE,
  outputAfterExit,
  SHELL_NATIVE_TEST_MS,
)

async function largeSlowOutput(background: boolean): Promise<void> {
  const command = background ? "head -c 200000 /dev/zero; sleep 8 &" : "head -c 200000 /dev/zero"
  const transport = await KeeperRuntimeScenario.create(command)
  const sink = new CausalOutputSink()
  const lease = new SupervisedWireLease(
    {
      process: transport.process,
      status: transport.status,
      output: transport.output,
      input: transport.control,
      requiresEmptyAck: true,
      preparationTerminal: true,
      confirmEmpty: confirmUnixKeeperClosed.bind(undefined, transport.process),
      terminate: terminateUnixKeeper.bind(undefined, transport.process, transport.control),
    },
    sink,
  )
  await lease.ready()
  transport.output.pause()
  lease.release()
  transport.output.resume()
  try {
    expect(await lease.completion).toBe(0)
    expect(sink.bytes).toBe(200000)
    expect(sink.writes).toBeGreaterThan(1)
  } finally {
    await lease.terminate()
  }
}

test.skipIf(process.platform === "win32").each([false, true])(
  SHELL_RUNTIME_LARGE_CAUSAL_TITLE,
  largeSlowOutput,
  SHELL_NATIVE_TEST_MS,
)
