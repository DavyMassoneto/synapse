import { existsSync, readFileSync } from "node:fs"
import { setTimeout } from "node:timers/promises"
import { TREE_FILE_ENCODING, TREE_PID_INVALID, TREE_POLL_MS, TREE_TIMEOUT_MS, TREE_WAIT_FAILURE } from "./constants"

export async function observeTreePid(path: string): Promise<number> {
  const deadline = Date.now() + TREE_TIMEOUT_MS
  while (!existsSync(path)) {
    if (Date.now() >= deadline) {
      throw new Error(TREE_WAIT_FAILURE)
    }
    await setTimeout(TREE_POLL_MS)
  }
  const pid = Number(readFileSync(path, TREE_FILE_ENCODING))
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    throw new Error(TREE_PID_INVALID)
  }
  return pid
}
