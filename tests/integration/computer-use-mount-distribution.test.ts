import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  COMPUTER_MOUNT_CAPTURE_ARGUMENTS,
  COMPUTER_MOUNT_CAPTURE_DESCRIPTION,
  COMPUTER_MOUNT_CAPTURE_RESULT,
  COMPUTER_MOUNT_CLICK_ARGUMENTS,
  COMPUTER_MOUNT_COMPLETED,
  COMPUTER_MOUNT_DRIVER_STARTED,
  COMPUTER_MOUNT_GET_WINDOW,
  COMPUTER_MOUNT_INVALID_ARGUMENTS,
  COMPUTER_MOUNT_INVALID_DESCRIPTION,
  COMPUTER_MOUNT_LIVE_NEGATIVE_DESCRIPTION,
  COMPUTER_MOUNT_LOG_FILE,
  COMPUTER_MOUNT_LOG_LIMIT_DESCRIPTION,
  COMPUTER_MOUNT_LOG_MAX_BYTES,
  COMPUTER_MOUNT_LOG_TOO_LARGE,
  COMPUTER_MOUNT_PID_ABSENT_DESCRIPTION,
  COMPUTER_MOUNT_PID_DUPLICATE_DESCRIPTION,
  COMPUTER_MOUNT_PID_INVALID_DESCRIPTION,
  COMPUTER_MOUNT_PID_MISSING,
  COMPUTER_MOUNT_PROCESS_STILL_ALIVE,
  COMPUTER_MOUNT_PROMPT,
  COMPUTER_MOUNT_REPLY,
  COMPUTER_MOUNT_REQUIRED_TEXT,
  COMPUTER_MOUNT_SCREENSHOT_STORAGE,
  COMPUTER_MOUNT_SHUTDOWN_DESCRIPTION,
  COMPUTER_MOUNT_STORED,
  COMPUTER_MOUNT_SUITE_DESCRIPTION,
  COMPUTER_MOUNT_TEXT,
  COMPUTER_MOUNT_TIMEOUT_MS,
  COMPUTER_MOUNT_TOOL,
  COMPUTER_MOUNT_TOOL_CALL,
  COMPUTER_MOUNT_VERDICT,
  COMPUTER_MOUNT_VERDICT_DESCRIPTION,
  computerMountLifecycle,
  computerMountToolResultText,
  configureComputerMountDriver,
  type PiProcessScenarioHandle,
  readComputerMountEvents,
  readPiProcessRequests,
  requireComputerMountProcessExited,
  requirePiProcessRequest,
  runPiProcessPrompt,
  runWithPiProcess,
} from "../fixtures"

async function executesMountedCapture(pi: PiProcessScenarioHandle): Promise<void> {
  const log = configureComputerMountDriver(pi)
  pi.homeDirectory.script([
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_CAPTURE_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TEXT, text: COMPUTER_MOUNT_REPLY },
  ])
  const requests = await runPiProcessPrompt(pi, COMPUTER_MOUNT_PROMPT)
  expect(requests).toHaveLength(2)
  expect(computerMountToolResultText(requirePiProcessRequest(requests, 1))).toContain(COMPUTER_MOUNT_CAPTURE_RESULT)
  expect(readComputerMountEvents(log)).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: COMPUTER_MOUNT_GET_WINDOW })]),
  )
}

async function preservesMountedVerdict(pi: PiProcessScenarioHandle): Promise<void> {
  configureComputerMountDriver(pi)
  pi.homeDirectory.script([
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_CAPTURE_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_CLICK_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TEXT, text: COMPUTER_MOUNT_REPLY },
  ])
  const requests = await runPiProcessPrompt(pi, COMPUTER_MOUNT_PROMPT)
  expect(requests).toHaveLength(3)
  const result = computerMountToolResultText(requirePiProcessRequest(requests, 2))
  expect(result).toContain(COMPUTER_MOUNT_COMPLETED)
  expect(result).toContain(COMPUTER_MOUNT_VERDICT)
  expect(result).toContain(COMPUTER_MOUNT_SCREENSHOT_STORAGE)
  expect(result).toContain(COMPUTER_MOUNT_STORED)
}

async function refusesBeforeDriver(pi: PiProcessScenarioHandle): Promise<void> {
  const log = configureComputerMountDriver(pi)
  pi.homeDirectory.script([
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_INVALID_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TEXT, text: COMPUTER_MOUNT_REPLY },
  ])
  await runPiProcessPrompt(pi, COMPUTER_MOUNT_PROMPT)
  expect(readComputerMountEvents(log)).toEqual([])
  expect(
    computerMountToolResultText(requirePiProcessRequest(readPiProcessRequests(pi.homeDirectory.home), 1)),
  ).toContain(COMPUTER_MOUNT_REQUIRED_TEXT)
}

