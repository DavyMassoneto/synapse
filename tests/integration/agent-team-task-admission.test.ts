import { describe, expect, test } from "vitest"
import {
  ADMISSION_CLEANUP,
  ADMISSION_CLEANUP_FAILURES,
  ADMISSION_DISCARD_FAILURE,
  ADMISSION_FAILURE,
  ADMISSION_FAILURE_MESSAGE,
  ADMISSION_FAILURES,
  ADMISSION_FAULT_NONE,
  ADMISSION_LIFECYCLE,
  ADMISSION_MEMBER_CLOSE_FAILURE,
  ADMISSION_RACE,
  ADMISSION_RACE_SCRIPT,
  ADMISSION_RACES,
  ADMISSION_RETRY_SCRIPT,
  ADMISSION_SCRIPT,
  ADMISSION_SUITE,
  type AdmissionFault,
  AdmissionFaults,
  admissionEntries,
  admissionSessionFiles,
  isSelectionToolError,
  SELECTION_TIMEOUT_MS,
  selectionRequestContexts,
  TaskSelectionFixture,
} from "../fixtures"

async function admissionLifecycle(): Promise<void> {
  const faults = new AdmissionFaults()
  const fixture = new TaskSelectionFixture(ADMISSION_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(4)
    expect(faults.opened).toBe(1)
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { id: "task-1", revision: 3, owner: "worker", status: "in_progress" },
    })
    expect(fixture.board().selectedTask("lead")).toEqual({ kind: "unselected" })
    const started = session.messages.find(
      (message) => message.role === "toolResult" && message.toolName === "subagent" && !message.isError,
    )
    expect(started).toMatchObject({
      content: [{ type: "text", text: expect.stringContaining('"task":{"id":"task-1","revision":3') }],
    })
    const admissions = admissionEntries(session)
    expect(admissions).toHaveLength(1)
    expect(admissions[0]).toMatchObject({
      record: { name: "worker", leadId: session.sessionId },
      task: { id: "task-1", revision: 3, owner: "worker", description: "Admission A", writeScopes: ["src/a"] },
    })
    expect(selectionRequestContexts(fixture.directory)).toContainEqual({
      selected: expect.stringContaining('"id":"task-1","revision":3'),
      external: true,
    })
    const files = admissionSessionFiles(fixture.agentDirectory, session.sessionId)
    expect(files).toHaveLength(1)
    const tasks = fixture.board().listTasks({})
    await fixture.disableExternal()
    expect(admissionSessionFiles(fixture.agentDirectory, session.sessionId)).toEqual(files)
    expect(admissionEntries(session)).toEqual(admissions)
    expect(fixture.board().listTasks({})).toEqual(tasks)
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(fixture.board().overview().agents).toContainEqual(
      expect.objectContaining({ name: "worker", status: "inactive" }),
    )
    await fixture.step()
    expect(faults.opened).toBe(1)
    expect(admissionEntries(session)).toEqual(admissions)
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function failedAdmission(mode: AdmissionFault): Promise<void> {
  const faults = new AdmissionFaults()
  const fixture = new TaskSelectionFixture(ADMISSION_RETRY_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    faults.mode = mode
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(1)
    if (mode === "close" || mode === "discard") {
      expect(JSON.stringify(session.messages.filter(isSelectionToolError))).toContain(ADMISSION_MEMBER_CLOSE_FAILURE)
      expect(JSON.stringify(session.messages.filter(isSelectionToolError))).toContain(ADMISSION_FAILURE_MESSAGE)
      expect(faults.discardAttempts).toBe(1)
      if (mode === "discard") {
        expect(JSON.stringify(session.messages.filter(isSelectionToolError))).toContain(ADMISSION_DISCARD_FAILURE)
      }
    }
    expect(fixture.board().overview().agents).toHaveLength(1)
    expect(fixture.board().getTask("task-1")).toMatchObject({
      kind: "accepted",
      task: { revision: 1, status: "pending", subject: "A", blockedBy: [], writeScopes: [] },
    })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(admissionEntries(session)).toEqual([])
    expect(selectionRequestContexts(fixture.directory).filter((context) => context.external)).toEqual([])
    expect(admissionSessionFiles(fixture.agentDirectory, session.sessionId)).toEqual([])
    faults.mode = ADMISSION_FAULT_NONE
    await fixture.step()
    expect(fixture.board().selectedTask("worker")).toMatchObject({
      kind: "selected",
      task: { revision: 2, owner: "worker" },
    })
    expect(admissionEntries(session)).toHaveLength(1)
    expect(admissionSessionFiles(fixture.agentDirectory, session.sessionId)).toHaveLength(1)
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

async function racedAdmission(mode: AdmissionFault): Promise<void> {
  const faults = new AdmissionFaults()
  let script = ADMISSION_RETRY_SCRIPT
  if (mode === "blocker") {
    script = ADMISSION_RACE_SCRIPT
  }
  const fixture = new TaskSelectionFixture(script, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    switch (mode) {
      case "revision":
        faults.mode = mode
        break
      case "blocker":
        fixture.board().createTask({ subject: "blocker", description: "blocker", blockedBy: [], writeScopes: [] })
        fixture.board().updateTask("lead", { taskId: "task-2", expectedRevision: 1, action: "claim" })
        fixture.board().updateTask("lead", { taskId: "task-2", expectedRevision: 2, action: "complete" })
        fixture.board().updateTask("lead", {
          taskId: "task-1",
          expectedRevision: 1,
          action: "set_dependencies",
          blockedBy: ["task-2"],
        })
        faults.mode = mode
        break
    }
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(1)
    expect(fixture.board().overview().agents).toHaveLength(1)
    expect(fixture.board().getTask("task-1")).toMatchObject({ kind: "accepted", task: { revision: 2 } })
    expect(fixture.board().selectedTask("worker")).toEqual({ kind: "unselected" })
    expect(admissionEntries(session)).toEqual([])
    expect(selectionRequestContexts(fixture.directory).filter((context) => context.external)).toEqual([])
    expect(faults.opened).toBe(1)
    expect(admissionSessionFiles(fixture.agentDirectory, session.sessionId)).toEqual([])
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(ADMISSION_LIFECYCLE, admissionLifecycle, SELECTION_TIMEOUT_MS)
  test.each(ADMISSION_FAILURES)(`${ADMISSION_FAILURE}: %s`, failedAdmission, SELECTION_TIMEOUT_MS)
  test.each(ADMISSION_CLEANUP_FAILURES)(`${ADMISSION_CLEANUP}: %s`, failedAdmission, SELECTION_TIMEOUT_MS)
  test.each(ADMISSION_RACES)(`${ADMISSION_RACE}: %s`, racedAdmission, SELECTION_TIMEOUT_MS)
}

describe(ADMISSION_SUITE, register)
