import { COMPUTER_RESPONSE_EFFECT_REFUSED } from "./constants"
import { type ComputerRawState } from "./types"

export function isComputerStateRefused(state: ComputerRawState): boolean {
  return state.effect === COMPUTER_RESPONSE_EFFECT_REFUSED || Boolean(state.refusal)
}
