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
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import {
  SHELL_TEST_FOREGROUND_BACKGROUND_COMMAND,
  SHELL_TEST_FOREGROUND_COMMAND,
  SHELL_TEST_FOREGROUND_OUTPUT,
  SHELL_TEST_LARGE_BACKGROUND_COMMAND,
  SHELL_TEST_LARGE_COMMAND,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"
import { ShellWireTestSink } from "./shell-wire-support"

async function outputAfterExit(background: boolean): Promise<void> {
  const command = background ? SHELL_TEST_FOREGROUND_BACKGROUND_COMMAND : SHELL_TEST_FOREGROUND_COMMAND
  const transport = await KeeperRuntimeScenario.create(command)
  try {
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
    transport.status.prependOnceListener(SHELL_TEST_EVENT_DATA, assertBeforeData.bind(undefined, sink))
    const exited = once(transport.status, SHELL_TEST_EVENT_DATA)
    lease.release()
    try {
      await exited
      expect(await lease.completion).toBe(0)
      expect(sink.bytes).toBe(Buffer.byteLength(SHELL_TEST_FOREGROUND_OUTPUT))
    } finally {
      await lease.terminate()
    }
  } finally {
    await transport.close()
  }
}

function assertBeforeData(sink: ShellWireTestSink): void {
  expect(sink.bytes).toBe(0)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each([false, true])(
  SHELL_RUNTIME_CAUSAL_TITLE,
  outputAfterExit,
  SHELL_NATIVE_TEST_MS,
)

async function largeSlowOutput(background: boolean): Promise<void> {
  const command = background ? SHELL_TEST_LARGE_BACKGROUND_COMMAND : SHELL_TEST_LARGE_COMMAND
  const transport = await KeeperRuntimeScenario.create(command)
  try {
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
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each([false, true])(
  SHELL_RUNTIME_LARGE_CAUSAL_TITLE,
  largeSlowOutput,
  SHELL_NATIVE_TEST_MS,
)
