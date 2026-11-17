import {
  type MemberRecord,
  type TaskSnapshot,
  TEAM_MODEL_KNOWN,
  type TeamLead,
  type TeamModelUse,
  type TeamOverview,
} from "#synapse/modules/agent-team"

export class TeamTestLead implements TeamLead {
  deliveries: string[] = []

  panels: TeamOverview[] = []

  records: MemberRecord[] = []

  tasks: TaskSnapshot[] = []

  failures: string[] = []

  running = false

  failRecord = false

  deliver(text: string): void {
    this.deliveries.push(text)
  }

  show(overview: TeamOverview): void {
    this.panels.push(overview)
  }

  isRunning(): boolean {
    return this.running
  }

  modelUse(): TeamModelUse {
    return {
      model: { kind: TEAM_MODEL_KNOWN, model: "test" },
      effectiveModel: { kind: TEAM_MODEL_KNOWN, model: "test" },
    }
  }

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    for (const task of tasks) {
      this.recordTask(task)
    }
  }

  recordTask(task: TaskSnapshot): void {
    this.tasks.push(task)
  }

  recordAdmission(record: MemberRecord, task: TaskSnapshot): void {
    this.recordMember(record)
    this.tasks.push(task)
  }

  recordMember(record: MemberRecord): void {
    if (this.failRecord) {
      throw new Error("registro indisponível")
    }
    this.records.push(record)
  }

  reportFailure(name: string, message: string): void {
    this.failures.push(`${name}: ${message}`)
  }
}
