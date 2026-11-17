import { InMemoryCredentialStore } from "@earendil-works/pi-ai"
import {
  createAgentSession,
  createBashToolDefinition,
  DefaultResourceLoader,
  defineTool,
  ModelRuntime,
  SessionManager,
  SettingsManager,
  type ToolDefinition,
} from "@earendil-works/pi-coding-agent"
import {
  memberTools,
  PiTeamSessionAdapter,
  SupervisedMemberLifetime,
  startCreatedTeamMemberSession,
} from "#synapse/integration/pi/agent-team"
import { SupervisedBashOperations } from "#synapse/integration/pi/agent-team/supervised-bash"
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
  WATCHDOG_API_KEY,
  WATCHDOG_CONTEXT_WINDOW,
  WATCHDOG_LEAD,
  WATCHDOG_MODEL,
  WATCHDOG_MODEL_REFERENCE,
  WATCHDOG_PROVIDER,
  WATCHDOG_SESSION_FILE,
  WATCHDOG_SESSION_ID,
  WATCHDOG_THINKING,
} from "./constants"
import { WatchdogUnconfirmedShell } from "./failed-shell"
import { WatchdogJournal } from "./journal"
import { WatchdogModel } from "./model"
import { type WatchdogAgentSessions, type WatchdogRecords } from "./types"

export class WatchdogSessions implements MemberSessions {
  readonly model = new WatchdogModel()
  readonly journal = new WatchdogJournal()
  readonly sessions: WatchdogAgentSessions = []
  readonly records: WatchdogRecords = []
  failStop = false
  unconfirmedShell?: WatchdogUnconfirmedShell
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

  async reopen(record: MemberRecord): Promise<OpenedMember> {
    const settings = SettingsManager.inMemory()
    const loader = new DefaultResourceLoader({
      cwd: this.directory,
      agentDir: this.directory,
      settingsManager: settings,
      noExtensions: true,
      noSkills: true,
      noPromptTemplates: true,
      noThemes: true,
      noContextFiles: true,
    })
    await loader.reload()
    const runtime = await ModelRuntime.create({
      credentials: new InMemoryCredentialStore(),
      modelsPath: null,
      refreshOnCreate: false,
    })
    await runtime.setRuntimeApiKey(WATCHDOG_PROVIDER, WATCHDOG_API_KEY)
    const realShell = createSupervisedShell()
    let shell = realShell
    if (this.failStop) {
      this.unconfirmedShell = new WatchdogUnconfirmedShell(realShell)
      shell = this.unconfirmedShell
    }
    try {
      const tool = defineTool(
        createBashToolDefinition(this.directory, { operations: new SupervisedBashOperations(shell) }),
      )
      const tools: ToolDefinition[] = [tool]
      if (this.team) {
        tools.push(...memberTools(this.team, record.name))
      }
      const created = await createAgentSession({
        cwd: this.directory,
        agentDir: this.directory,
        settingsManager: settings,
        resourceLoader: loader,
        modelRuntime: runtime,
        sessionManager: SessionManager.inMemory(this.directory),
        noTools: "builtin",
        model: fixtureModel(WATCHDOG_PROVIDER, WATCHDOG_MODEL, WATCHDOG_CONTEXT_WINDOW),
        customTools: tools,
      })
      this.sessions.push(created.session)
      created.session.agent.streamFunction = this.model.stream.bind(this.model)
      const lifecycle = await startCreatedTeamMemberSession(created.session)
      return {
        record,
        journal: this.journal,
        session: new PiTeamSessionAdapter(created.session, new SupervisedMemberLifetime(lifecycle, shell)),
      }
    } catch (error) {
      await shell.close()
      throw error
    }
  }
}
