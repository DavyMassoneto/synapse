import { TREE_MISSING_PROCESS_CODE } from "./constants"

export function isTreeProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === TREE_MISSING_PROCESS_CODE) {
      return false
    }
    throw error
  }
}
