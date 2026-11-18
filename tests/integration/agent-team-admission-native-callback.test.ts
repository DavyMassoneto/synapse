import { existsSync } from "node:fs"
import { expect, test } from "vitest"
import { readTeamHistory, TEAM_HISTORY_ADMISSION_ENTRY } from "#synapse/integration/pi/agent-team"
import { TEAM_ADMISSION_UNCERTAIN } from "#synapse/modules/agent-team"
import {
  ADMISSION_ACCEPTED_KIND,
  ADMISSION_CUSTOM_ENTRY_TYPE,
  ADMISSION_NATIVE_CALLBACK_SCENARIO,
  ADMISSION_NAVIGATE_ACTION,
  ADMISSION_REENTRANT_TASK,
  ADMISSION_REENTRANT_WORKER,
  ADMISSION_RELOAD_ACTION,
  ADMISSION_SUSPEND_ACTION,
  type AdmissionNativeAction,
  AdmissionNativeCallback,
  SELECTION_TIMEOUT_MS,
  SessionTreeFixture,
  TREE_CHECKPOINT,
  TREE_UNSELECTED,
} from "../fixtures"

async function nativeCallbackFailure(action: AdmissionNativeAction): Promise<void> {
  const callback = new AdmissionNativeCallback(action)
  const fixture = new SessionTreeFixture(callback.mount.bind(callback))
  try {
    const session = await fixture.start()
    const target = session.sessionManager.appendCustomEntry(TREE_CHECKPOINT)
    const task = fixture.board().createTask({
      subject: ADMISSION_REENTRANT_TASK,
      description: ADMISSION_REENTRANT_TASK,
      blockedBy: [],
      writeScopes: [],
    })
    if (task.kind !== ADMISSION_ACCEPTED_KIND) {
      throw new Error(task.message)
    }
    callback.arm(session, target)
    await fixture.board().start({
      name: ADMISSION_REENTRANT_WORKER,
      description: ADMISSION_REENTRANT_TASK,
      taskId: task.task.id,
      expectedRevision: task.task.revision,
    })
    await callback.waitFinished()
    expect(callback.result?.kind).toBe(TEAM_ADMISSION_UNCERTAIN)
    if (callback.result?.kind === TEAM_ADMISSION_UNCERTAIN) {
      expect(callback.result.error).toBe(callback.failure)
    }
    if (action === ADMISSION_NAVIGATE_ACTION) {
      for (const entry of session.sessionManager.getEntries()) {
        if (entry.type === ADMISSION_CUSTOM_ENTRY_TYPE && entry.customType === TEAM_HISTORY_ADMISSION_ENTRY) {
          await session.navigateTree(entry.id)
        }
      }
    }
    const history = readTeamHistory(session.sessionManager, session.sessionId)
    expect(history.members).toHaveLength(1)
    for (const record of history.members) {
      expect(existsSync(record.sessionFile)).toBe(true)
    }
    expect(fixture.board().selectedTask(ADMISSION_REENTRANT_WORKER)).toEqual({ kind: TREE_UNSELECTED })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(
    `${ADMISSION_NATIVE_CALLBACK_SCENARIO}/suspend`,
    nativeCallbackFailure.bind(null, ADMISSION_SUSPEND_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_NATIVE_CALLBACK_SCENARIO}/reload`,
    nativeCallbackFailure.bind(null, ADMISSION_RELOAD_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_NATIVE_CALLBACK_SCENARIO}/navigate`,
    nativeCallbackFailure.bind(null, ADMISSION_NAVIGATE_ACTION),
    SELECTION_TIMEOUT_MS,
  )
}

register()
