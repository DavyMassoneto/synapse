import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { type IphoneAppiumCommandOutput } from "./types"

export async function runIphoneAppiumCommand(
  command: string,
  argumentsValue: string[],
): Promise<IphoneAppiumCommandOutput> {
  const output = await promisify(execFile)(command, argumentsValue)
  return { stdout: String(output.stdout), stderr: String(output.stderr) }
}
