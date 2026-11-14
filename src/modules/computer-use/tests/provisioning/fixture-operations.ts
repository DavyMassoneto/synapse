import {
  COMPUTER_PROVISION_ESCAPED_QUOTE,
  COMPUTER_PROVISION_QUOTE,
  COMPUTER_PROVISION_RESPONSE_INTERRUPTED,
} from "./constants"

export function computerQuoteProvisioningArgument(argument: string): string {
  const escaped = argument.replaceAll(COMPUTER_PROVISION_QUOTE, COMPUTER_PROVISION_ESCAPED_QUOTE)
  return `${COMPUTER_PROVISION_QUOTE}${escaped}${COMPUTER_PROVISION_QUOTE}`
}

export function computerInterruptProvisioningResponse(controller: ReadableStreamDefaultController<Uint8Array>): void {
  controller.enqueue(new Uint8Array([1, 2, 3]))
  controller.error(new Error(COMPUTER_PROVISION_RESPONSE_INTERRUPTED))
}
