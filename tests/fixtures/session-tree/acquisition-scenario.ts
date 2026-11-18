import { expect } from "vitest"
import { readTreeProbe } from "./acquisition-probe"
import { navigateTreeAcquisition, reloadTreeAcquisition, shutdownTreeAcquisition } from "./acquisition-transitions"
import {
  TREE_ACCEPTED,
  TREE_CHECKPOINT,
  TREE_NAVIGATE_ACTION,
  TREE_OPEN_METHOD,
  TREE_REFUSED,
  TREE_REOPEN_METHOD,
  TREE_ROOT_PROMPT,
  TREE_SHUTDOWN_ACTION,
  TREE_USER_ROLE,
  TREE_WORKER,
} from "./constants"
import { SessionTreeFixture } from "./fixture"
import {
  type TreeAcquisitionKind,
  type TreeAcquisitionPhase,
  type TreeAcquisitionScenario,
  type TreeTransitionAction,
} from "./types"

export async function runTreeAcquisitionScenario(
  kind: TreeAcquisitionKind,
  phase: TreeAcquisitionPhase,
  action: TreeTransitionAction,
): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const scenario = await prepareTreeAcquisition(fixture, kind, phase)
    try {
      if (action === TREE_NAVIGATE_ACTION) {
        await navigateTreeAcquisition(scenario)
      } else if (action === TREE_SHUTDOWN_ACTION) {
        await shutdownTreeAcquisition(scenario)
      } else {
        await reloadTreeAcquisition(scenario)
      }
      expect(fixture.errors).toEqual([])
    } finally {
      scenario.gate.close()
    }
  } finally {
    await fixture.close()
  }
}

async function prepareTreeAcquisition(
  fixture: SessionTreeFixture,
  kind: TreeAcquisitionKind,
  phase: TreeAcquisitionPhase,
): Promise<TreeAcquisitionScenario> {
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
    const navigation = session.navigateTree(branch)
    if (kind === TREE_OPEN_METHOD) {
      previous = startRejectedTreeMember(fixture)
    }
    await gate.entered
    return { fixture, session, root, branch, gate, previous, navigation, probeBefore: readTreeProbe(fixture) }
  } catch (error) {
    gate.close()
    throw error
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
