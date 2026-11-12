import { type TeamDirectory } from "#synapse/modules/agent-team/internal"

export class TaskTestDirectory implements TeamDirectory {
  isLead(name: string): boolean {
    return name === "lead"
  }

  hasAgent(name: string): boolean {
    return ["lead", "alice", "bob"].includes(name)
  }
}
