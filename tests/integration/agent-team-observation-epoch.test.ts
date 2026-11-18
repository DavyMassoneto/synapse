import { test } from "vitest"
import {
  ADMISSION_ADMISSION_OPERATION,
  ADMISSION_CALLBACK_FAULT,
  ADMISSION_CLEANUP_OPERATION,
  ADMISSION_CLOCK_FAULT,
  ADMISSION_EPOCH_SCENARIO,
  ADMISSION_MONOTONIC_FAULT,
  ADMISSION_TASK_OPERATION,
  type AdmissionObservationFault,
  type AdmissionObservationOperation,
  runAdmissionEpochScenario,
  SELECTION_TIMEOUT_MS,
} from "../fixtures"

function registerOperation(operation: AdmissionObservationOperation): void {
  registerFault(operation, ADMISSION_CALLBACK_FAULT)
  registerFault(operation, ADMISSION_CLOCK_FAULT)
  registerFault(operation, ADMISSION_MONOTONIC_FAULT)
}

function registerFault(operation: AdmissionObservationOperation, fault: AdmissionObservationFault): void {
  test(
    `${ADMISSION_EPOCH_SCENARIO}/${operation}/${fault}`,
    runAdmissionEpochScenario.bind(null, operation, fault),
    SELECTION_TIMEOUT_MS,
  )
}

registerOperation(ADMISSION_ADMISSION_OPERATION)
registerOperation(ADMISSION_TASK_OPERATION)
registerOperation(ADMISSION_CLEANUP_OPERATION)
