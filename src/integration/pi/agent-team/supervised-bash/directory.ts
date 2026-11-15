import { constants } from "node:fs"
import { access } from "node:fs/promises"
import { SUPERVISED_BASH_DIRECTORY_PREFIX, SUPERVISED_BASH_DIRECTORY_SUFFIX } from "./constants"

export async function requireSupervisedBashDirectory(cwd: string): Promise<void> {
  try {
    await access(cwd, constants.F_OK)
  } catch {
    throw new Error(`${SUPERVISED_BASH_DIRECTORY_PREFIX}${cwd}${SUPERVISED_BASH_DIRECTORY_SUFFIX}`)
  }
}
