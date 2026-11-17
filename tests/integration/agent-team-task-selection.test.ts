import { describe, expect, test } from "vitest"
import {
  isSelectionToolError,
  observeSelectionCleanup,
  SELECTION_SCENARIO,
  SELECTION_SUITE,
  SELECTION_TIMEOUT_MS,
  selectionRequestContexts,
  TaskSelectionFixture,
} from "../fixtures"

async function selectionLifecycle(): Promise<void> {
  const fixture = new TaskSelectionFixture()
  try {
    const session = await fixture.start()
    await fixture.step()
    expect(fixture.board().selectedTask("lead")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 2, owner: "lead" },
    })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(fixture.errors).toEqual([])
    expect(fixture.board().overview().agents).toContainEqual(
      expect.objectContaining({ name: "worker", state: "finished" }),
    )
    expect(selectionRequestContexts(fixture.directory)).toContainEqual({
      selected: expect.stringContaining("Nenhuma tarefa selecionada"),
      external: true,
    })
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(3)
    await fixture.step()
    expect(fixture.board().selectedTask("lead")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 2 },
    })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    await fixture.step()
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-2", revision: 3 },
    })
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(4)
    expect(fixture.board().selectedTask("lead")).toMatchObject({ kind: "selected", task: { id: "task-4" } })
    expect(fixture.board().getTask("task-1")).toMatchObject({
      kind: "accepted",
      task: { revision: 2, status: "in_progress" },
    })
    const tasks = fixture.board().listTasks({})
    await fixture.disableExternal()
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(fixture.board().selectedTask("lead")).toEqual({ kind: "unselected" })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(fixture.board().overview().agents).toContainEqual(
      expect.objectContaining({ name: "worker", status: "inactive" }),
    )
    await fixture.step()
    expect(selectionRequestContexts(fixture.directory).at(-1)).toMatchObject({
      selected: expect.stringContaining("Nenhuma tarefa selecionada"),
    })
    await fixture.step()
    expect(fixture.board().selectedTask("lead")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 3 },
    })
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-2", revision: 4 },
    })
    await fixture.step()
    expect(selectionRequestContexts(fixture.directory)).toContainEqual({
      selected: expect.stringContaining('"id":"task-1","revision":3'),
      external: false,
    })
    expect(selectionRequestContexts(fixture.directory)).toContainEqual({
      selected: expect.stringContaining('"id":"task-2","revision":4'),
      external: false,
    })
    expect(fixture.errors).toEqual([])
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(6)
    expect(fixture.board().getTask("task-4")).toMatchObject({
      kind: "accepted",
      task: { revision: 4, status: "pending", owner: "lead", blockedBy: ["task-3"] },
    })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(fixture.board().selectedTask("lead")).toEqual({ kind: "unselected" })
    expect(fixture.board().getTask("task-1")).toMatchObject({
      kind: "accepted",
      task: { revision: 4, status: "completed" },
    })
    await fixture.close()
    await observeSelectionCleanup(fixture.directory)
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(SELECTION_SCENARIO, selectionLifecycle, SELECTION_TIMEOUT_MS)
}

describe(SELECTION_SUITE, register)
