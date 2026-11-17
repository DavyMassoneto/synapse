import fs from "node:fs"
import { syncBuiltinESMExports } from "node:module"
import { afterEach, describe, expect, test, vi } from "vitest"
import {
  HISTORY_MIGRATION_ACQUISITION_CLEANUP,
  HISTORY_MIGRATION_ACQUISITION_PRIMARY,
  HISTORY_MIGRATION_ACQUISITION_SUITE,
  HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD,
  HISTORY_MIGRATION_DISPOSE_METHOD,
  HISTORY_MIGRATION_HOME_CLEANUP_FAILURE_TEST,
  HISTORY_MIGRATION_HOME_FAILURE_TEST,
  HISTORY_MIGRATION_INITIALIZE_METHOD,
  HISTORY_MIGRATION_REMOVE_METHOD,
  HISTORY_MIGRATION_SETUP_CLEANUP_FAILURE_TEST,
  HISTORY_MIGRATION_SETUP_FAILURE_TEST,
  HISTORY_MIGRATION_WRITE_METHOD,
  HistoryMigrationAcquisitionFault,
  HistoryMigrationFixture,
  PiProcess,
  PiProcessHome,
  runHistoryMigrationScenario,
} from "../fixtures"

let fault = new HistoryMigrationAcquisitionFault()

function cleanup(): void {
  vi.restoreAllMocks()
  syncBuiltinESMExports()
  if (fault.home) {
    fs.rmSync(fault.home, { recursive: true, force: true })
  }
}

function rejectsHomeAcquisition(): void {
  fault = new HistoryMigrationAcquisitionFault()
  vi.spyOn(fs, HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD).mockImplementation(fault.captureHome.bind(fault))
  vi.spyOn(fs, HISTORY_MIGRATION_WRITE_METHOD).mockImplementation(fault.rejectWrite.bind(fault))
  syncBuiltinESMExports()
  expect.assertions(2)
  try {
    new PiProcessHome()
  } catch (error) {
    expect(error).toBe(HISTORY_MIGRATION_ACQUISITION_PRIMARY)
  }
  expect(fs.existsSync(fault.home)).toBe(false)
}

function rejectsHomeCleanup(): void {
  fault = new HistoryMigrationAcquisitionFault()
  vi.spyOn(fs, HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD).mockImplementation(fault.captureHome.bind(fault))
  vi.spyOn(fs, HISTORY_MIGRATION_WRITE_METHOD).mockImplementation(fault.rejectWrite.bind(fault))
  vi.spyOn(fs, HISTORY_MIGRATION_REMOVE_METHOD).mockImplementation(fault.rejectCleanup.bind(fault))
  syncBuiltinESMExports()
  expect.assertions(3)
  try {
    new PiProcessHome()
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) {
      expect(error.errors).toEqual([HISTORY_MIGRATION_ACQUISITION_PRIMARY, HISTORY_MIGRATION_ACQUISITION_CLEANUP])
    }
  }
  expect(fs.existsSync(fault.home)).toBe(true)
}

async function rejectsSetup(): Promise<void> {
  fault = new HistoryMigrationAcquisitionFault()
  vi.spyOn(fs, HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD).mockImplementation(fault.captureHome.bind(fault))
  vi.spyOn(HistoryMigrationFixture.prototype, HISTORY_MIGRATION_INITIALIZE_METHOD).mockImplementation(
    fault.rejectWrite.bind(fault),
  )
  syncBuiltinESMExports()
  await expect(runHistoryMigrationScenario(fault.rejectScenario.bind(fault))).rejects.toBe(
    HISTORY_MIGRATION_ACQUISITION_PRIMARY,
  )
  expect(fs.existsSync(fault.home)).toBe(false)
}

async function rejectsSetupCleanup(): Promise<void> {
  fault = new HistoryMigrationAcquisitionFault()
  vi.spyOn(fs, HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD).mockImplementation(fault.captureHome.bind(fault))
  vi.spyOn(HistoryMigrationFixture.prototype, HISTORY_MIGRATION_INITIALIZE_METHOD).mockImplementation(
    fault.rejectWrite.bind(fault),
  )
  vi.spyOn(PiProcess.prototype, HISTORY_MIGRATION_DISPOSE_METHOD).mockImplementation(fault.rejectCleanup.bind(fault))
  syncBuiltinESMExports()
  await expect(runHistoryMigrationScenario(fault.rejectScenario.bind(fault))).rejects.toMatchObject({
    errors: [HISTORY_MIGRATION_ACQUISITION_PRIMARY, HISTORY_MIGRATION_ACQUISITION_CLEANUP],
  })
  expect(fs.existsSync(fault.home)).toBe(false)
}

function registerTests(): void {
  afterEach(cleanup)
  test(HISTORY_MIGRATION_HOME_FAILURE_TEST, rejectsHomeAcquisition)
  test(HISTORY_MIGRATION_HOME_CLEANUP_FAILURE_TEST, rejectsHomeCleanup)
  test(HISTORY_MIGRATION_SETUP_FAILURE_TEST, rejectsSetup)
  test(HISTORY_MIGRATION_SETUP_CLEANUP_FAILURE_TEST, rejectsSetupCleanup)
}

describe(HISTORY_MIGRATION_ACQUISITION_SUITE, registerTests)
