import { COMPUTER_TYPE, COMPUTER_TYPE_INCOMPLETE } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerActionEvidence } from "./types"

export function hasComputerNoDeliveredCharacters(evidence: ComputerActionEvidence): boolean {
  if (evidence.action !== COMPUTER_TYPE || evidence.code !== COMPUTER_TYPE_INCOMPLETE) {
    return false
  }
  return Boolean(evidence.requestedChars) && evidence.deliveredChars === 0
}
