import { runIphoneProvisionCommand } from "#synapse/modules/iphone/adapters/appium-provision"
import * as scenario from "./appium-provision-runner-command-constants"

export function runProvisionFixture(executable: string, signal: AbortSignal): Promise<string> {
  const result = runIphoneProvisionCommand({
    executable,
    arguments: ["path with spaces/index.js"],
    directory: "/private/own-home",
    environment: {},
    signal,
  })
  return result.then(successText, failureText)
}

function successText(): string {
  return scenario.IPHONE_PROVISION_COMMAND_SUCCESS
}

function failureText(error: Error): string {
  return error.message
}
