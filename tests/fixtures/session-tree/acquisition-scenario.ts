import { readFileSync } from "node:fs"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { expect } from "vitest"
import {
  TREE_ACCEPTED,
  TREE_CHECKPOINT,
  TREE_CLOSE_OBSERVATION_MS,
  TREE_FILE_ENCODING,
  TREE_LEAD,
  TREE_MISSING_FILE_CODE,
  TREE_NAVIGATE_ACTION,
  TREE_OPEN_METHOD,
  TREE_POLL_MS,
  TREE_PROBE_FILE,
  TREE_QUIT_REASON,
  TREE_REFUSED,
  TREE_REOPEN_METHOD,
  TREE_ROOT_PROMPT,
  TREE_SESSION_SHUTDOWN_EVENT,
  TREE_SHUTDOWN_ACTION,
  TREE_TIMEOUT_MS,
  TREE_USER_ROLE,
  TREE_WAIT_FAILURE,
  TREE_WORKER,
} from "./constants"
import { SessionTreeFixture } from "./fixture"
import { treeAgentNames } from "./observations"
import { type TreeAcquisitionKind, type TreeAcquisitionPhase, type TreeTransitionAction } from "./types"

export async function runTreeAcquisitionScenario(
  kind: TreeAcquisitionKind,
  phase: TreeAcquisitionPhase,
  action: TreeTransitionAction,
): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    if (kind === TREE_REOPEN_METHOD) {
      await fixture.startMember(TREE_WORKER)
    }
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    if (kind === TREE_REOPEN_METHOD) {
      await session.navigateTree(root)
    }
    const gate = fixture.gateAcquisition(phase)
    try {
      let previous: Promise<void> = Promise.resolve()
      let navigation = session.navigateTree(branch)
      if (kind === TREE_OPEN_METHOD) {
        previous = startRejectedTreeMember(fixture)
      }
      await gate.entered
      const before = readTreeProbe(fixture)
      if (action === TREE_NAVIGATE_ACTION) {
        const leaving = session.navigateTree(root)
        const deadline = Date.now() + TREE_TIMEOUT_MS
        while (session.isCompacting) {
          if (Date.now() >= deadline) {
            throw new Error(TREE_WAIT_FAILURE)
          }
          await setTimeout(TREE_POLL_MS)
        }
        navigation = session.navigateTree(branch)
        await Promise.race([navigation, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
        expect(readTreeProbe(fixture)).toBe(before)
        expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
        gate.release()
        await Promise.all([previous, leaving, navigation])
      } else if (action === TREE_SHUTDOWN_ACTION) {
        const closing = session.extensionRunner.emit({ type: TREE_SESSION_SHUTDOWN_EVENT, reason: TREE_QUIT_REASON })
        await Promise.race([closing, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
        expect(readTreeProbe(fixture)).toBe(before)
        gate.release()
        await Promise.all([previous, navigation, closing])
        expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
      } else {
        const reloading = session.reload()
        await Promise.race([reloading, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
        expect(readTreeProbe(fixture)).toBe(before)
        gate.release()
        await Promise.all([previous, navigation, reloading])
      }
      expect(fixture.errors).toEqual([])
    } finally {
      gate.close()
    }
  } finally {
    await fixture.close()
  }
}

async function startRejectedTreeMember(fixture: SessionTreeFixture): Promise<void> {
  const task = fixture
    .board()
    .createTask({ subject: TREE_WORKER, description: TREE_WORKER, blockedBy: [], writeScopes: [] })
  if (task.kind !== TREE_ACCEPTED) {
    throw new Error(JSON.stringify(task))
  }
  const outcome = await fixture
    .board()
    .start({ name: TREE_WORKER, description: TREE_WORKER, taskId: task.task.id, expectedRevision: task.task.revision })
  expect(outcome.kind).toBe(TREE_REFUSED)
}

function readTreeProbe(fixture: SessionTreeFixture): string {
  const path = join(fixture.directory, TREE_PROBE_FILE)
  try {
    return readFileSync(path, TREE_FILE_ENCODING)
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === TREE_MISSING_FILE_CODE) {
      return ""
    }
    throw error
  }
}
