import { describe, expect, test, vi } from "vitest"
import {
  computerUseDependenciesAt,
  PI_COMPUTER_DRIVER_PATH_VARIABLE,
} from "#synapse/integration/pi/computer-use/host-dependencies"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use"
import {
  COMPUTER_CONFIGURATION_DRIVER_PATH,
  COMPUTER_CONFIGURATION_FETCH_FUNCTION,
  COMPUTER_CONFIGURATION_FILE,
  COMPUTER_CONFIGURATION_LAUNCH_ARGUMENT,
  COMPUTER_CONFIGURATION_LAUNCH_COMMAND,
  COMPUTER_CONFIGURATION_LAUNCH_CONTENT,
  COMPUTER_CONFIGURATION_POLICY_BLANK_REASON,
  COMPUTER_CONFIGURATION_POLICY_FILE,
  COMPUTER_CONFIGURATION_POLICY_INVALID_JSON,
  COMPUTER_CONFIGURATION_POLICY_LATEST_STABLE,
  COMPUTER_CONFIGURATION_POLICY_PINNED,
  COMPUTER_CONFIGURATION_POLICY_PINNED_REASON,
  COMPUTER_CONFIGURATION_POLICY_PINNED_VERSION,
  COMPUTER_CONFIGURATION_POLICY_PRERELEASE_VERSION,
  COMPUTER_CONFIGURATION_POLICY_RANGE_VERSION,
  COMPUTER_CONFIGURATION_POLICY_UNKNOWN_MODE,
  COMPUTER_CONFIGURATION_UNITY_BRIDGE_CONTENT,
  COMPUTER_CONFIGURATION_UNITY_BRIDGE_DIRECTORY,
  COMPUTER_CONFIGURATION_UNITY_BRIDGE_FILE,
  COMPUTER_CONFIGURATION_UNITY_BRIDGE_INVALID_CONTENT,
  createComputerConfigurationDirectory,
  removeComputerConfigurationDirectory,
  writeComputerConfigurationFile,
} from "../fixtures"

function pinnedPolicyValues(): ComputerDriverPolicy {
  return {
    mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
    version: COMPUTER_CONFIGURATION_POLICY_PINNED_VERSION,
    reason: COMPUTER_CONFIGURATION_POLICY_PINNED_REASON,
  }
}

function expectPolicyRejected(content: string): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_POLICY_FILE, content)
  const download = vi.spyOn(globalThis, COMPUTER_CONFIGURATION_FETCH_FUNCTION)
  try {
    expect(computerUseDependenciesAt.bind(null, directory, "linux", {})).toThrow()
    expect(download).not.toHaveBeenCalled()
  } finally {
    download.mockRestore()
    removeComputerConfigurationDirectory(directory)
  }
}

function missingPolicyUsesLatestStable(): void {
  const directory = createComputerConfigurationDirectory()
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {})
    expect(dependencies.driverPolicy).toEqual({ mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE })
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function latestStablePolicyIsRead(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(
    directory,
    COMPUTER_CONFIGURATION_POLICY_FILE,
    COMPUTER_CONFIGURATION_POLICY_LATEST_STABLE,
  )
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {})
    expect(dependencies.driverPolicy).toEqual({ mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE })
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function pinnedPolicyIsRead(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_POLICY_FILE, COMPUTER_CONFIGURATION_POLICY_PINNED)
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {})
    expect(dependencies.driverPolicy).toEqual(pinnedPolicyValues())
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function blankReasonIsRejected(): void {
  expectPolicyRejected(COMPUTER_CONFIGURATION_POLICY_BLANK_REASON)
}

function rangeVersionIsRejected(): void {
  expectPolicyRejected(COMPUTER_CONFIGURATION_POLICY_RANGE_VERSION)
}

function prereleaseVersionIsRejected(): void {
  expectPolicyRejected(COMPUTER_CONFIGURATION_POLICY_PRERELEASE_VERSION)
}

function unknownModeIsRejected(): void {
  expectPolicyRejected(COMPUTER_CONFIGURATION_POLICY_UNKNOWN_MODE)
}

function invalidJsonIsRejected(): void {
  expectPolicyRejected(COMPUTER_CONFIGURATION_POLICY_INVALID_JSON)
}

