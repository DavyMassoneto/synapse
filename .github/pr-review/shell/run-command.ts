import { execFileSync } from "node:child_process"
import { NO_TEXT, TEXT_ENCODING } from "#synapse/separators"
import { CommandError } from "../errors"
import { MAX_OUTPUT_BYTES } from "./constants"
import { type CommandRequest } from "./types"

export function runCommand(request: CommandRequest): string {
  try {
    return execFileSync(request.command, request.args, {
      encoding: TEXT_ENCODING,
      input: request.input,
      maxBuffer: MAX_OUTPUT_BYTES,
    })
  } catch (error) {
    if (error instanceof Error) {
      const stdout = "stdout" in error && typeof error.stdout === "string" ? error.stdout : NO_TEXT
      throw new CommandError(error.message, stdout)
    }
    throw error
  }
}
