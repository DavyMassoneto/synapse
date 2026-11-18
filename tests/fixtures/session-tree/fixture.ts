import { join } from "node:path"
import {
  type AgentSession,
  type ExtensionAPI,
  type SessionBeforeTreeEvent,
  type SessionManager,
} from "@earendil-works/pi-coding-agent"
import { type AgentTeamMount, PiTeamMemberSessions, readTeamHistory } from "#synapse/integration/pi/agent-team"
import {
  type AgentTeam,
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"
import { TaskSelectionFixture } from "../task-selection"
import { TreeAcquisitionBarrier } from "./acquisition-barrier"
import {
  TREE_ACCEPTED,
  TREE_ACQUISITION_FAILURE,
  TREE_BEFORE_EVENT,
  TREE_DESCRIPTION,
  TREE_MEMBER_PROMPT,
  TREE_NO_RECORD,
  TREE_PID_SUFFIX,
  TREE_QUIT_REASON,
  TREE_SESSION_SHUTDOWN_EVENT,
  TREE_STARTED_OUTCOME,
} from "./constants"
import { TreeMemberCloseBarrier } from "./member-close-barrier"
import { observeTreePid } from "./pid-observation"
import { prepareTreeEnvironment, prepareTreeScript, prepareTreeSettings } from "./preparation"
import { type TreeAcquisitionPhase } from "./types"

export class SessionTreeFixture extends TaskSelectionFixture {
  cancelled = false

  closeBarrier?: TreeMemberCloseBarrier

  memberSessions?: MemberSessions

  private barrierPending = false

  private shutdownOnShow = false

  private showLead?: TeamLead["show"]

  private shutdown?: Promise<void>

  private sessionRunner?: AgentSession["extensionRunner"]

  constructor(createTeam?: AgentTeamMount) {
    super(undefined, createTeam)
    try {
      prepareTreeEnvironment(this)
      prepareTreeSettings(this)
      prepareTreeScript(this)
    } catch (error) {
      try {
        this.releaseDirectory()
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], TREE_ACQUISITION_FAILURE)
      }
      throw error
    }
  }

  override register(pi: ExtensionAPI): void {
    super.register(pi)
    pi.on(TREE_BEFORE_EVENT, this.beforeTree.bind(this))
  }

  protected override mount(lead: TeamLead, members: MemberSessions, clock: TeamClock): AgentTeam {
    this.memberSessions = members
    this.showLead = lead.show.bind(lead)
    lead.show = this.show.bind(this)
    return super.mount(
      lead,
      {
        open: this.openMember.bind(this),
        reopen: this.reopenMember.bind(this),
        discardPrepared: members.discardPrepared.bind(members),
      },
      clock,
    )
  }

  private async openMember(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember> {
    if (!this.memberSessions) {
      throw new Error(TREE_NO_RECORD)
    }
    const opened = await this.memberSessions.open(request, team)
    if (this.barrierPending) {
      this.barrierPending = false
      this.closeBarrier = new TreeMemberCloseBarrier(opened.session)
    }
    return opened
  }

  private async reopenMember(record: MemberRecord, team: AgentTeam): Promise<OpenedMember> {
    if (!this.memberSessions) {
      throw new Error(TREE_NO_RECORD)
    }
    return this.memberSessions.reopen(record, team)
  }

  private show(overview: Parameters<TeamLead["show"]>[0]): void {
    this.showLead?.(overview)
    if (this.shutdownOnShow && this.sessionRunner) {
      this.shutdownOnShow = false
      this.shutdown = this.sessionRunner.emit({ type: TREE_SESSION_SHUTDOWN_EVENT, reason: TREE_QUIT_REASON })
    }
  }

  gateAcquisition(phase: TreeAcquisitionPhase): TreeAcquisitionBarrier {
    if (this.memberSessions instanceof PiTeamMemberSessions) {
      return new TreeAcquisitionBarrier(this.memberSessions, phase)
    }
    throw new Error(TREE_NO_RECORD)
  }

  blockNextMemberClose(): void {
    this.barrierPending = true
  }

  shutdownDuringShow(session: AgentSession): void {
    this.sessionRunner = session.extensionRunner
    this.shutdownOnShow = true
  }

  async waitShutdown(): Promise<void> {
    await this.shutdown
  }

  private beforeTree(_event: SessionBeforeTreeEvent) {
    return { cancel: this.cancelled }
  }

  async startMember(name: string): Promise<number> {
    const task = this.board().createTask({
      subject: name,
      description: TREE_MEMBER_PROMPT,
      blockedBy: [],
      writeScopes: [],
    })
    if (task.kind !== TREE_ACCEPTED) {
      throw new Error(JSON.stringify(task))
    }
    const outcome = await this.board().start({
      name,
      description: TREE_DESCRIPTION,
      taskId: task.task.id,
      expectedRevision: task.task.revision,
    })
    if (outcome.kind !== TREE_STARTED_OUTCOME) {
      throw new Error(JSON.stringify(outcome))
    }
    return observeTreePid(join(this.cwd, name + TREE_PID_SUFFIX))
  }

  memberRecord(name: string, sessionManager: SessionManager): MemberRecord {
    for (const record of readTeamHistory(sessionManager, sessionManager.getSessionId()).members) {
      if (record.name === name) {
        return record
      }
    }
    throw new Error(TREE_NO_RECORD)
  }
}
