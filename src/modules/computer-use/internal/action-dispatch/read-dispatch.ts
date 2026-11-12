import {
  COMPUTER_APPS_LISTED,
  COMPUTER_WINDOWS_LISTED,
  type ComputerDriverPort,
  type ComputerExecuteResult,
  type ComputerWaitAction,
  type ComputerWaitPort,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerStickyWindowTarget } from "../window-targeting"
import { computerConfirmedExecution } from "./confirmed-envelope"
import {
  COMPUTER_DISPATCH_APPS_ACTION,
  COMPUTER_DISPATCH_MILLISECONDS_PER_SECOND,
  COMPUTER_DISPATCH_SECONDS_PROPERTY,
  COMPUTER_DISPATCH_WAIT_MAX_SECONDS,
  COMPUTER_DISPATCH_WAIT_MESSAGE,
  COMPUTER_DISPATCH_WAIT_SECONDS,
} from "./constants"
import { computerRequireEnvelope } from "./require-envelope"
import { type ComputerListAction } from "./types"

export async function computerDispatchList(
  driver: ComputerDriverPort,
  action: ComputerListAction,
  target: ComputerStickyWindowTarget,
): Promise<ComputerExecuteResult> {
  const response = await driver.call(action.action, {})
  const envelope = computerRequireEnvelope(response, target)
  if (action.action === COMPUTER_DISPATCH_APPS_ACTION) {
    return { kind: COMPUTER_APPS_LISTED, applications: envelope.applications }
  }
  return { kind: COMPUTER_WINDOWS_LISTED, windows: envelope.windows }
}

export async function computerDispatchWait(
  wait: ComputerWaitPort,
  action: ComputerWaitAction,
): Promise<ComputerExecuteResult> {
  let seconds = COMPUTER_DISPATCH_WAIT_SECONDS
  if (COMPUTER_DISPATCH_SECONDS_PROPERTY in action) {
    seconds = action.seconds
  }
  await wait.wait(
    Math.max(0, Math.min(COMPUTER_DISPATCH_WAIT_MAX_SECONDS, seconds)) * COMPUTER_DISPATCH_MILLISECONDS_PER_SECOND,
  )
  return computerConfirmedExecution(action, COMPUTER_DISPATCH_WAIT_MESSAGE)
}
