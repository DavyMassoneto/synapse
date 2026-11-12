import { type ComputerCaptureStoragePort } from "#synapse/modules/computer-use/public/contracts/capture"
import {
  type ComputerDriverLaunch,
  type ComputerDriverPort,
} from "#synapse/modules/computer-use/public/contracts/driver"

export interface ComputerDriverManifest {
  version: string
  arguments: string[]
}

export interface ComputerDriverInfrastructure {
  launch(): Promise<ComputerDriverLaunch>
  manifest(launch: ComputerDriverLaunch): Promise<ComputerDriverManifest>
  driver(launch: ComputerDriverLaunch): ComputerDriverPort
  install(): Promise<string>
  storage: ComputerCaptureStoragePort
}
