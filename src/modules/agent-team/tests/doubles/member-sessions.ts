import {
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
} from "#synapse/modules/agent-team"
import { TeamTestMemberJournal } from "./member-journal"
import { TeamTestSession } from "./member-session"
import { type TeamTestOpenResolve } from "./types"

export class TeamTestSessions implements MemberSessions {
  readonly session = new TeamTestSession()

  readonly journal = new TeamTestMemberJournal()

  fail = false

  held = false

  private resolvers: TeamTestOpenResolve[] = []

  private openedMembers: OpenedMember[] = []

  open(request: OpenMemberRequest): Promise<OpenedMember> {
    if (this.fail) {
      return Promise.reject(new Error("abertura indisponível"))
    }
    const record: MemberRecord = {
      name: request.name,
      description: request.description,
      leadId: "lead",
      model: "model",
      thinking: "low",
      cwd: "cwd",
      sessionId: "id",
      sessionFile: "file",
    }
    const opened = { record, session: this.session, journal: this.journal }
    if (this.held) {
      this.openedMembers.push(opened)
      return new Promise<OpenedMember>(this.capture.bind(this))
    }
    return Promise.resolve(opened)
  }

  reopen(record: MemberRecord): Promise<OpenedMember> {
    if (this.fail) {
      return Promise.reject(new Error("restauração indisponível"))
    }
    return Promise.resolve({ record, session: this.session, journal: this.journal })
  }

  releaseFirst(): void {
    const resolve = this.resolvers.shift()
    const opened = this.openedMembers.shift()
    if (resolve && opened) {
      resolve(opened)
    }
  }

  private capture(resolve: TeamTestOpenResolve): void {
    this.resolvers.push(resolve)
  }
}
