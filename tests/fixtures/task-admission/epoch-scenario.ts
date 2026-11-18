import { expect } from "vitest"
import { TASK_CLAIM, TASK_COMPLETE } from "#synapse/modules/agent-team"
import { SessionTreeFixture } from "../session-tree"
import {
  ADMISSION_ACCEPTED_KIND,
  ADMISSION_ADMISSION_OPERATION,
  ADMISSION_LEAD_NAME,
  ADMISSION_REENTRANT_TASK,
  ADMISSION_REENTRANT_WORKER,
  ADMISSION_RESTORE_ACTION,
  ADMISSION_TASK_OPERATION,
} from "./constants"
import { AdmissionObservationFaults } from "./observation-faults"
import { type AdmissionObservationFault, type AdmissionObservationOperation } from "./types"

export async function runAdmissionEpochScenario(
  operation: AdmissionObservationOperation,
  fault: AdmissionObservationFault,
): Promise<void> {
  const faults = new AdmissionObservationFaults(fault, ADMISSION_RESTORE_ACTION, false)
  const fixture = new SessionTreeFixture(faults.mount.bind(faults))
  try {
    await fixture.start()
    if (operation === ADMISSION_TASK_OPERATION) {
      faults.arm()
      fixture.board().createTask({
        subject: ADMISSION_REENTRANT_TASK,
        description: ADMISSION_REENTRANT_TASK,
        blockedBy: [],
        writeScopes: [],
      })
    } else {
      const task = fixture.board().createTask({
        subject: ADMISSION_REENTRANT_TASK,
        description: ADMISSION_REENTRANT_TASK,
        blockedBy: [],
        writeScopes: [],
      })
      if (task.kind !== ADMISSION_ACCEPTED_KIND) {
        throw new Error(task.message)
      }
      if (operation === ADMISSION_ADMISSION_OPERATION) {
        faults.arm()
        await fixture.board().start({
          name: ADMISSION_REENTRANT_WORKER,
          description: ADMISSION_REENTRANT_TASK,
          taskId: task.task.id,
          expectedRevision: task.task.revision,
        })
      } else {
        fixture.board().updateTask(ADMISSION_LEAD_NAME, {
          taskId: task.task.id,
          expectedRevision: task.task.revision,
          action: TASK_CLAIM,
        })
        fixture.board().updateTask(ADMISSION_LEAD_NAME, {
          taskId: task.task.id,
          expectedRevision: task.task.revision + 1,
          action: TASK_COMPLETE,
        })
        faults.arm()
        fixture.board().cleanTasks(ADMISSION_LEAD_NAME)
      }
    }
    await faults.waitStopped()
    expect(faults.wasTriggered).toBe(true)
    for (const agent of fixture.board().overview().agents) {
      if (agent.tasks) {
        for (const task of agent.tasks) {
          expect(task.ageMs).toBeUndefined()
          expect(task.updatedAt).toBeUndefined()
        }
      }
    }
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}
