import { execFile } from "node:child_process"
import { fileURLToPath } from "node:url"
import {
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_FAULTS_URL,
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { type WindowsFaultsError, type WindowsFaultsReject, type WindowsFaultsResolve } from "./types"

export function runWindowsCleanupFaults(): Promise<string> {
  return new Promise<string>(startWindowsCleanupFaults)
}

function startWindowsCleanupFaults(resolve: WindowsFaultsResolve, reject: WindowsFaultsReject): void {
  execFile(
    WINDOWS_SHELL_POWERSHELL,
    [...WINDOWS_SHELL_FLAGS, fileURLToPath(new URL(SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL, import.meta.url))],
    { encoding: "utf8", timeout: 15000, maxBuffer: 65536 },
    finishWindowsNativeFaults.bind(undefined, resolve, reject),
  )
}

export function runWindowsNativeFaults(): Promise<string> {
  return new Promise<string>(startWindowsNativeFaults)
}

function startWindowsNativeFaults(resolve: WindowsFaultsResolve, reject: WindowsFaultsReject): void {
  execFile(
    WINDOWS_SHELL_POWERSHELL,
    [...WINDOWS_SHELL_FLAGS, fileURLToPath(new URL(SUPERVISED_TEST_WINDOWS_FAULTS_URL, import.meta.url))],
    { encoding: "utf8", timeout: 15000, maxBuffer: 65536 },
    finishWindowsNativeFaults.bind(undefined, resolve, reject),
  )
}

function finishWindowsNativeFaults(
  resolve: WindowsFaultsResolve,
  reject: WindowsFaultsReject,
  error: WindowsFaultsError,
  stdout: string,
  stderr: string,
): void {
  if (error) {
    reject(error)
  } else if (stderr.length > 0) {
    reject(new Error(stderr))
  } else {
    resolve(stdout)
  }
}
