import { describe, expect, test } from "vitest"
import {
  isSelectionToolError,
  MESSAGING_INVALID,
  MESSAGING_INVALID_SCRIPT,
  MESSAGING_JOURNAL_FAILURE,
  MESSAGING_LIFECYCLE,
  MESSAGING_OWNERSHIP,
  MESSAGING_OWNERSHIP_SCRIPT,
  MESSAGING_SCRIPT,
  MESSAGING_SUITE,
  MessagingFaults,
  messagingMemberMessages,
  SELECTION_TIMEOUT_MS,
  selectionRequestContexts,
  TaskSelectionFixture,
} from "../fixtures"

async function messagingLifecycle(): Promise<void> {
  const faults = new MessagingFaults()
  const fixture = new TaskSelectionFixture(MESSAGING_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    await fixture.disableExternal()
    const tasks = fixture.board().listTasks({})
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    await fixture.step()
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(JSON.stringify(messagingMemberMessages(session, "worker"))).toContain("coordination probe")
    await fixture.step()
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-3", revision: 2, owner: "worker", status: "in_progress" },
    })
    expect(session.messages.filter(isSelectionToolError)).toEqual([])
    expect(session.messages).toContainEqual(
      expect.objectContaining({
        role: "toolResult",
        toolName: "send_message",
        isError: false,
        content: [
          { type: "text", text: expect.stringContaining('"kind":"delegated","task":{"id":"task-3","revision":2') },
        ],
      }),
    )
    expect(JSON.stringify(messagingMemberMessages(session, "worker"))).toContain("delegation probe")
    expect(JSON.stringify(messagingMemberMessages(session, "worker"))).toContain(
      '\\"id\\":\\"task-3\\",\\"revision\\":2',
    )
    expect(selectionRequestContexts(fixture.directory)).toContainEqual({
      selected: expect.stringContaining('"id":"task-3","revision":2'),
      external: false,
    })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function messagingOwnership(): Promise<void> {
  const faults = new MessagingFaults()
  const fixture = new TaskSelectionFixture(MESSAGING_OWNERSHIP_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    await fixture.step()
    expect(fixture.board().getTask("task-1")).toMatchObject({ kind: "accepted", task: { revision: 4, owner: "peer" } })
    expect(fixture.board().getTask("task-2")).toMatchObject({ kind: "accepted", task: { revision: 2, owner: "peer" } })
    expect(fixture.board().selectedTask("peer")).toMatchObject({ kind: "selected", task: { id: "task-1" } })
    expect(fixture.board().selectedTask("lead")).toMatchObject({
      kind: "selected",
      task: { id: "task-3", revision: 2 },
    })
    const worker = messagingMemberMessages(session, "worker")
    expect(worker.filter(isSelectionToolError)).toHaveLength(1)
    expect(JSON.stringify(worker)).toContain('\\"kind\\":\\"delegated\\"')
    expect(JSON.stringify(messagingMemberMessages(session, "peer"))).toContain("own task")
    expect(JSON.stringify(messagingMemberMessages(session, "peer"))).toContain("target task")
    expect(JSON.stringify(session.messages)).toContain("free task to lead")
    await fixture.step()
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-2", revision: 3, owner: "worker" },
    })
    expect(session.messages.filter(isSelectionToolError)).toEqual([])
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function messagingInvalid(): Promise<void> {
  const faults = new MessagingFaults()
  const fixture = new TaskSelectionFixture(MESSAGING_INVALID_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    fixture.board().createTask({ subject: "terminal", description: "terminal", blockedBy: [], writeScopes: [] })
    fixture.board().updateTask("lead", { taskId: "task-5", expectedRevision: 1, action: "claim" })
    fixture.board().updateTask("lead", { taskId: "task-5", expectedRevision: 2, action: "complete" })
    const tasks = fixture.board().listTasks({})
    const worker = messagingMemberMessages(session, "worker")
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(10)
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(messagingMemberMessages(session, "worker")).toEqual(worker)
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 2 },
    })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function messagingJournalFailure(): Promise<void> {
  const faults = new MessagingFaults()
  const fixture = new TaskSelectionFixture(MESSAGING_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    await fixture.step()
    const tasks = fixture.board().listTasks({})
    const worker = messagingMemberMessages(session, "worker")
    const history = session.sessionManager.getBranch().filter((entry) => entry.type === "custom")
    faults.failJournal = true
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(1)
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(messagingMemberMessages(session, "worker")).toEqual(worker)
    expect(session.sessionManager.getBranch().filter((entry) => entry.type === "custom")).toEqual(history)
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 2 },
    })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(MESSAGING_LIFECYCLE, messagingLifecycle, SELECTION_TIMEOUT_MS)
  test(MESSAGING_OWNERSHIP, messagingOwnership, SELECTION_TIMEOUT_MS)
  test(MESSAGING_INVALID, messagingInvalid, SELECTION_TIMEOUT_MS)
  test(MESSAGING_JOURNAL_FAILURE, messagingJournalFailure, SELECTION_TIMEOUT_MS)
}

describe(MESSAGING_SUITE, register)
