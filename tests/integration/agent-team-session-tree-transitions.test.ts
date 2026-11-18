import { describe, expect, test } from "vitest"
import {
  expectTreeMemberStopped,
  isTreeProcessAlive,
  SessionTreeFixture,
  TREE_ACCEPTED,
  TREE_ALTERNATE,
  TREE_BAD_TASK_DATA,
  TREE_BAD_TASK_ENTRY,
  TREE_CHECKPOINT,
  TREE_CLAIM,
  TREE_CORRUPT_SCENARIO,
  TREE_DESCRIPTION,
  TREE_LEAD,
  TREE_OVERLAP_SCENARIO,
  TREE_QUIT_REASON,
  TREE_RELOAD_SCENARIO,
  TREE_ROOT_PROMPT,
  TREE_RUNNING,
  TREE_SELECTED,
  TREE_SESSION_SHUTDOWN_EVENT,
  TREE_SESSION_TREE_EVENT,
  TREE_SHUTDOWN_SCENARIO,
  TREE_SUITE,
  TREE_TASK,
  TREE_TIMEOUT_MS,
  TREE_UNSELECTED,
  TREE_USER_ROLE,
  TREE_WORKER,
  TreeTransitionBarrier,
  type TreeTransitionState,
  treeAgentNames,
} from "../fixtures"

async function rejectsCorruptBranch(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    const bad = storage.appendCustomEntry(TREE_BAD_TASK_ENTRY, TREE_BAD_TASK_DATA)
    await session.navigateTree(root)
    const pid = await fixture.startMember(TREE_WORKER)
    const record = fixture.memberRecord(TREE_WORKER, storage)
    expect(
      fixture
        .board()
        .createTask({ subject: TREE_WORKER, description: TREE_DESCRIPTION, blockedBy: [], writeScopes: [] }).kind,
    ).toBe(TREE_ACCEPTED)
    expect(
      fixture.board().updateTask(TREE_LEAD, { taskId: TREE_TASK, expectedRevision: 1, action: TREE_CLAIM }).kind,
    ).toBe(TREE_ACCEPTED)
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    const tasks = fixture.board().listTasks({})
    const entries = JSON.stringify(storage.getEntries())
    expect(await session.navigateTree(bad)).toMatchObject({ cancelled: false })
    expect(storage.getLeafId()).toBe(bad)
    expect(fixture.errors).toHaveLength(1)
    expect(fixture.errors[0]).toMatchObject({ event: TREE_SESSION_TREE_EVENT })
    expect(fixture.board().listTasks({})).toEqual([])
    expect(fixture.board().getTask(TREE_TASK).kind).not.toBe(TREE_ACCEPTED)
    expect(fixture.board().selectedTask(TREE_LEAD)).toEqual({ kind: TREE_UNSELECTED })
    expectTreeMemberStopped(fixture, record, pid)
    await session.navigateTree(root)
    await session.navigateTree(branch)
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(fixture.board().selectedTask(TREE_LEAD)).toEqual({ kind: TREE_UNSELECTED })
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD, TREE_WORKER])
    expect(JSON.stringify(storage.getEntries())).toBe(entries)
  } finally {
    await fixture.close()
  }
}

async function latestNavigationWins(): Promise<void> {
  const fixture = new SessionTreeFixture()
  const state: TreeTransitionState = {}
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    const second = storage.appendCustomEntry(TREE_CHECKPOINT)
    const firstPid = await fixture.startMember(TREE_WORKER)
    state.barrier = new TreeTransitionBarrier(fixture.board())
    const older = session.navigateTree(root)
    await state.barrier.entered
    expect(isTreeProcessAlive(firstPid)).toBe(false)
    await session.navigateTree(second)
    const newPid = await fixture.startMember(TREE_ALTERNATE)
    expect(
      fixture
        .board()
        .createTask({ subject: TREE_ALTERNATE, description: TREE_DESCRIPTION, blockedBy: [], writeScopes: [] }).kind,
    ).toBe(TREE_ACCEPTED)
    expect(
      fixture.board().updateTask(TREE_LEAD, { taskId: TREE_TASK, expectedRevision: 1, action: TREE_CLAIM }).kind,
    ).toBe(TREE_ACCEPTED)
    const selection = fixture.board().selectedTask(TREE_LEAD)
    expect(selection.kind).toBe(TREE_SELECTED)
    state.barrier.release()
    await older
    expect(fixture.board().selectedTask(TREE_LEAD)).toEqual(selection)
    expect(fixture.board().overview().agents[1]).toMatchObject({ name: TREE_ALTERNATE, status: TREE_RUNNING })
    expect(isTreeProcessAlive(newPid)).toBe(true)
    expect(fixture.errors).toEqual([])
  } finally {
    state.barrier?.release()
    await fixture.close()
  }
}

async function shutdownInvalidatesTransition(): Promise<void> {
  const fixture = new SessionTreeFixture()
  const state: TreeTransitionState = {}
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    await fixture.startMember(TREE_WORKER)
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    await session.navigateTree(root)
    state.barrier = new TreeTransitionBarrier(fixture.board())
    const older = session.navigateTree(branch)
    await state.barrier.entered
    await session.extensionRunner.emit({ type: TREE_SESSION_SHUTDOWN_EVENT, reason: TREE_QUIT_REASON })
    state.barrier.release()
    await older
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
    expect(fixture.board().listTasks({})).toEqual([])
    expect(fixture.errors).toEqual([])
  } finally {
    state.barrier?.release()
    await fixture.close()
  }
}

async function reloadInvalidatesTransition(): Promise<void> {
  const fixture = new SessionTreeFixture()
  const state: TreeTransitionState = {}
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    await fixture.startMember(TREE_WORKER)
    const tasks = fixture.board().listTasks({})
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    await session.navigateTree(root)
    state.barrier = new TreeTransitionBarrier(fixture.board())
    const older = session.navigateTree(branch)
    await state.barrier.entered
    await session.reload()
    state.barrier.release()
    await older
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD, TREE_WORKER])
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(fixture.errors).toEqual([])
  } finally {
    state.barrier?.release()
    await fixture.close()
  }
}

function register(): void {
  test(TREE_CORRUPT_SCENARIO, rejectsCorruptBranch, TREE_TIMEOUT_MS)
  test(TREE_OVERLAP_SCENARIO, latestNavigationWins, TREE_TIMEOUT_MS)
  test(TREE_RELOAD_SCENARIO, reloadInvalidatesTransition, TREE_TIMEOUT_MS)
  test(TREE_SHUTDOWN_SCENARIO, shutdownInvalidatesTransition, TREE_TIMEOUT_MS)
}

describe(TREE_SUITE, register)
