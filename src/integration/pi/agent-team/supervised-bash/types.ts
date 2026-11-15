import {
  type BashOperations,
  type BashToolOptions,
  type SettingsManager,
  type ToolDefinition,
} from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"

export type SupervisedBashOptions = Parameters<BashOperations["exec"]>[2]
export type SupervisedBashResult = Awaited<ReturnType<BashOperations["exec"]>>

export type SupervisedBashTimer = Parameters<typeof clearTimeout>[0]

export interface SupervisedBashMountRequest {
  cwd: string
  settings: SettingsManager
  tools?: ToolDefinition[]
  shell?: SupervisedShellService
}

export type SupervisedBashToolOptions = BashToolOptions

export type SupervisedBashToolList = ToolDefinition[]

export type SupervisedBashFailureReject = (error: Error) => void

export type SupervisedBashNeverResolve = (value: PromiseLike<never>) => void

export type SupervisedBashAbort = () => void
