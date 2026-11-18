import { existsSync } from "node:fs"
import { expect, test } from "vitest"
import { readTeamHistory } from "#synapse/integration/pi/agent-team"
import {
  ADMISSION_ACCEPTED_KIND,
  ADMISSION_CLOCK_FAULT,
  ADMISSION_NO_ACTION,
  ADMISSION_OBSERVATION_SCENARIO,
  ADMISSION_REENTRANT_TASK,
  ADMISSION_REENTRANT_WORKER,
  AdmissionObservationFaults,
  SELECTION_TIMEOUT_MS,
  SessionTreeFixture,
} from "../fixtures"

async function preservesErrorsAndStorage(): Promise<void> {
  const faults = new AdmissionObservationFaults(ADMISSION_CLOCK_FAULT, ADMISSION_NO_ACTION, true)
  const fixture = new SessionTreeFixture(faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    const task = fixture.board().createTask({
      subject: ADMISSION_REENTRANT_TASK,
      description: ADMISSION_REENTRANT_TASK,
      blockedBy: [],
      writeScopes: [],
    })
    if (task.kind !== ADMISSION_ACCEPTED_KIND) {
      throw new Error(task.message)
    }
    faults.arm()
    const outcome = await fixture.board().start({
      name: ADMISSION_REENTRANT_WORKER,
      description: ADMISSION_REENTRANT_TASK,
      taskId: task.task.id,
      expectedRevision: task.task.revision,
    })
    expect(JSON.stringify(outcome)).toContain(faults.failure.message)
    expect(JSON.stringify(outcome)).toContain(faults.closeFailure.message)
    const history = readTeamHistory(session.sessionManager, session.sessionId)
    expect(history.members).toHaveLength(1)
    for (const record of history.members) {
      expect(existsSync(record.sessionFile)).toBe(true)
    }
  } finally {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      if (error instanceof AggregateError) {
        const acquisition = error.errors[0]
        expect(acquisition).toBeInstanceOf(AggregateError)
        if (acquisition instanceof AggregateError) {
          const member = acquisition.errors[0]
          expect(member).toBeInstanceOf(AggregateError)
          if (member instanceof AggregateError) {
            expect(member.errors[0]).toBe(faults.closeFailure)
          }
        }
      }
    }
  }
}

test(ADMISSION_OBSERVATION_SCENARIO, preservesErrorsAndStorage, SELECTION_TIMEOUT_MS)
