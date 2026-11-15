import { constants } from "node:fs"
import { access } from "node:fs/promises"

export async function requireSupervisedBashDirectory(cwd: string): Promise<void> {
  try {
    await access(cwd, constants.F_OK)
  } catch {
    throw new Error(`Working directory does not exist: ${cwd}\nCannot execute bash commands.`)
  }
}
