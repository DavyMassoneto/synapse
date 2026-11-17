import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import {
  MESSAGING_STREAMING,
  QUEUE_FIRST,
  QUEUE_MESSAGE,
  QueueFixture,
  SELECTION_POLL_MS,
  SELECTION_TIMEOUT_MS,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
} from "../fixtures"

async function streamingDelegation(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    const execution = probe.executionId
    team.createTask({ subject: "stream", description: "stream", blockedBy: [], writeScopes: [] })
    expect(team.delegate(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE, "task-2", 9).kind).toBe("refused")
    expect(probe.steersResolved).toBe(0)
    expect(team.delegate(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE, "task-2", 1)).toMatchObject({
      kind: "delegated",
      task: { id: "task-2", revision: 2, owner: WATCHDOG_MEMBER },
    })
    expect(probe.executionId).toBe(execution)
    expect(probe.prompts).toHaveLength(1)
    expect(team.selectedTask(WATCHDOG_MEMBER)).toMatchObject({ kind: "selected", task: { id: "task-2" } })
    expect(team.updateTask(WATCHDOG_LEAD, { taskId: "task-2", expectedRevision: 2, action: "complete" }).kind).toBe(
      "accepted",
    )
    expect(team.overview().agents).toContainEqual(expect.objectContaining({ name: WATCHDOG_MEMBER, status: "running" }))
    sessions.model.finish()
    const deadline = Date.now() + SELECTION_TIMEOUT_MS
    while (sessions.model.streams < 2 && Date.now() < deadline) {
      await setTimeout(SELECTION_POLL_MS)
    }
    expect(sessions.model.streams).toBe(2)
    sessions.model.finish()
    await fixture.waitSettled()
    expect(probe.steersResolved).toBe(1)
    expect(probe.prompts).toHaveLength(1)
    expect(sessions.sessions[0]?.messages).toContainEqual(
      expect.objectContaining({
        role: "user",
        content: [{ type: "text", text: expect.stringContaining(QUEUE_MESSAGE) }],
      }),
    )
    expect(team.getTask("task-2")).toMatchObject({ kind: "accepted", task: { revision: 3, status: "completed" } })
  } finally {
    await fixture.close()
  }
}

test(MESSAGING_STREAMING, streamingDelegation, SELECTION_TIMEOUT_MS)
