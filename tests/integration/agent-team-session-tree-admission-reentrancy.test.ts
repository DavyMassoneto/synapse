import { existsSync, readFileSync } from "node:fs"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { readTeamHistory } from "#synapse/integration/pi/agent-team"
import {
  ADMISSION_ACCEPTED_KIND,
  ADMISSION_LEAD_NAME,
  ADMISSION_REENTRANT_JOURNAL,
  ADMISSION_REENTRANT_TASK,
  ADMISSION_REENTRANT_WORKER,
  ADMISSION_REFUSED_KIND,
  ADMISSION_SESSION_ENCODING,
  AdmissionReentrantJournal,
  admissionEntries,
  SELECTION_TIMEOUT_MS,
  TaskSelectionFixture,
  TREE_UNSELECTED,
} from "../fixtures"

async function journalThenSuspend(): Promise<void> {
  const journal = new AdmissionReentrantJournal()
  const fixture = new TaskSelectionFixture(undefined, journal.mount.bind(journal))
  try {
    const session = await fixture.start()
    const created = fixture.board().createTask({
      subject: ADMISSION_REENTRANT_TASK,
      description: ADMISSION_REENTRANT_TASK,
      blockedBy: [],
      writeScopes: [],
    })
    if (created.kind !== ADMISSION_ACCEPTED_KIND) {
      throw new Error(created.message)
    }
    const started = await fixture.board().start({
      name: ADMISSION_REENTRANT_WORKER,
      description: ADMISSION_REENTRANT_TASK,
      taskId: created.task.id,
      expectedRevision: created.task.revision,
    })
    expect(started.kind).toBe(ADMISSION_REFUSED_KIND)
    await journal.waitStopped()
    expect(fixture.board().overview().agents).toEqual([expect.objectContaining({ name: ADMISSION_LEAD_NAME })])
    expect(fixture.board().listTasks({})).toEqual([])
    expect(admissionEntries(session)).toHaveLength(1)
    const history = readTeamHistory(session.sessionManager, session.sessionId)
    expect(history.members).toHaveLength(1)
    expect(history.tasks).toContainEqual(
      expect.objectContaining({ id: created.task.id, revision: created.task.revision + 1 }),
    )
    for (const record of history.members) {
      expect(existsSync(record.sessionFile)).toBe(true)
      expect(SessionManager.open(record.sessionFile).getSessionId()).toBe(record.sessionId)
      const bytes = readFileSync(record.sessionFile, ADMISSION_SESSION_ENCODING)
      expect(bytes.length).toBeGreaterThan(0)
      await fixture.board().restore(history.members, history.tasks)
      expect(readFileSync(record.sessionFile, ADMISSION_SESSION_ENCODING)).toBe(bytes)
    }
    expect(fixture.board().selectedTask(ADMISSION_REENTRANT_WORKER)).toEqual({ kind: TREE_UNSELECTED })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

test(ADMISSION_REENTRANT_JOURNAL, journalThenSuspend, SELECTION_TIMEOUT_MS)
