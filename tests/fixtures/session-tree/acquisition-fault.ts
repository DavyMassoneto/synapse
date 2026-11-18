import fs from "node:fs"
import { syncBuiltinESMExports } from "node:module"
import { dirname } from "node:path"
import { vi } from "vitest"
import {
  TREE_ACQUISITION_PRIMARY,
  TREE_ACQUISITION_SECONDARY,
  TREE_FIRST_SETTINGS_WRITE,
  TREE_REMOVE_METHOD,
  TREE_SCRIPT_FILE_SUFFIX,
  TREE_SCRIPT_TARGET,
  TREE_SETTINGS_FILE_SUFFIX,
  TREE_SETTINGS_TARGET,
  TREE_WRITE_FILE_METHOD,
} from "./constants"
import { type TreeAcquisitionTarget } from "./types"

export class TreeAcquisitionFault {
  readonly primary = new Error(TREE_ACQUISITION_PRIMARY)

  readonly secondary = new Error(TREE_ACQUISITION_SECONDARY)

  private readonly write = fs.writeFileSync

  private readonly remove = fs.rmSync

  private readonly target: TreeAcquisitionTarget

  private readonly failCleanup: boolean

  directory = ""

  private settingsWrites = 0

  private readonly settingsWrite: number

  constructor(target: TreeAcquisitionTarget, failCleanup: boolean, settingsWrite: number) {
    this.settingsWrite = settingsWrite
    this.target = target
    this.failCleanup = failCleanup
    vi.spyOn(fs, TREE_WRITE_FILE_METHOD).mockImplementation(this.writeFile.bind(this))
    vi.spyOn(fs, TREE_REMOVE_METHOD).mockImplementation(this.removeDirectory.bind(this))
    syncBuiltinESMExports()
  }

  private writeFile(...args: Parameters<typeof fs.writeFileSync>): void {
    const path = String(args[0])
    if (path.endsWith(TREE_SETTINGS_FILE_SUFFIX)) {
      this.settingsWrites += 1
    }
    if (
      (this.target === TREE_SETTINGS_TARGET && this.settingsWrites === this.settingsWrite) ||
      (this.target === TREE_SCRIPT_TARGET &&
        path.endsWith(TREE_SCRIPT_FILE_SUFFIX) &&
        this.settingsWrites === this.settingsWrite)
    ) {
      this.directory = dirname(dirname(path))
      if (this.settingsWrite === TREE_FIRST_SETTINGS_WRITE) {
        this.directory = dirname(path)
      }
      if (this.target === TREE_SCRIPT_TARGET) {
        this.directory = dirname(path)
      }
      throw this.primary
    }
    this.write(...args)
  }

  private removeDirectory(...args: Parameters<typeof fs.rmSync>): void {
    if (this.failCleanup && String(args[0]) === this.directory) {
      throw this.secondary
    }
    this.remove(...args)
  }

  close(): void {
    vi.restoreAllMocks()
    syncBuiltinESMExports()
    if (this.directory) {
      this.remove(this.directory, { recursive: true, force: true })
    }
  }
}
