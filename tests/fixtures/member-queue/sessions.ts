import {
  type AgentTeam,
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
} from "#synapse/modules/agent-team"
import { WatchdogSessions } from "../team-watchdog"
import { QueueSessionProbe } from "./probe"

export class QueueSessions implements MemberSessions {
  readonly real: WatchdogSessions

  probe?: QueueSessionProbe

  constructor(directory: string) {
    this.real = new WatchdogSessions(directory)
  }

  async open(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember> {
    const opened = await this.real.open(request, team)
    this.probe = new QueueSessionProbe(opened.session)
    return { ...opened, session: this.probe }
  }

  async reopen(record: MemberRecord): Promise<OpenedMember> {
    const opened = await this.real.reopen(record)
    this.probe = new QueueSessionProbe(opened.session)
    return { ...opened, session: this.probe }
  }
}
