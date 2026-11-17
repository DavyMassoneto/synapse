import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createPiTeamLeadSession, piTeamClock } from "#synapse/integration/pi/agent-team"
import { type AgentTeam, createAgentTeam, type MemberCheckpoint } from "#synapse/modules/agent-team"
import { TeamLeadHost } from "../agent-team"
import { WATCHDOG_DESCRIPTION, WATCHDOG_MEMBER, WatchdogClock, waitForWatchdogCondition } from "../team-watchdog"
import { QueueBarrier } from "./barrier"
import { QUEUE_DIRECTORY, QUEUE_INACTIVE, QUEUE_PROBE_MISSING, QUEUE_STARTED } from "./constants"
import { QueueHandledInput } from "./handled-input"
import { QueueSessions } from "./sessions"
import { type QueueBarrierEvent } from "./types"

export class QueueFixture {
  readonly clock = new WatchdogClock()

  readonly host = new TeamLeadHost()

  readonly handledInput = new QueueHandledInput()

  barrier?: QueueBarrier

  private team?: AgentTeam

  private sessions?: QueueSessions

  private directory = ""

  async open(checkpoint: MemberCheckpoint, prompt: string, handleInput: boolean, barrierEvent?: QueueBarrierEvent) {
    this.directory = await mkdtemp(join(tmpdir(), QUEUE_DIRECTORY))
    this.sessions = new QueueSessions(this.directory)
    if (handleInput) {
      this.sessions.real.extensions.push(this.handledInput.register.bind(this.handledInput))
    }
    if (barrierEvent) {
      this.barrier = new QueueBarrier(barrierEvent)
      this.sessions.real.extensions.push(this.barrier.register.bind(this.barrier))
    }
    this.sessions.real.journal.save(checkpoint)
    const lead = createPiTeamLeadSession(this.host)
    this.team = createAgentTeam(lead, this.sessions, piTeamClock, this.clock)
    const started = await this.team.start({ name: WATCHDOG_MEMBER, description: WATCHDOG_DESCRIPTION, task: prompt })
    if (started.kind !== QUEUE_STARTED) {
      throw new Error(started.message)
    }
    if (!this.sessions.probe) {
      throw new Error(QUEUE_PROBE_MISSING)
    }
    return { team: this.team, probe: this.sessions.probe, sessions: this.sessions.real }
  }

  async waitStreaming(): Promise<void> {
    await waitForWatchdogCondition(this.isStreaming.bind(this))
  }

  async waitSettled(): Promise<void> {
    await waitForWatchdogCondition(this.isSettled.bind(this))
  }

  isStreaming(): boolean {
    return this.sessions?.probe?.isStreaming() === true && this.sessions.real.model.streams > 0
  }

  isSettled(): boolean {
    const rows = this.team?.overview().agents
    return rows?.some((row) => row.name === WATCHDOG_MEMBER && row.status === QUEUE_INACTIVE) === true
  }

  async close(): Promise<void> {
    try {
      this.barrier?.release()
      await this.team?.suspend()
    } finally {
      await rm(this.directory, { recursive: true, force: true })
    }
  }
}
