import {
  type MemberRecord,
  type TaskSnapshot,
  TEAM_ADMISSION_PERSISTENCE_FAILED,
  TEAM_ADMISSION_RECORDED,
  TEAM_ADMISSION_UNCERTAIN,
  type TeamAdmissionResult,
} from "#synapse/modules/agent-team/public/contracts"
import { type TeamAdmissionAttempt, type TeamAdmissionJournal } from "./types"

export function recordTeamAdmission(
  journal: TeamAdmissionJournal,
  record: MemberRecord,
  task: TaskSnapshot,
  attempt: TeamAdmissionAttempt,
): void {
  const persisted = persistTeamAdmission(journal, record, task)
  attempt.persistence = persisted.kind
  if (persisted.kind !== TEAM_ADMISSION_RECORDED) {
    throw persisted.error
  }
}

function persistTeamAdmission(
  journal: TeamAdmissionJournal,
  record: MemberRecord,
  task: TaskSnapshot,
): TeamAdmissionResult {
  try {
    return journal.recordAdmission(record, task)
  } catch (failure) {
    let error = new Error(TEAM_ADMISSION_PERSISTENCE_FAILED, { cause: failure })
    if (failure instanceof Error) {
      error = failure
    }
    return { kind: TEAM_ADMISSION_UNCERTAIN, error }
  }
}
