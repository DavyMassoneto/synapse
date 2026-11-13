import { COMPUTER_DARWIN } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_COMMAND_TIMEOUT_MILLISECONDS, type ComputerCommandRunner } from "../command-execution"
import {
  COMPUTER_APP_MACOS_ONLY,
  COMPUTER_APP_REGISTERED,
  COMPUTER_APP_REGISTRATION_COMMAND,
  COMPUTER_APP_REGISTRATION_FAILED,
  COMPUTER_APP_REGISTRATION_FLAG,
  COMPUTER_APP_REGISTRATION_REFUSED,
  COMPUTER_APP_SIGNATURE_COMMAND,
  COMPUTER_APP_SIGNATURE_REJECTED,
  COMPUTER_APP_SIGNATURE_VERBOSE_FLAG,
} from "./constants"
import { hasComputerExpectedSignature } from "./predicates"
import {
  type ComputerAppCommandOutcome,
  type ComputerAppRegistrationRequest,
  type ComputerAppRegistrationResult,
} from "./types"

export async function computerRegisterMacosApp(
  request: ComputerAppRegistrationRequest,
): Promise<ComputerAppRegistrationResult> {
  if (request.platform !== COMPUTER_DARWIN) {
    return { kind: COMPUTER_APP_REGISTRATION_REFUSED, message: COMPUTER_APP_MACOS_ONLY }
  }
  const signature = await runAppCommand(request.executor, COMPUTER_APP_SIGNATURE_COMMAND, [
    COMPUTER_APP_SIGNATURE_VERBOSE_FLAG,
    request.appDirectory,
  ])
  if (!signature.succeeded || !hasComputerExpectedSignature(signature.output)) {
    return { kind: COMPUTER_APP_REGISTRATION_REFUSED, message: COMPUTER_APP_SIGNATURE_REJECTED }
  }
  const registration = await runAppCommand(request.executor, COMPUTER_APP_REGISTRATION_COMMAND, [
    COMPUTER_APP_REGISTRATION_FLAG,
    request.appDirectory,
  ])
  if (!registration.succeeded) {
    return { kind: COMPUTER_APP_REGISTRATION_REFUSED, message: COMPUTER_APP_REGISTRATION_FAILED }
  }
  return { kind: COMPUTER_APP_REGISTERED }
}

async function runAppCommand(
  executor: ComputerCommandRunner,
  command: string,
  argumentsValue: string[],
): Promise<ComputerAppCommandOutcome> {
  try {
    const output = await executor(command, argumentsValue, { timeout: COMPUTER_COMMAND_TIMEOUT_MILLISECONDS })
    return { succeeded: true, output: `${output.stdout}${output.stderr}` }
  } catch (error) {
    if (error instanceof Error) {
      return { succeeded: false, output: error.message }
    }
    throw error
  }
}
