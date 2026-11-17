import { createAgentSession, SessionManager, SettingsManager } from "@earendil-works/pi-coding-agent"
import {
  captureShellCleanup,
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
import { WatchdogTrackedShell } from "./tracked-shell"
import {
  type WatchdogAcquisitionCleanup,
  type WatchdogAgentSessions,
  type WatchdogRecords,
  type WatchdogTrackedShells,
} from "./types"

export class WatchdogSessions implements MemberSessions {
  readonly model = new WatchdogModel()

  readonly journal = new WatchdogJournal()

  readonly sessions: WatchdogAgentSessions = []

  readonly records: WatchdogRecords = []

  failStop = false

  unconfirmedShell?: WatchdogUnconfirmedShell

  readonly shells: WatchdogTrackedShells = []

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
    for (const shell of this.shells) {
      if (!shell.confirmed) {
        return false
      }
    }
    return true
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
    const tracked = new WatchdogTrackedShell(shell)
    this.shells.push(tracked)
    shell = tracked
    const cleanup: WatchdogAcquisitionCleanup = { shell: tracked, lifecycleStarting: false }
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
      cleanup.lifecycle = lifecycle
      return {
        record,
        journal: this.journal,
        session: new PiTeamSessionAdapter(created.session, new SupervisedMemberLifetime(lifecycle, shell)),
      }
    } catch (error) {
      const primary = await captureShellCleanup(Promise.reject(error))
      if (primary.failed) {
        return this.cleanupFailedAcquisition([primary.error], cleanup)
      }
      throw new Error(WATCHDOG_ACQUISITION_FAILURE)
    }
  }

  private async cleanupFailedAcquisition(failures: Error[], cleanup: WatchdogAcquisitionCleanup): Promise<never> {
    if (cleanup.lifecycle) {
      const closedLifecycle = await captureShellCleanup(cleanup.lifecycle.close.bind(cleanup.lifecycle))
      if (closedLifecycle.failed) {
        failures.push(closedLifecycle.error)
      }
    } else if (cleanup.session && !cleanup.lifecycleStarting) {
      const disposed = await captureShellCleanup(cleanup.session.dispose.bind(cleanup.session))
      if (disposed.failed) {
        failures.push(disposed.error)
      }
    }
    const closed = await captureShellCleanup(cleanup.shell.close.bind(cleanup.shell))
    if (closed.failed) {
      failures.push(closed.error)
    }
    if (failures.length > 1) {
      throw new AggregateError(failures, WATCHDOG_ACQUISITION_FAILURE)
    }
    throw failures[0]
  }
}
