import { readFileSync } from "node:fs"
import { join } from "node:path"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { expect } from "vitest"
import { type MemberRecord, type TeamOverview } from "#synapse/modules/agent-team"
import { SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX } from "../scripted-provider"
import { SELECTION_SCRIPT } from "../task-selection"
import { TREE_CUSTOM_ENTRY, TREE_FILE_ENCODING, TREE_PROBE_FILE } from "./constants"
import { type SessionTreeFixture } from "./fixture"
import { isTreeProcessAlive } from "./predicates"
import { TREE_PROBE_NEWLINE, TREE_PROBE_SHUTDOWN_PREFIX } from "./probe"

export function expectTreeMemberStopped(fixture: SessionTreeFixture, record: MemberRecord, pid: number): void {
  expect(readFileSync(join(fixture.directory, TREE_PROBE_FILE), TREE_FILE_ENCODING)).toContain(
    TREE_PROBE_SHUTDOWN_PREFIX + record.sessionId + TREE_PROBE_NEWLINE,
  )
  expect(isTreeProcessAlive(pid)).toBe(false)
  const storage = SessionManager.open(record.sessionFile)
  expect(storage.getSessionId()).toBe(record.sessionId)
  expect(storage.getEntries().length).toBeGreaterThan(0)
}

export function expectTreeHistoryIntact(storage: SessionManager, records: MemberRecord[]): void {
  const entries = storage.getEntries()
  for (const record of records) {
    expect(entries).toContainEqual(
      expect.objectContaining({
        type: TREE_CUSTOM_ENTRY,
        data: expect.objectContaining({ record }),
      }),
    )
    expect(SessionManager.open(record.sessionFile).getSessionId()).toBe(record.sessionId)
  }
}

export function treeAgentNames(overview: TeamOverview): string[] {
  const names: string[] = []
  for (const agent of overview.agents) {
    names.push(agent.name)
  }
  return names
}

export function treeProviderOffset(fixture: SessionTreeFixture, track: number): string {
  return readFileSync(
    join(fixture.directory, `${SELECTION_SCRIPT}.${track}${SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX}`),
    TREE_FILE_ENCODING,
  )
}
