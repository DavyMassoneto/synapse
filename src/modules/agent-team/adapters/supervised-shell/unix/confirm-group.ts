import { execFile } from "node:child_process"
import { setTimeout } from "node:timers/promises"
import {
  UNIX_KEEPER_GROUP_RECHECK_MS,
  UNIX_KEEPER_GROUP_WAIT_MS,
  UNIX_KEEPER_INVALID,
  UNIX_KEEPER_PS,
  UNIX_KEEPER_PS_ARGUMENTS,
  UNIX_KEEPER_PS_MAX_BYTES,
} from "./constants"
import { type UnixGroupReadError, type UnixGroupReject, type UnixGroupResolve } from "./types"

export async function confirmUnixGroupEmpty(group: number): Promise<void> {
  const deadline = performance.now() + UNIX_KEEPER_GROUP_WAIT_MS
  let present = true
  while (present && performance.now() < deadline) {
    const groups = await new Promise<string>(readUnixGroups)
    present = groups.split("\n").map(Number).includes(group)
    if (present) {
      await setTimeout(UNIX_KEEPER_GROUP_RECHECK_MS)
    }
  }
  if (present) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
}

function readUnixGroups(resolve: UnixGroupResolve, reject: UnixGroupReject): void {
  execFile(
    UNIX_KEEPER_PS,
    UNIX_KEEPER_PS_ARGUMENTS,
    { encoding: "utf8", maxBuffer: UNIX_KEEPER_PS_MAX_BYTES },
    groupsRead.bind(undefined, resolve, reject),
  )
}

function groupsRead(
  resolve: UnixGroupResolve,
  reject: UnixGroupReject,
  error: UnixGroupReadError,
  stdout: string,
): void {
  if (error) {
    reject(error)
  } else {
    resolve(stdout)
  }
}
