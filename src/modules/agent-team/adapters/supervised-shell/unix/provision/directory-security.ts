import { type Stats } from "node:fs"
import { UNIX_LAUNCHER_INVALID, UNIX_LAUNCHER_UNSAFE_MODE } from "./constants"

export function requirePrivateLauncherDirectory(status: Stats): void {
  if (!status.isDirectory() || status.isSymbolicLink() || (status.mode & UNIX_LAUNCHER_UNSAFE_MODE) !== 0) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
}