async function releasesMountedDriver(pi: PiProcessScenarioHandle): Promise<void> {
  const log = configureComputerMountDriver(pi)
  pi.homeDirectory.script([
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_CAPTURE_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TEXT, text: COMPUTER_MOUNT_REPLY },
  ])
  await runPiProcessPrompt(pi, COMPUTER_MOUNT_PROMPT)
  const { pid } = computerMountLifecycle(readComputerMountEvents(log))
  expect(process.kill(pid, 0)).toBe(true)
  await pi.close()
  const lifecycle = computerMountLifecycle(readComputerMountEvents(log))
  expect(lifecycle.sessionEndCount).toBe(1)
  requireComputerMountProcessExited(pid)
}

async function refusesLiveProcessProof(pi: PiProcessScenarioHandle): Promise<void> {
  const log = configureComputerMountDriver(pi)
  pi.homeDirectory.script([
    { kind: COMPUTER_MOUNT_TOOL_CALL, name: COMPUTER_MOUNT_TOOL, argumentsJson: COMPUTER_MOUNT_CAPTURE_ARGUMENTS },
    { kind: COMPUTER_MOUNT_TEXT, text: COMPUTER_MOUNT_REPLY },
  ])
  await runPiProcessPrompt(pi, COMPUTER_MOUNT_PROMPT)
  const { pid } = computerMountLifecycle(readComputerMountEvents(log))
  expect(process.kill(pid, 0)).toBe(true)
  expect(requireComputerMountProcessExited.bind(null, pid)).toThrow(COMPUTER_MOUNT_PROCESS_STILL_ALIVE)
}

async function refusesOversizedLog(pi: PiProcessScenarioHandle): Promise<void> {
  const log = join(pi.homeDirectory.home, COMPUTER_MOUNT_LOG_FILE)
  writeFileSync(log, Buffer.alloc(COMPUTER_MOUNT_LOG_MAX_BYTES + 1))
  expect(readComputerMountEvents.bind(null, log)).toThrow(COMPUTER_MOUNT_LOG_TOO_LARGE)
}

function refusesMissingPidEvent(): void {
  expect(computerMountLifecycle.bind(null, [])).toThrow(COMPUTER_MOUNT_PID_MISSING)
}

function refusesDuplicatePidEvents(): void {
  const events = [
    { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 1 },
    { name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 2 },
  ]
  expect(computerMountLifecycle.bind(null, events)).toThrow(COMPUTER_MOUNT_PID_MISSING)
}

function refusesInvalidPid(): void {
  expect(computerMountLifecycle.bind(null, [{ name: COMPUTER_MOUNT_DRIVER_STARTED, pid: 0 }])).toThrow(
    COMPUTER_MOUNT_PID_MISSING,
  )
}

function suite(): void {
  test(COMPUTER_MOUNT_PID_ABSENT_DESCRIPTION, refusesMissingPidEvent)
  test(COMPUTER_MOUNT_PID_DUPLICATE_DESCRIPTION, refusesDuplicatePidEvents)
  test(COMPUTER_MOUNT_PID_INVALID_DESCRIPTION, refusesInvalidPid)
  test(
    COMPUTER_MOUNT_LIVE_NEGATIVE_DESCRIPTION,
    runWithPiProcess.bind(null, refusesLiveProcessProof),
    COMPUTER_MOUNT_TIMEOUT_MS,
  )
  test(COMPUTER_MOUNT_LOG_LIMIT_DESCRIPTION, runWithPiProcess.bind(null, refusesOversizedLog))
  test(
    COMPUTER_MOUNT_CAPTURE_DESCRIPTION,
    runWithPiProcess.bind(null, executesMountedCapture),
    COMPUTER_MOUNT_TIMEOUT_MS,
  )
  test(
    COMPUTER_MOUNT_VERDICT_DESCRIPTION,
    runWithPiProcess.bind(null, preservesMountedVerdict),
    COMPUTER_MOUNT_TIMEOUT_MS,
  )
  test(COMPUTER_MOUNT_INVALID_DESCRIPTION, runWithPiProcess.bind(null, refusesBeforeDriver), COMPUTER_MOUNT_TIMEOUT_MS)
  test(
    COMPUTER_MOUNT_SHUTDOWN_DESCRIPTION,
    runWithPiProcess.bind(null, releasesMountedDriver),
    COMPUTER_MOUNT_TIMEOUT_MS,
  )
}

describe(COMPUTER_MOUNT_SUITE_DESCRIPTION, suite)
