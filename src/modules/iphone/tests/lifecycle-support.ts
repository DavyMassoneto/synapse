import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export async function noIphoneLifecycleCommand(): Promise<IphoneSimulatorCommandOutput> {
  return { stdout: "", stderr: "" }
}
