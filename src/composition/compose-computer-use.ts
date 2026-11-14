import { createComputerUseHostDependencies, type PiComputerHost, registerComputerUse } from "#synapse/integration"
import { createComputerUse } from "#synapse/modules"

export function composeComputerUse(pi: PiComputerHost): void {
  registerComputerUse(pi, createComputerUse(createComputerUseHostDependencies()))
}
