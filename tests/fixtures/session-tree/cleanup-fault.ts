import fs from "node:fs"
import { syncBuiltinESMExports } from "node:module"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { vi } from "vitest"
import { type AgentTeam } from "#synapse/modules/agent-team"
import {
  TREE_CLOSE_DISPOSE_ERROR,
  TREE_CLOSE_REMOVE_ERROR,
  TREE_CLOSE_SUSPEND_ERROR,
  TREE_EXPLICIT_THROW,
  TREE_REMOVE_METHOD,
} from "./constants"
import { type TreeCleanupThrow, type TreeCleanupThrowOption } from "./types"

export class TreeCleanupFault {
  readonly suspendError = new Error(TREE_CLOSE_SUSPEND_ERROR)

  readonly disposeError = new Error(TREE_CLOSE_DISPOSE_ERROR)

  readonly removeError = new Error(TREE_CLOSE_REMOVE_ERROR)

  private readonly suspendTeam: AgentTeam["suspend"]

  private readonly disposeSession: AgentSession["dispose"]

  private readonly remove = fs.rmSync

  private readonly directory: string

  private readonly disposeFails: boolean

  private readonly removeFails: boolean

  private readonly failure: TreeCleanupThrow

  disposeAttempted = false

  constructor(
    team: AgentTeam,
    session: AgentSession,
    directory: string,
    disposeFails: boolean,
    removeFails: boolean,
    option: TreeCleanupThrowOption,
  ) {
    this.failure = this.suspendError
    if (option.kind === TREE_EXPLICIT_THROW) {
      this.failure = option.value
    }
    this.suspendTeam = team.suspend.bind(team)
    this.disposeSession = session.dispose.bind(session)
    this.directory = directory
    this.disposeFails = disposeFails
    this.removeFails = removeFails
    team.suspend = this.suspend.bind(this)
    session.dispose = this.dispose.bind(this)
    vi.spyOn(fs, TREE_REMOVE_METHOD).mockImplementation(this.removeDirectory.bind(this))
    syncBuiltinESMExports()
  }

  private async suspend(): Promise<void> {
    await this.suspendTeam()
    throw this.failure
  }

  private dispose(): void {
    this.disposeAttempted = true
    this.disposeSession()
    if (this.disposeFails) {
      throw this.disposeError
    }
  }

  private removeDirectory(...args: Parameters<typeof fs.rmSync>): void {
    this.remove(...args)
    if (this.removeFails && String(args[0]) === this.directory) {
      throw this.removeError
    }
  }

  close(): void {
    this.disposeSession()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    syncBuiltinESMExports()
    this.remove(this.directory, { recursive: true, force: true })
  }
}
