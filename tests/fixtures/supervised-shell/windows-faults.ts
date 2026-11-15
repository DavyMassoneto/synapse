import { execFile } from "node:child_process"
import { fileURLToPath } from "node:url"
import {
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS_FAULT_BUFFER_BYTES,
  WINDOWS_SHELL_FLAGS,
  WINDOWS_SHELL_POWERSHELL,
} from "./constants"
import { type WindowsFaultsError, type WindowsFaultsReject, type WindowsFaultsResolve } from "./types"

export function runWindowsScript(url: string, argumentsList: string[]): Promise<string> {
  return new Promise<string>(startWindowsScript.bind(undefined, url, argumentsList))
}

function startWindowsScript(
  url: string,
  argumentsList: string[],
  resolve: WindowsFaultsResolve,
  reject: WindowsFaultsReject,
): void {
  execFile(
    WINDOWS_SHELL_POWERSHELL,
    [...WINDOWS_SHELL_FLAGS, fileURLToPath(new URL(url, import.meta.url)), ...argumentsList],
    { encoding: "utf8", timeout: SUPERVISED_TEST_TIMEOUT_MS, maxBuffer: SUPERVISED_TEST_WINDOWS_FAULT_BUFFER_BYTES },
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
