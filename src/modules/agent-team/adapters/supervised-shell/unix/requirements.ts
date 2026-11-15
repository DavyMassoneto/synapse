import { constants } from "node:fs"
import { access } from "node:fs/promises"
import { SHELL_REQUIREMENT_PS } from "./constants"

export async function requireUnixShell(ps: string): Promise<void> {
  try {
    await access(ps, constants.X_OK)
  } catch {
    throw new Error(SHELL_REQUIREMENT_PS)
  }
}
