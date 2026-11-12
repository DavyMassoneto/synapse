import { type ComputerUse } from "#synapse/modules"
import { type ComputerIntegrationHost } from "./host"

export interface ComputerIntegrationSut {
  host: ComputerIntegrationHost
  computer: ComputerUse
  directory: string
  log: string
}
