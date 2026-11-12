import { describe, expect, test } from "vitest"
import {
  discoverIphoneSimulators,
  IPHONE_SIMULATOR_ARGUMENTS,
  IPHONE_SIMULATOR_COMMAND_FAILED,
  IPHONE_SIMULATOR_EXECUTABLE,
  IPHONE_SIMULATOR_INVALID,
  IPHONE_SIMULATOR_UNSUPPORTED,
  type IphoneSimulatorCommandOutput,
} from "#synapse/modules/iphone/adapters/simulator-discovery"
import { IphoneSimulatorCommandDouble } from "./simulator-discovery-support"
import { type IphoneSimulatorCommandResult, type IphoneSimulatorDiscoverySut } from "./types"

const BOOTED_SIMULATORS = JSON.stringify({
  devices: {
    "com.apple.CoreSimulator.SimRuntime.iOS-26-6": [
      { udid: "primeiro", name: "iPhone 17", state: "Booted" },
      { udid: "segundo", name: "iPhone 16", state: "Shutdown" },
    ],
    "com.apple.CoreSimulator.SimRuntime.iOS-18-2": [{ udid: "terceiro", name: "iPhone SE", state: "Booted" }],
  },
})

const WITHOUT_UDID = JSON.stringify({
  devices: { "com.apple.CoreSimulator.SimRuntime.iOS-26-6": [{ udid: 7, name: "iPhone 17" }] },
})

const COMMAND_TIMEOUT = "xcrun não respondeu"

function output(stdout: string): IphoneSimulatorCommandOutput {
  return { stdout, stderr: "" }
}

function makeSut(results: IphoneSimulatorCommandResult[]): IphoneSimulatorDiscoverySut {
  const executor = new IphoneSimulatorCommandDouble(results)
  return { executor, run: executor.execute.bind(executor) }
}

async function refusesLinux(): Promise<void> {
  const sut = makeSut([])
  expect(await discoverIphoneSimulators("linux", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_UNSUPPORTED,
  })
  expect(sut.executor.calls).toStrictEqual([])
}

async function refusesWindows(): Promise<void> {
  const sut = makeSut([])
  expect((await discoverIphoneSimulators("win32", sut.run)).kind).toBe("refused")
  expect(sut.executor.calls).toStrictEqual([])
}

async function asksSimctlForBootedDevices(): Promise<void> {
  const sut = makeSut([output(BOOTED_SIMULATORS)])
  await discoverIphoneSimulators("darwin", sut.run)
  expect(sut.executor.calls).toStrictEqual([
    { command: IPHONE_SIMULATOR_EXECUTABLE, arguments: IPHONE_SIMULATOR_ARGUMENTS },
  ])
}

async function listsBootedSimulators(): Promise<void> {
  const sut = makeSut([output(BOOTED_SIMULATORS)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "accepted",
    simulators: [
      { udid: "primeiro", name: "iPhone 17" },
      { udid: "terceiro", name: "iPhone SE" },
    ],
  })
}

async function refusesInvalidOutput(): Promise<void> {
  const sut = makeSut([output("simuladores: três")])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_INVALID,
  })
}

async function refusesSchemaViolation(): Promise<void> {
  const sut = makeSut([output(WITHOUT_UDID)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_INVALID,
  })
}

async function refusesCommandFailure(): Promise<void> {
  const sut = makeSut([new Error(COMMAND_TIMEOUT)])
  const result = await discoverIphoneSimulators("darwin", sut.run)
  expect(result).toMatchObject({ kind: "refused", message: expect.stringContaining(IPHONE_SIMULATOR_COMMAND_FAILED) })
}

function registerTests(): void {
  test("recusa descoberta no Linux", refusesLinux)
  test("recusa descoberta no Windows", refusesWindows)
  test("pede ao simctl apenas os simuladores iniciados", asksSimctlForBootedDevices)
  test("lista os simuladores iniciados", listsBootedSimulators)
  test("recusa saída que não é JSON", refusesInvalidOutput)
  test("recusa saída fora do esquema", refusesSchemaViolation)
  test("recusa comando que falhou", refusesCommandFailure)
}

describe("descoberta de simuladores do iPhone", registerTests)
