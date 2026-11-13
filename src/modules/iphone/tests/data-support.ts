import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export async function noDataCommand(): Promise<IphoneSimulatorCommandOutput> {
  return { stdout: "", stderr: "" }
}
