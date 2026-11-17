import { describe, expect, test } from "vitest"
import {
  ADMISSION_REFUSALS,
  ADMISSION_SUITE,
  AdmissionFaults,
  type AdmissionRefusalScenario,
  admissionEntries,
  admissionRefusalScript,
  admissionSessionFiles,
  isSelectionToolError,
  SELECTION_TIMEOUT_MS,
  selectionRequestContexts,
  TaskSelectionFixture,
} from "../fixtures"

async function refusedAdmission(scenario: AdmissionRefusalScenario): Promise<void> {
  const faults = new AdmissionFaults()
  const fixture = new TaskSelectionFixture(admissionRefusalScript(scenario), faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(1)
    expect(faults.opened).toBe(0)
    expect(fixture.board().overview().agents).toHaveLength(1)
    expect(fixture.board().getTask("task-1")).toMatchObject({
      kind: "accepted",
      task: { revision: 1, status: "pending" },
    })
    expect(fixture.board().getTask("task-2")).toMatchObject({
      kind: "accepted",
      task: { revision: 1, status: "pending", blockedBy: ["task-1"] },
    })
    expect(admissionEntries(session)).toEqual([])
    expect(admissionSessionFiles(fixture.agentDirectory, session.sessionId)).toEqual([])
    expect(selectionRequestContexts(fixture.directory).filter((context) => context.external)).toEqual([])
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test.each(ADMISSION_REFUSALS)("$name", refusedAdmission, SELECTION_TIMEOUT_MS)
}

describe(ADMISSION_SUITE, register)
