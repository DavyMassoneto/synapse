import { existsSync, readFileSync } from "node:fs"
import { expect, test } from "vitest"
import { readTeamHistory } from "#synapse/integration/pi/agent-team"
import { TASK_UNSELECTED, TEAM_STARTED } from "#synapse/modules/agent-team"
import {
  ADMISSION_ACCEPTED_KIND,
  ADMISSION_CALLBACK_FAULT,
  ADMISSION_CLOCK_FAULT,
  ADMISSION_MONOTONIC_FAULT,
  ADMISSION_NO_ACTION,
  ADMISSION_OBSERVATION_SCENARIO,
  ADMISSION_PORT_THROW_FAULT,
  ADMISSION_REENTRANT_TASK,
  ADMISSION_REENTRANT_WORKER,
  ADMISSION_SESSION_ENCODING,
  ADMISSION_SUSPEND_ACTION,
  type AdmissionObservationAction,
  type AdmissionObservationFault,
  AdmissionObservationFaults,
  SELECTION_TIMEOUT_MS,
  SessionTreeFixture,
} from "../fixtures"

async function preservesRecordedAdmission(
  fault: AdmissionObservationFault,
  action: AdmissionObservationAction,
): Promise<void> {
  const faults = new AdmissionObservationFaults(fault, action, false)
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
    const result = await fixture.board().start({
      name: ADMISSION_REENTRANT_WORKER,
      description: ADMISSION_REENTRANT_TASK,
      taskId: task.task.id,
      expectedRevision: task.task.revision,
    })
    expect(result.kind).not.toBe(TEAM_STARTED)
    await faults.waitStopped()
    const history = readTeamHistory(session.sessionManager, session.sessionId)
    expect(history.members).toHaveLength(1)
    for (const record of history.members) {
      expect(existsSync(record.sessionFile)).toBe(true)
      const bytes = readFileSync(record.sessionFile, ADMISSION_SESSION_ENCODING)
      await fixture.board().restore(history.members, history.tasks)
      expect(readFileSync(record.sessionFile, ADMISSION_SESSION_ENCODING)).toBe(bytes)
    }
    expect(fixture.board().selectedTask(ADMISSION_REENTRANT_WORKER)).toEqual({ kind: TASK_UNSELECTED })
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(
    `${ADMISSION_OBSERVATION_SCENARIO}/clock`,
    preservesRecordedAdmission.bind(null, ADMISSION_CLOCK_FAULT, ADMISSION_NO_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_OBSERVATION_SCENARIO}/monotonic`,
    preservesRecordedAdmission.bind(null, ADMISSION_MONOTONIC_FAULT, ADMISSION_NO_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_OBSERVATION_SCENARIO}/port`,
    preservesRecordedAdmission.bind(null, ADMISSION_PORT_THROW_FAULT, ADMISSION_NO_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_OBSERVATION_SCENARIO}/suspend-throw`,
    preservesRecordedAdmission.bind(null, ADMISSION_PORT_THROW_FAULT, ADMISSION_SUSPEND_ACTION),
    SELECTION_TIMEOUT_MS,
  )
  test(
    `${ADMISSION_OBSERVATION_SCENARIO}/suspend`,
    preservesRecordedAdmission.bind(null, ADMISSION_CALLBACK_FAULT, ADMISSION_SUSPEND_ACTION),
    SELECTION_TIMEOUT_MS,
  )
}

register()
