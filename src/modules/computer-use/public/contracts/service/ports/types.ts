import { type ComputerCaptureStoragePort } from "#synapse/modules/computer-use/public/contracts/capture"
import {
  type ComputerDriverLaunch,
  type ComputerDriverPort,
} from "#synapse/modules/computer-use/public/contracts/driver"

export interface ComputerDriverManifest {
  version: string
  arguments: string[]
}

export interface ComputerDriverLaunchRequest {
  provisionMissing: boolean
}

export interface ComputerDriverInfrastructure {
  launch(request: ComputerDriverLaunchRequest): Promise<ComputerDriverLaunch>
  manifest(launch: ComputerDriverLaunch): Promise<ComputerDriverManifest>
  driver(launch: ComputerDriverLaunch): ComputerDriverPort
  install(): Promise<string>
  storage: ComputerCaptureStoragePort
}
