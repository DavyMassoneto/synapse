import { expect } from "vitest"
import { type TaskSelectionFixture } from "../task-selection"
import { ADMISSION_FAULT_CLOSE, ADMISSION_FAULT_DISCARD } from "./constants"
import { type AdmissionFaults } from "./faults"
import { type AdmissionFault } from "./types"

export async function closeAdmissionFaultScenario(
  fixture: TaskSelectionFixture,
  faults: AdmissionFaults,
  mode: AdmissionFault,
): Promise<void> {
  if (mode === ADMISSION_FAULT_CLOSE || mode === ADMISSION_FAULT_DISCARD) {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      if (error instanceof Error) {
        expectAdmissionCleanupErrors(error, faults, mode)
      }
    }
  } else {
    await fixture.close()
  }
}

export function expectAdmissionCleanupErrors(error: Error, faults: AdmissionFaults, mode: AdmissionFault): void {
  expect(error).toBeInstanceOf(AggregateError)
  if (error instanceof AggregateError) {
    expect(error.errors).toHaveLength(1)
    const acquisition = error.errors[0]
    expect(acquisition).toBeInstanceOf(AggregateError)
    if (acquisition instanceof AggregateError) {
      expect(acquisition.errors).toHaveLength(1)
      const rollback = acquisition.errors[0]
      expect(rollback).toBeInstanceOf(AggregateError)
      if (rollback instanceof AggregateError) {
        let expectedCount = 1
        if (mode === ADMISSION_FAULT_DISCARD) {
          expectedCount = 2
          expect(rollback.errors[1]).toBe(faults.discardFailure)
        }
        expect(rollback.errors).toHaveLength(expectedCount)
        const member = rollback.errors[0]
        expect(member).toBeInstanceOf(AggregateError)
        if (member instanceof AggregateError) {
          expect(member.errors).toHaveLength(1)
          expect(member.errors[0]).toBe(faults.closeFailure)
        }
      }
    }
  }
}
