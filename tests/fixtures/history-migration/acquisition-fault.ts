import { mkdtempSync } from "node:fs"
import { HISTORY_MIGRATION_ACQUISITION_CLEANUP, HISTORY_MIGRATION_ACQUISITION_PRIMARY } from "./constants"
import { type HistoryMigrationContext } from "./types"

export class HistoryMigrationAcquisitionFault {
  home = ""

  private readonly createDirectory = mkdtempSync

  captureHome(...args: Parameters<typeof mkdtempSync>): ReturnType<typeof mkdtempSync> {
    const path = this.createDirectory(...args)
    this.home = String(path)
    return path
  }

  rejectWrite(): never {
    throw HISTORY_MIGRATION_ACQUISITION_PRIMARY
  }

  rejectCleanup(): never {
    throw HISTORY_MIGRATION_ACQUISITION_CLEANUP
  }

  async rejectScenario(_fixture: HistoryMigrationContext): Promise<void> {
    throw HISTORY_MIGRATION_ACQUISITION_PRIMARY
  }
}
