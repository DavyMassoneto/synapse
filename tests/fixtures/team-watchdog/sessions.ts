import { createAgentSession, SessionManager, SettingsManager } from "@earendil-works/pi-coding-agent"
import {
  PiTeamSessionAdapter,
  SupervisedMemberLifetime,
  startCreatedTeamMemberSession,
} from "#synapse/integration/pi/agent-team"
import {
  type AgentTeam,
  createSupervisedShell,
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
} from "#synapse/modules/agent-team"
import { fixtureModel } from "../context"
import {
  WATCHDOG_ACQUISITION_FAILURE,
  WATCHDOG_CONTEXT_WINDOW,
  WATCHDOG_LEAD,
  WATCHDOG_MODEL,
  WATCHDOG_MODEL_REFERENCE,
  WATCHDOG_NO_BUILTIN_TOOLS,
  WATCHDOG_PROVIDER,
  WATCHDOG_SESSION_FILE,
  WATCHDOG_SESSION_ID,
  WATCHDOG_THINKING,
} from "./constants"
import { WatchdogUnconfirmedShell } from "./failed-shell"
import { WatchdogJournal } from "./journal"
import { WatchdogModel } from "./model"
import { prepareWatchdogResources, prepareWatchdogRuntime, prepareWatchdogTools } from "./session-setup"
import { type WatchdogAcquisitionCleanup, type WatchdogAgentSessions, type WatchdogRecords } from "./types"

export class WatchdogSessions implements MemberSessions {
  readonly model = new WatchdogModel()

  readonly journal = new WatchdogJournal()

  readonly sessions: WatchdogAgentSessions = []

  readonly records: WatchdogRecords = []

  failStop = false

  unconfirmedShell?: WatchdogUnconfirmedShell

  private shellCleanupFailed = false

  private readonly directory: string

  private team?: AgentTeam

  constructor(directory: string) {
    this.directory = directory
  }

  async open(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember> {
    this.team = team
    const record: MemberRecord = {
      name: request.name,
      description: request.description,
      leadId: WATCHDOG_LEAD,
      model: WATCHDOG_MODEL_REFERENCE,
      thinking: WATCHDOG_THINKING,
      cwd: this.directory,
      sessionId: WATCHDOG_SESSION_ID,
      sessionFile: WATCHDOG_SESSION_FILE,
    }
    this.records.push(record)
    return this.reopen(record)
  }

  isShellCleanupConfirmed(): boolean {
    return !this.shellCleanupFailed
  }

  async reopen(record: MemberRecord): Promise<OpenedMember> {
    const settings = SettingsManager.inMemory()
    const loader = await prepareWatchdogResources(this.directory, settings)
    const runtime = await prepareWatchdogRuntime()
    const realShell = createSupervisedShell()
    let shell = realShell
    if (this.failStop) {
      this.unconfirmedShell = new WatchdogUnconfirmedShell(realShell)
      shell = this.unconfirmedShell
    }
    const cleanup: WatchdogAcquisitionCleanup = { shell, lifecycleStarting: false }
    try {
      const tools = prepareWatchdogTools(this.directory, shell, record.name, this.team)
      const created = await createAgentSession({
        cwd: this.directory,
        agentDir: this.directory,
        settingsManager: settings,
        resourceLoader: loader,
        modelRuntime: runtime,
        sessionManager: SessionManager.inMemory(this.directory),
        noTools: WATCHDOG_NO_BUILTIN_TOOLS,
        model: fixtureModel(WATCHDOG_PROVIDER, WATCHDOG_MODEL, WATCHDOG_CONTEXT_WINDOW),
        customTools: tools,
      })
      this.sessions.push(created.session)
      cleanup.session = created.session
      created.session.agent.streamFunction = this.model.stream.bind(this.model)
      cleanup.lifecycleStarting = true
      const lifecycle = await startCreatedTeamMemberSession(created.session)
      return {
        record,
        journal: this.journal,
        session: new PiTeamSessionAdapter(created.session, new SupervisedMemberLifetime(lifecycle, shell)),
      }
    } catch (error) {
      if (error instanceof Error) {
        return this.cleanupFailedAcquisition([error], cleanup)
      }
      if (typeof error === "string") {
        return this.cleanupFailedAcquisition([new Error(error)], cleanup)
      }
      return this.cleanupFailedAcquisition([new Error(WATCHDOG_ACQUISITION_FAILURE)], cleanup)
    }
  }

  private async cleanupFailedAcquisition(failures: Error[], cleanup: WatchdogAcquisitionCleanup): Promise<never> {
    if (cleanup.session && !cleanup.lifecycleStarting) {
      try {
        cleanup.session.dispose()
      } catch (cleanupError) {
        if (cleanupError instanceof Error) {
          failures.push(cleanupError)
        } else {
          failures.push(new Error(WATCHDOG_ACQUISITION_FAILURE))
        }
      }
    }
    try {
      await cleanup.shell.close()
    } catch (cleanupError) {
      this.shellCleanupFailed = true
      if (cleanupError instanceof Error) {
        failures.push(cleanupError)
      } else {
        failures.push(new Error(WATCHDOG_ACQUISITION_FAILURE))
      }
    }
    if (failures.length > 1) {
      throw new AggregateError(failures, WATCHDOG_ACQUISITION_FAILURE)
    }
    throw failures[0]
  }
}