function invalidPolicyWithLaunchOverrideIsRejected(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(
    directory,
    COMPUTER_CONFIGURATION_POLICY_FILE,
    COMPUTER_CONFIGURATION_POLICY_BLANK_REASON,
  )
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_FILE, COMPUTER_CONFIGURATION_LAUNCH_CONTENT)
  const download = vi.spyOn(globalThis, COMPUTER_CONFIGURATION_FETCH_FUNCTION)
  try {
    expect(computerUseDependenciesAt.bind(null, directory, "linux", {})).toThrow()
    expect(download).not.toHaveBeenCalled()
  } finally {
    download.mockRestore()
    removeComputerConfigurationDirectory(directory)
  }
}

function invalidBridgeWithLaunchOverrideIsRejected(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(
    directory,
    COMPUTER_CONFIGURATION_UNITY_BRIDGE_FILE,
    COMPUTER_CONFIGURATION_UNITY_BRIDGE_INVALID_CONTENT,
  )
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_FILE, COMPUTER_CONFIGURATION_LAUNCH_CONTENT)
  try {
    expect(computerUseDependenciesAt.bind(null, directory, "linux", {})).toThrow()
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function launchBridgeAndPolicyCoexist(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_POLICY_FILE, COMPUTER_CONFIGURATION_POLICY_PINNED)
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_FILE, COMPUTER_CONFIGURATION_LAUNCH_CONTENT)
  writeComputerConfigurationFile(
    directory,
    COMPUTER_CONFIGURATION_UNITY_BRIDGE_FILE,
    COMPUTER_CONFIGURATION_UNITY_BRIDGE_CONTENT,
  )
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {})
    expect(dependencies.driverPolicy).toEqual(pinnedPolicyValues())
    expect(dependencies.driverLaunch?.command).toBe(COMPUTER_CONFIGURATION_LAUNCH_COMMAND)
    expect(dependencies.driverLaunch?.arguments).toEqual([COMPUTER_CONFIGURATION_LAUNCH_ARGUMENT])
    expect(dependencies.unityBridge?.handshakeDirectory).toBe(COMPUTER_CONFIGURATION_UNITY_BRIDGE_DIRECTORY)
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function launchOverrideWithoutPolicyUsesLatestStable(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_FILE, COMPUTER_CONFIGURATION_LAUNCH_CONTENT)
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {})
    expect(dependencies.driverLaunch?.command).toBe(COMPUTER_CONFIGURATION_LAUNCH_COMMAND)
    expect(dependencies.driverPolicy).toEqual({ mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE })
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function driverPathEnvironmentWithoutPolicyUsesLatestStable(): void {
  const directory = createComputerConfigurationDirectory()
  try {
    const dependencies = computerUseDependenciesAt(directory, "linux", {
      [PI_COMPUTER_DRIVER_PATH_VARIABLE]: COMPUTER_CONFIGURATION_DRIVER_PATH,
    })
    expect(dependencies.driverPath).toBe(COMPUTER_CONFIGURATION_DRIVER_PATH)
    expect(dependencies.driverPolicy).toEqual({ mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE })
  } finally {
    removeComputerConfigurationDirectory(directory)
  }
}

function suite(): void {
  test("arquivo de política ausente equivale a latest-stable", missingPolicyUsesLatestStable)
  test("política latest-stable é entregue ao módulo", latestStablePolicyIsRead)
  test("política pinned entrega versão exata e motivo", pinnedPolicyIsRead)
  test("recusa motivo vazio ou só com espaços antes de qualquer download", blankReasonIsRejected)
  test("recusa faixa de versão na política pinned", rangeVersionIsRejected)
  test("recusa versão pré-release na política pinned", prereleaseVersionIsRejected)
  test("recusa modo desconhecido na política", unknownModeIsRejected)
  test("recusa política com JSON inválido", invalidJsonIsRejected)
  test("recusa política inválida mesmo com override de lançamento", invalidPolicyWithLaunchOverrideIsRejected)
  test("recusa bridge inválida antes de aplicar override de lançamento", invalidBridgeWithLaunchOverrideIsRejected)
  test("política, lançamento e bridge coexistem sem perda de configuração", launchBridgeAndPolicyCoexist)
  test("override de lançamento sem política usa latest-stable", launchOverrideWithoutPolicyUsesLatestStable)
  test(
    "caminho do driver no ambiente sem política usa latest-stable",
    driverPathEnvironmentWithoutPolicyUsesLatestStable,
  )
}

describe("política do driver gerenciado na configuração do host", suite)
