import { describe, expect, test } from "vitest"
import {
  discoverIphoneSimulators,
  IPHONE_SIMULATOR_ARGUMENTS,
  IPHONE_SIMULATOR_COMMAND_FAILED,
  IPHONE_SIMULATOR_EXECUTABLE,
  IPHONE_SIMULATOR_INVALID,
  IPHONE_SIMULATOR_UNSUPPORTED,
} from "#synapse/modules/iphone/adapters/simulator-discovery"
import {
  BOOTED_SIMULATORS,
  COMMAND_TIMEOUT,
  EMPTY_AND_FUTURE_DEVICES,
  FINAL_INVALID_GROUP,
  makeSimulatorSut,
  simulatorOutput,
  WITHOUT_UDID,
} from "./simulator-discovery-support"

async function refusesLinux(): Promise<void> {
  const sut = makeSimulatorSut([])
  expect(await discoverIphoneSimulators("linux", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_UNSUPPORTED,
  })
  expect(sut.executor.calls).toStrictEqual([])
}

async function refusesWindows(): Promise<void> {
  const sut = makeSimulatorSut([])
  expect((await discoverIphoneSimulators("win32", sut.run)).kind).toBe("refused")
  expect(sut.executor.calls).toStrictEqual([])
}

async function asksSimctlForBootedDevices(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput(BOOTED_SIMULATORS)])
  await discoverIphoneSimulators("darwin", sut.run)
  expect(sut.executor.calls).toStrictEqual([
    { command: IPHONE_SIMULATOR_EXECUTABLE, arguments: IPHONE_SIMULATOR_ARGUMENTS },
  ])
}

async function listsBootedSimulators(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput(BOOTED_SIMULATORS)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "accepted",
    simulators: [
      { udid: "primeiro", name: "iPhone 17" },
      { udid: "terceiro", name: "iPhone SE" },
    ],
  })
}

async function refusesInvalidOutput(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput("simuladores: três")])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_INVALID,
  })
}

async function refusesSchemaViolation(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput(WITHOUT_UDID)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_INVALID,
  })
}

async function refusesCommandFailure(): Promise<void> {
  const sut = makeSimulatorSut([new Error(COMMAND_TIMEOUT)])
  const result = await discoverIphoneSimulators("darwin", sut.run)
  expect(result).toMatchObject({ kind: "refused", message: expect.stringContaining(IPHONE_SIMULATOR_COMMAND_FAILED) })
}

async function preservesEmptyStringsAndFiltersUnknownStates(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput(EMPTY_AND_FUTURE_DEVICES)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "accepted",
    simulators: [{ udid: "", name: "" }],
  })
}

async function refusesEntireListWhenFinalGroupIsInvalid(): Promise<void> {
  const sut = makeSimulatorSut([simulatorOutput(FINAL_INVALID_GROUP)])
  expect(await discoverIphoneSimulators("darwin", sut.run)).toStrictEqual({
    kind: "refused",
    message: IPHONE_SIMULATOR_INVALID,
  })
}

function registerTests(): void {
  test("recusa descoberta no Linux", refusesLinux)
  test("recusa descoberta no Windows", refusesWindows)
  test("pede ao simctl apenas os simuladores iniciados", asksSimctlForBootedDevices)
  test("lista os simuladores iniciados", listsBootedSimulators)
  test("recusa saída que não é JSON", refusesInvalidOutput)
  test("recusa saída fora do esquema", refusesSchemaViolation)
  test("recusa comando que falhou", refusesCommandFailure)
  test("preserva strings vazias e filtra estados desconhecidos", preservesEmptyStringsAndFiltersUnknownStates)
  test("recusa lista inteira quando o último grupo é inválido", refusesEntireListWhenFinalGroupIsInvalid)
}

describe("descoberta de simuladores do iPhone", registerTests)
