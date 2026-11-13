import { ComputerUseService } from "#synapse/modules/computer-use/internal/computer-session"
import { ComputerSystemInfrastructure } from "../adapters"
import { type ComputerUse, type ComputerUseDependencies } from "./contracts"

export function createComputerUse(dependencies: ComputerUseDependencies): ComputerUse {
  return new ComputerUseService(dependencies, new ComputerSystemInfrastructure(dependencies))
}
