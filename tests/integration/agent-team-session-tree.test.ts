import { describe, expect, test } from "vitest"
import {
  expectTreeHistoryIntact,
  expectTreeMemberStopped,
  isTreeProcessAlive,
  SessionTreeFixture,
  TREE_ACCEPTED,
  TREE_ALTERNATE,
  TREE_BRANCH_SCENARIO,
  TREE_CANCEL_SCENARIO,
  TREE_CHECKPOINT,
  TREE_CLAIM,
  TREE_DESCRIPTION,
  TREE_INACTIVE,
  TREE_INVALID_SCENARIO,
  TREE_INVALID_TARGET,
  TREE_INVALID_TARGET_PATTERN,
  TREE_LEAD,
  TREE_REASSIGN,
  TREE_ROOT_PROMPT,
  TREE_RUNNING,
  TREE_SELECTED,
  TREE_SUITE,
  TREE_TASK,
  TREE_TIMEOUT_MS,
  TREE_UNSELECTED,
  TREE_USER_ROLE,
  TREE_WORKER,
  treeAgentNames,
  treeProviderOffset,
} from "../fixtures"

async function navigateBranches(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    const firstPid = await fixture.startMember(TREE_WORKER)
    const firstRecord = fixture.memberRecord(TREE_WORKER, storage)
    expect(
      fixture
        .board()
        .createTask({ subject: TREE_WORKER, description: TREE_DESCRIPTION, blockedBy: [], writeScopes: [] }).kind,
    ).toBe(TREE_ACCEPTED)
    expect(
      fixture.board().updateTask(TREE_LEAD, { taskId: TREE_TASK, expectedRevision: 1, action: TREE_CLAIM }).kind,
    ).toBe(TREE_ACCEPTED)
    expect(fixture.board().selectedTask(TREE_LEAD).kind).toBe(TREE_SELECTED)
    const firstBranch = storage.appendCustomEntry(TREE_CHECKPOINT)
    const firstTasks = fixture.board().listTasks({})
    const firstOffset = treeProviderOffset(fixture, 0)
    expect(await session.navigateTree(root)).toMatchObject({ cancelled: false })
    expectTreeMemberStopped(fixture, firstRecord, firstPid)
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
    expect(fixture.board().listTasks({})).toEqual([])
    expect(fixture.board().selectedTask(TREE_LEAD)).toEqual({ kind: TREE_UNSELECTED })
    const secondPid = await fixture.startMember(TREE_ALTERNATE)
    const secondRecord = fixture.memberRecord(TREE_ALTERNATE, storage)
    expect(
      fixture
        .board()
        .createTask({ subject: TREE_ALTERNATE, description: TREE_DESCRIPTION, blockedBy: [], writeScopes: [] }).kind,
    ).toBe(TREE_ACCEPTED)
    expect(
      fixture
        .board()
        .updateTask(TREE_LEAD, { taskId: TREE_TASK, expectedRevision: 1, action: TREE_REASSIGN, owner: TREE_ALTERNATE })
        .kind,
    ).toBe(TREE_ACCEPTED)
    const secondBranch = storage.appendCustomEntry(TREE_CHECKPOINT)
    const secondTasks = fixture.board().listTasks({})
    const secondOffset = treeProviderOffset(fixture, 1)
    const originalEntries = storage.getEntries()
    const bytesBeforeReturn = JSON.stringify(originalEntries)
    expect(await session.navigateTree(firstBranch)).toMatchObject({ cancelled: false })
    expectTreeMemberStopped(fixture, secondRecord, secondPid)
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD, TREE_WORKER])
    expect(fixture.board().overview().agents[1]).toMatchObject({ status: TREE_INACTIVE })
    expect(fixture.board().listTasks({})).toEqual(firstTasks)
    expect(fixture.board().selectedTask(TREE_LEAD)).toEqual({ kind: TREE_UNSELECTED })
    expect(fixture.board().selectedTask(TREE_WORKER)).toEqual({ kind: TREE_UNSELECTED })
    expect(await session.navigateTree(secondBranch)).toMatchObject({ cancelled: false })
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD, TREE_ALTERNATE])
    expect(fixture.board().overview().agents[1]).toMatchObject({ status: TREE_INACTIVE })
    expect(fixture.board().listTasks({})).toEqual(secondTasks)
    expect(fixture.board().selectedTask(TREE_ALTERNATE)).toEqual({ kind: TREE_UNSELECTED })
    expect(await session.navigateTree(firstBranch)).toMatchObject({ cancelled: false })
    expect(fixture.board().listTasks({})).toEqual(firstTasks)
    expect(treeProviderOffset(fixture, 0)).toBe(firstOffset)
    expect(treeProviderOffset(fixture, 1)).toBe(secondOffset)
    expect(JSON.stringify(storage.getEntries())).toBe(bytesBeforeReturn)
    expectTreeHistoryIntact(storage, [firstRecord, secondRecord])
    expect(fixture.errors).toEqual([])
    expect(session.messages).toEqual([
      { role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: expect.any(Number) },
    ])
  } finally {
    await fixture.close()
  }
}

async function cancelNavigation(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const target = storage.appendCustomEntry(TREE_CHECKPOINT)
    const pid = await fixture.startMember(TREE_WORKER)
    fixture.cancelled = true
    const before = storage.getLeafId()
    expect(await session.navigateTree(target)).toMatchObject({ cancelled: true })
    expect(storage.getLeafId()).toBe(before)
    expect(fixture.board().overview().agents[1]).toMatchObject({ name: TREE_WORKER, status: TREE_RUNNING })
    expect(isTreeProcessAlive(pid)).toBe(true)
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function rejectInvalidNavigation(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const pid = await fixture.startMember(TREE_WORKER)
    const before = session.sessionManager.getLeafId()
    await expect(session.navigateTree(TREE_INVALID_TARGET)).rejects.toThrow(TREE_INVALID_TARGET_PATTERN)
    expect(session.sessionManager.getLeafId()).toBe(before)
    expect(fixture.board().overview().agents[1]).toMatchObject({ name: TREE_WORKER, status: TREE_RUNNING })
    expect(isTreeProcessAlive(pid)).toBe(true)
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(TREE_BRANCH_SCENARIO, navigateBranches, TREE_TIMEOUT_MS)
  test(TREE_CANCEL_SCENARIO, cancelNavigation, TREE_TIMEOUT_MS)
  test(TREE_INVALID_SCENARIO, rejectInvalidNavigation, TREE_TIMEOUT_MS)
}

describe(TREE_SUITE, register)
