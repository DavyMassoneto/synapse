import {
  createComputerUseHostDependencies,
  type PiComputerHost,
  registerComputerUse,
} from "#synapse/integration/pi/computer-use"
import { createComputerUse } from "#synapse/modules/computer-use"

export function composeComputerUse(pi: PiComputerHost): void {
  registerComputerUse(pi, createComputerUse(createComputerUseHostDependencies()))
}
