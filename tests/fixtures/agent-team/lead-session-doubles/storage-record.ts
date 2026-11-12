import { join } from "node:path"
import { type MemberRecord } from "#synapse/modules"
import { TEAM_SESSION_FIXTURE_TEST_RECORD } from "./constants"
import { type TeamStorageFixture } from "./storage-fixture"

export function teamStorageRecord(fixture: TeamStorageFixture): MemberRecord {
  return {
    ...TEAM_SESSION_FIXTURE_TEST_RECORD,
    cwd: fixture.cwd,
    sessionFile: join(fixture.directory, TEAM_SESSION_FIXTURE_TEST_RECORD.sessionFile),
  }
}
