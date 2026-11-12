import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { type ComputerCommandOptions, type ComputerCommandOutput } from "./types"

export async function computerRunCommand(
  command: string,
  argumentsValue: string[],
  options: ComputerCommandOptions,
): Promise<ComputerCommandOutput> {
  const output = await promisify(execFile)(command, argumentsValue, options)
  return { stdout: String(output.stdout), stderr: String(output.stderr) }
}
