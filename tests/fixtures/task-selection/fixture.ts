import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { fileURLToPath } from "node:url"
import { InMemoryCredentialStore } from "@earendil-works/pi-ai"
import {
  type AgentSession,
  createAgentSession,
  DefaultResourceLoader,
  type ExtensionAPI,
  type ExtensionError,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent"
import { vi } from "vitest"
import { type AgentTeamMount, registerAgentTeam } from "#synapse/integration/pi/agent-team"
import {
  type AgentTeam,
  createAgentTeam,
  createSupervisedShell,
  type MemberSessions,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"
import { fixtureModel } from "../context"
import {
  SCRIPTED_PROVIDER_CONTEXT_WINDOW,
  SCRIPTED_PROVIDER_MODEL,
  SCRIPTED_PROVIDER_PROVIDER,
  type ScriptedProviderScript,
} from "../scripted-provider"
import {
  SELECTION_AGENT_DIRECTORY,
  SELECTION_DIRECTORY,
  SELECTION_MEMBER_TIMEOUT,
  SELECTION_NO_TEAM,
  SELECTION_POLL_MS,
  SELECTION_PROJECT_DIRECTORY,
  SELECTION_PROMPT,
  SELECTION_PROVIDER_URL,
  SELECTION_SESSIONS,
  SELECTION_TIMEOUT_MS,
} from "./constants"
import { isSelectionMemberRunning } from "./predicates"
import {
  disableSelectionExternal,
  prepareSelectionDirectories,
  prepareSelectionEnvironment,
  prepareSelectionExtensions,
  prepareSelectionScript,
} from "./preparation"

export class TaskSelectionFixture {
  readonly directory = mkdtempSync(join(tmpdir(), SELECTION_DIRECTORY))
  readonly agentDirectory = join(this.directory, SELECTION_AGENT_DIRECTORY)
  readonly cwd = join(this.directory, SELECTION_PROJECT_DIRECTORY)
  readonly errors: ExtensionError[] = []
  private team?: AgentTeam
  private session?: AgentSession
  private readonly createTeam?: AgentTeamMount

  constructor(script?: ScriptedProviderScript, createTeam?: AgentTeamMount) {
    if (createTeam) {
      this.createTeam = createTeam
    }
    prepareSelectionDirectories(this)
    prepareSelectionExtensions(this)
    prepareSelectionScript(this, script)
    prepareSelectionEnvironment(this)
  }

  register(pi: ExtensionAPI): void {
    registerAgentTeam(pi, this.mount.bind(this), createSupervisedShell)
  }

  private mount(lead: TeamLead, members: MemberSessions, clock: TeamClock): AgentTeam {
    if (this.createTeam) {
      this.team = this.createTeam(lead, members, clock)
    } else {
      this.team = createAgentTeam(lead, members, clock)
    }
    return this.team
  }

  board(): AgentTeam {
    if (this.team) {
      return this.team
    }
    throw new Error(SELECTION_NO_TEAM)
  }

  async start(): Promise<AgentSession> {
    const settings = SettingsManager.create(this.cwd, this.agentDirectory)
    const loader = new DefaultResourceLoader({
      cwd: this.cwd,
      agentDir: this.agentDirectory,
      settingsManager: settings,
      noExtensions: true,
      additionalExtensionPaths: [fileURLToPath(SELECTION_PROVIDER_URL)],
      extensionFactories: [this.register.bind(this)],
      noSkills: true,
      noThemes: true,
      noPromptTemplates: true,
      noContextFiles: true,
    })
    await loader.reload()
    const runtime = await ModelRuntime.create({
      credentials: new InMemoryCredentialStore(),
      modelsPath: null,
      refreshOnCreate: false,
    })
    const created = await createAgentSession({
      cwd: this.cwd,
      agentDir: this.agentDirectory,
      settingsManager: settings,
      resourceLoader: loader,
      modelRuntime: runtime,
      sessionManager: SessionManager.create(this.cwd, join(this.directory, SELECTION_SESSIONS)),
      model: fixtureModel(SCRIPTED_PROVIDER_PROVIDER, SCRIPTED_PROVIDER_MODEL, SCRIPTED_PROVIDER_CONTEXT_WINDOW),
    })
    this.session = created.session
    await created.session.bindExtensions({ onError: this.recordError.bind(this) })
    return created.session
  }

  private recordError(error: ExtensionError): void {
    this.errors.push(error)
  }

  async step(): Promise<void> {
    if (this.session) {
      await this.session.prompt(SELECTION_PROMPT)
      await this.waitMember()
      await this.session.waitForIdle()
    }
  }

  private async waitMember(): Promise<void> {
    const deadline = Date.now() + SELECTION_TIMEOUT_MS
    while (this.board().overview().agents.some(isSelectionMemberRunning)) {
      if (Date.now() >= deadline) {
        throw new Error(SELECTION_MEMBER_TIMEOUT)
      }
      await setTimeout(SELECTION_POLL_MS)
    }
  }

  async disableExternal(): Promise<void> {
    disableSelectionExternal(this)
    if (this.session) {
      await this.session.reload()
    }
  }

  async close(): Promise<void> {
    try {
      if (this.team) {
        await this.team.suspend()
      }
    } finally {
      this.session?.dispose()
      vi.unstubAllEnvs()
      rmSync(this.directory, { recursive: true, force: true })
    }
  }
}
