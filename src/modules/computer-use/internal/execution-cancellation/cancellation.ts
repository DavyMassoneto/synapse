import { COMPUTER_CANCELLED_MESSAGE } from "./constants"

export class ComputerExecutionCancelled extends Error {
  constructor() {
    super(COMPUTER_CANCELLED_MESSAGE)
  }
}
