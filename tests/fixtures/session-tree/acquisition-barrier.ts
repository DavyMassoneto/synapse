import { vi } from "vitest"
import { PiTeamMemberSessions } from "#synapse/integration/pi/agent-team"
import {
  type AgentTeam,
  type MemberRecord,
  type OpenedMember,
  type OpenMemberRequest,
} from "#synapse/modules/agent-team"
import { TREE_ACQUISITION_AFTER, TREE_ACQUISITION_BEFORE, TREE_OPEN_METHOD, TREE_REOPEN_METHOD } from "./constants"
import { type TreeAcquisitionAction, type TreeAcquisitionPhase, type TreeAcquisitionRequest } from "./types"

export class TreeAcquisitionBarrier {
  private readonly arrived = Promise.withResolvers<void>()

  private readonly released = Promise.withResolvers<void>()

  private readonly open = PiTeamMemberSessions.prototype.open

  private readonly reopen = PiTeamMemberSessions.prototype.reopen

  private readonly phase: TreeAcquisitionPhase

  private pending = true

  readonly entered = this.arrived.promise

  readonly release = this.released.resolve

  constructor(sessions: PiTeamMemberSessions, phase: TreeAcquisitionPhase) {
    this.phase = phase
    vi.spyOn(sessions, TREE_OPEN_METHOD).mockImplementation(
      (this.acquire<OpenMemberRequest>).bind(this, this.open.bind(sessions)),
    )
    vi.spyOn(sessions, TREE_REOPEN_METHOD).mockImplementation(
      (this.acquire<MemberRecord>).bind(this, this.reopen.bind(sessions)),
    )
  }

  private async acquire<T extends TreeAcquisitionRequest>(
    action: TreeAcquisitionAction<T>,
    request: T,
    team: AgentTeam,
  ): Promise<OpenedMember> {
    const held = this.pending
    this.pending = false
    if (held && this.phase === TREE_ACQUISITION_BEFORE) {
      await this.wait()
    }
    const opened = await action(request, team)
    if (held && this.phase === TREE_ACQUISITION_AFTER) {
      await this.wait()
    }
    return opened
  }

  private async wait(): Promise<void> {
    this.arrived.resolve()
    await this.released.promise
  }

  close(): void {
    this.release()
    vi.restoreAllMocks()
  }
}
