import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { Value } from "typebox/value"
import { type MemberRecord } from "#synapse/modules/agent-team"
import {
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_SETTLED_EVENT,
  type PiProcess,
  type PiProcessHome,
} from "../pi-process"
import { SCRIPTED_PROVIDER_MODEL_REFERENCE, SCRIPTED_PROVIDER_PROVIDER_URL } from "../scripted-provider"
import {
  HISTORY_MIGRATION_CONFIG_FILE,
  HISTORY_MIGRATION_ENCODING,
  HISTORY_MIGRATION_ENTRYPOINT,
  HISTORY_MIGRATION_LIST_AGENTS,
  HISTORY_MIGRATION_LIST_TASKS,
  HISTORY_MIGRATION_MEMBER_DESCRIPTION,
  HISTORY_MIGRATION_MESSAGE_ENTRY,
  HISTORY_MIGRATION_PROMPT,
  HISTORY_MIGRATION_PROMPT_COMMAND,
  HISTORY_MIGRATION_SEED,
  HISTORY_MIGRATION_SEED_TIMESTAMP_MS,
  HISTORY_MIGRATION_SESSION_MISSING,
  HISTORY_MIGRATION_SETTINGS_FILE,
  HISTORY_MIGRATION_STEPS,
  HISTORY_MIGRATION_TEXT_KIND,
  HISTORY_MIGRATION_THINKING,
  HISTORY_MIGRATION_TOOL_RESULT_ROLE,
  HISTORY_MIGRATION_USER_ROLE,
} from "./constants"
import { HISTORY_MIGRATION_AGENTS_SCHEMA, HISTORY_MIGRATION_TASKS_SCHEMA } from "./schemas"
import { type HistoryMigrationToolResult } from "./types"

export class HistoryMigrationFixture {
  readonly home: PiProcessHome

  readonly process: PiProcess

  readonly storage: SessionManager

  constructor(home: PiProcessHome, process: PiProcess) {
    this.home = home
    this.process = process
    this.storage = SessionManager.create(home.home, home.home)
  }

  initialize(): void {
    this.storage.appendMessage({
      role: HISTORY_MIGRATION_USER_ROLE,
      content: HISTORY_MIGRATION_SEED,
      timestamp: HISTORY_MIGRATION_SEED_TIMESTAMP_MS,
    })
    const path = this.sessionFile(this.storage)
    this.process.configureSession({ path, directory: this.home.home })
    this.home.script(HISTORY_MIGRATION_STEPS)
    writeFileSync(
      join(this.home.agentDirectory, HISTORY_MIGRATION_SETTINGS_FILE),
      JSON.stringify({
        extensions: [fileURLToPath(SCRIPTED_PROVIDER_PROVIDER_URL)],
        enableAnalytics: false,
        enableInstallTelemetry: false,
      }),
    )
    writeFileSync(
      join(this.home.agentDirectory, HISTORY_MIGRATION_CONFIG_FILE),
      JSON.stringify({ excludedMemberExtensions: [] }),
    )
  }

  createMember(name: string): SessionManager {
    const storage = SessionManager.create(this.home.home, this.home.home)
    storage.appendMessage({
      role: HISTORY_MIGRATION_USER_ROLE,
      content: name,
      timestamp: HISTORY_MIGRATION_SEED_TIMESTAMP_MS,
    })
    return storage
  }

  record(name: string, storage: SessionManager): MemberRecord {
    return {
      name,
      leadId: this.storage.getSessionId(),
      cwd: this.home.home,
      description: HISTORY_MIGRATION_MEMBER_DESCRIPTION,
      model: SCRIPTED_PROVIDER_MODEL_REFERENCE,
      thinking: HISTORY_MIGRATION_THINKING,
      sessionId: storage.getSessionId(),
      sessionFile: this.sessionFile(storage),
    }
  }

  sessionFile(storage: SessionManager): string {
    const path = storage.getSessionFile()
    if (path) {
      return path
    }
    throw new Error(HISTORY_MIGRATION_SESSION_MISSING)
  }

  async run(): Promise<void> {
    this.process.start(fileURLToPath(HISTORY_MIGRATION_ENTRYPOINT))
    await this.process.command({ type: HISTORY_MIGRATION_PROMPT_COMMAND, message: HISTORY_MIGRATION_PROMPT })
    await this.process.received.waitFor(PI_PROCESS_SETTLED_EVENT, PI_PROCESS_COMMAND_TIMEOUT_MS)
  }

  private toolResult(toolName: string): HistoryMigrationToolResult {
    const storage = SessionManager.open(this.sessionFile(this.storage), this.home.home)
    const branch = storage.getBranch()
    for (let index = branch.length - 1; index >= 0; index--) {
      const entry = branch[index]
      if (
        entry?.type === HISTORY_MIGRATION_MESSAGE_ENTRY &&
        entry.message.role === HISTORY_MIGRATION_TOOL_RESULT_ROLE &&
        entry.message.toolName === toolName
      ) {
        return entry.message
      }
    }
    throw new Error(toolName)
  }

  private resultText(toolName: string): string {
    const result = this.toolResult(toolName)
    let text = ""
    for (const part of result.content) {
      if (part.type === HISTORY_MIGRATION_TEXT_KIND) {
        text += part.text
      }
    }
    return text
  }

  agents() {
    return Value.Parse(HISTORY_MIGRATION_AGENTS_SCHEMA, JSON.parse(this.resultText(HISTORY_MIGRATION_LIST_AGENTS)))
  }

  tasks() {
    return Value.Parse(HISTORY_MIGRATION_TASKS_SCHEMA, JSON.parse(this.resultText(HISTORY_MIGRATION_LIST_TASKS)))
  }

  bytes(storage: SessionManager): string {
    return readFileSync(this.sessionFile(storage), HISTORY_MIGRATION_ENCODING)
  }
}
