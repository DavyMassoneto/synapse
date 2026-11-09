import { type ModelCaller } from "../client"
import { type ChangedFile } from "../diff"
import { type ReviewResult } from "../review"
import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"

export interface Ports {
  runner: CommandRunner
  caller: ModelCaller
}

export interface Collected {
  files: ChangedFile[]
  result: ReviewResult
}

export interface Execution {
  settings: Settings
  ports: Ports
}
