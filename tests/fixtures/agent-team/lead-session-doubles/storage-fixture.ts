import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import {
  TEAM_SESSION_FIXTURE_STORAGE_MISSING,
  TEAM_SESSION_FIXTURE_TEST_CWD,
  TEAM_SESSION_FIXTURE_TEST_PREFIX,
} from "./constants"

export class TeamStorageFixture {
  readonly directory = mkdtempSync(join(tmpdir(), TEAM_SESSION_FIXTURE_TEST_PREFIX))

  readonly cwd = join(this.directory, TEAM_SESSION_FIXTURE_TEST_CWD)

  readonly storage = SessionManager.create(this.cwd, this.directory)

  sessionFile(): string {
    const path = this.storage.getSessionFile()
    if (path) {
      return path
    }
    throw new Error(TEAM_SESSION_FIXTURE_STORAGE_MISSING)
  }

  dispose(): void {
    rmSync(this.directory, { recursive: true, force: true })
  }
}
