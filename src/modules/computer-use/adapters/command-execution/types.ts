import { type ExecFileOptions } from "node:child_process"

export type ComputerCommandOptions = ExecFileOptions

export interface ComputerCommandOutput {
  stdout: string
  stderr: string
}

export type ComputerCommandRunner = (
  command: string,
  argumentsValue: string[],
  options: ComputerCommandOptions,
) => Promise<ComputerCommandOutput>
