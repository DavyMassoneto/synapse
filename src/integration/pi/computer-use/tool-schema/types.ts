import { type Static } from "typebox"
import { type PI_COMPUTER_PARAMETERS } from "./schemas"

export type PiComputerInput = Static<typeof PI_COMPUTER_PARAMETERS>
