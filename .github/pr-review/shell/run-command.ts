import { execFileSync } from "node:child_process"
import { CommandError } from "../errors"
import { COMMAND_ENCODING, MAX_OUTPUT_BYTES } from "./constants"
import { type CommandRequest } from "./types"

export function runCommand(request: CommandRequest): string {
  try {
    return execFileSync(request.command, request.args, {
      encoding: COMMAND_ENCODING,
      input: request.input,
      maxBuffer: MAX_OUTPUT_BYTES,
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new CommandError(error.message)
    }
    throw error
  }
}
