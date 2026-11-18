import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { getAgentDir, ModelRuntime } from "@earendil-works/pi-coding-agent"
import { describe, expect, test, vi } from "vitest"
import {
  isTreeProcessAlive,
  SessionTreeFixture,
  TREE_CLEANUP_FAILURE_SCENARIO,
  TREE_HOME_ENV,
  TREE_ISOLATION_SCENARIO,
  TREE_KILL_METHOD,
  TREE_MISSING_PROCESS_CODE,
  TREE_PARENT_FAILURE_SCENARIO,
  TREE_PERMISSION_CODE,
  TREE_PID_ALIVE_SCENARIO,
  TREE_PID_MISSING_SCENARIO,
  TREE_PID_PERMISSION_SCENARIO,
  TREE_RUNTIME_CREATE,
  TREE_RUNTIME_FAILURE_SCENARIO,
  TREE_SCRIPT_FAILURE_SCENARIO,
  TREE_SCRIPT_TARGET,
  TREE_SETTINGS_FAILURE_SCENARIO,
  TREE_SETTINGS_TARGET,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
  TREE_XDG_CACHE_ENV,
  TREE_XDG_CONFIG_ENV,
  TREE_XDG_DATA_ENV,
  TreeAcquisitionFault,
  TreePidFault,
} from "../fixtures"

async function isolatesHome(): Promise<void> {
  const before = homedir()
  const fixture = new SessionTreeFixture()
  try {
    expect(homedir()).not.toBe(before)
    expect(homedir().startsWith(fixture.directory)).toBe(true)
    expect(getAgentDir()).toBe(fixture.agentDirectory)
    expect(process.env[TREE_XDG_CONFIG_ENV]?.startsWith(fixture.directory)).toBe(true)
    expect(process.env[TREE_XDG_CACHE_ENV]?.startsWith(fixture.directory)).toBe(true)
    expect(process.env[TREE_XDG_DATA_ENV]?.startsWith(fixture.directory)).toBe(true)
    await fixture.start()
  } finally {
    await fixture.close()
  }
  expect(homedir()).toBe(before)
  expect(existsSync(fixture.directory)).toBe(false)
}

function settingsAcquisitionFailure(): void {
  const before = process.env[TREE_HOME_ENV]
  const fault = new TreeAcquisitionFault(TREE_SETTINGS_TARGET, false, 3)
  try {
    try {
      new SessionTreeFixture()
      expect.fail()
    } catch (error) {
      expect(error).toBe(fault.primary)
    }
    expect(fault.directory).not.toBe("")
    expect(existsSync(fault.directory)).toBe(false)
    expect(process.env[TREE_HOME_ENV]).toBe(before)
  } finally {
    fault.close()
  }
}

function parentAcquisitionFailure(): void {
  const before = process.env[TREE_HOME_ENV]
  const fault = new TreeAcquisitionFault(TREE_SETTINGS_TARGET, false, 1)
  try {
    try {
      new SessionTreeFixture()
      expect.fail()
    } catch (error) {
      expect(error).toBe(fault.primary)
    }
    expect(fault.directory).not.toBe("")
    expect(existsSync(fault.directory)).toBe(false)
    expect(process.env[TREE_HOME_ENV]).toBe(before)
  } finally {
    fault.close()
  }
}

function scriptAcquisitionFailure(): void {
  const before = process.env[TREE_HOME_ENV]
  const fault = new TreeAcquisitionFault(TREE_SCRIPT_TARGET, false, 3)
  try {
    try {
      new SessionTreeFixture()
      expect.fail()
    } catch (error) {
      expect(error).toBe(fault.primary)
    }
    expect(fault.directory).not.toBe("")
    expect(existsSync(fault.directory)).toBe(false)
    expect(process.env[TREE_HOME_ENV]).toBe(before)
  } finally {
    fault.close()
  }
}

function distinctCleanupFailure(): void {
  const before = process.env[TREE_HOME_ENV]
  const fault = new TreeAcquisitionFault(TREE_SETTINGS_TARGET, true, 3)
  try {
    try {
      new SessionTreeFixture()
      expect.fail()
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      if (error instanceof AggregateError) {
        expect(error.errors[0]).toBe(fault.primary)
        expect(error.errors[1]).toBe(fault.secondary)
      }
    }
    expect(process.env[TREE_HOME_ENV]).toBe(before)
  } finally {
    fault.close()
  }
}

async function runtimeAcquisitionFailure(): Promise<void> {
  const before = process.env[TREE_HOME_ENV]
  const fixture = new SessionTreeFixture()
  const fault = new TreePidFault(TREE_PERMISSION_CODE)
  const spy = vi.spyOn(ModelRuntime, TREE_RUNTIME_CREATE).mockImplementation(fault.throwFailure.bind(fault))
  try {
    await expect(fixture.start()).rejects.toBe(fault)
    expect(existsSync(fixture.directory)).toBe(false)
    expect(process.env[TREE_HOME_ENV]).toBe(before)
  } finally {
    spy.mockRestore()
    await fixture.close()
  }
}

function alivePid(): void {
  expect(isTreeProcessAlive(process.pid)).toBe(true)
}

function missingPid(): void {
  const fault = new TreePidFault(TREE_MISSING_PROCESS_CODE)
  const spy = vi.spyOn(process, TREE_KILL_METHOD).mockImplementation(fault.throwFailure.bind(fault))
  try {
    expect(isTreeProcessAlive(process.pid)).toBe(false)
  } finally {
    spy.mockRestore()
  }
}

function permissionPid(): void {
  const fault = new TreePidFault(TREE_PERMISSION_CODE)
  const spy = vi.spyOn(process, TREE_KILL_METHOD).mockImplementation(fault.throwFailure.bind(fault))
  try {
    expect(isTreeProcessAlive.bind(null, process.pid)).toThrow(fault)
  } finally {
    spy.mockRestore()
  }
}

function register(): void {
  test(TREE_ISOLATION_SCENARIO, isolatesHome, TREE_TIMEOUT_MS)
  test(TREE_RUNTIME_FAILURE_SCENARIO, runtimeAcquisitionFailure)
  test(TREE_PARENT_FAILURE_SCENARIO, parentAcquisitionFailure)
  test(TREE_SETTINGS_FAILURE_SCENARIO, settingsAcquisitionFailure)
  test(TREE_SCRIPT_FAILURE_SCENARIO, scriptAcquisitionFailure)
  test(TREE_CLEANUP_FAILURE_SCENARIO, distinctCleanupFailure)
  test(TREE_PID_ALIVE_SCENARIO, alivePid)
  test(TREE_PID_MISSING_SCENARIO, missingPid)
  test(TREE_PID_PERMISSION_SCENARIO, permissionPid)
}

describe(TREE_SUITE, register)
