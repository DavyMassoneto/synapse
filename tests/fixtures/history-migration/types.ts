import { type ToolResultMessage } from "@earendil-works/pi-ai"
import { type SessionManager } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type MemberRecord } from "#synapse/modules/agent-team"
import { type PiProcess, type PiProcessHome } from "../pi-process"
import { type HISTORY_MIGRATION_AGENTS_SCHEMA, type HISTORY_MIGRATION_TASKS_SCHEMA } from "./schemas"

export type HistoryMigrationToolResult = ToolResultMessage

export interface HistoryMigrationContext {
  readonly home: PiProcessHome
  readonly process: PiProcess
  readonly storage: SessionManager
  createMember(name: string): SessionManager
  record(name: string, storage: SessionManager): MemberRecord
  sessionFile(storage: SessionManager): string
  run(): Promise<void>
  agents(): Static<typeof HISTORY_MIGRATION_AGENTS_SCHEMA>
  tasks(): Static<typeof HISTORY_MIGRATION_TASKS_SCHEMA>
  bytes(storage: SessionManager): string
}

export type HistoryMigrationScenario = (fixture: HistoryMigrationContext) => Promise<void>
