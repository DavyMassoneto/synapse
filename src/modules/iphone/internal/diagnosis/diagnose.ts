import { validateIphoneConfiguration } from "#synapse/modules/iphone/internal/configuration"
import {
  IPHONE_DIAGNOSIS_FAILED,
  IPHONE_DIAGNOSIS_NOT_APPLICABLE,
  IPHONE_DIAGNOSIS_OK,
  IPHONE_MACOS,
  IPHONE_REFUSED,
  IPHONE_SIMULATOR,
  type IphoneConfiguration,
  type IphoneHost,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_DIAGNOSIS_SERVER_UNAVAILABLE, IPHONE_DIAGNOSIS_SIMULATOR_MISSING } from "./constants"
import { type IphoneDiagnosis, type IphoneDiagnosisCheck, type IphoneDiagnosisPort } from "./types"

export async function diagnoseIphone(
  config: IphoneConfiguration,
  host: IphoneHost,
  port: IphoneDiagnosisPort,
  signal: AbortSignal,
): Promise<IphoneDiagnosis> {
  const targetResult = validateIphoneConfiguration(config, host)
  let target: IphoneDiagnosisCheck = { kind: IPHONE_DIAGNOSIS_OK }
  if (targetResult.kind === IPHONE_REFUSED) {
    target = { kind: IPHONE_DIAGNOSIS_FAILED, message: targetResult.message }
  }
  const responds = await port.serverResponds(signal)
  signal.throwIfAborted()
  let server: IphoneDiagnosisCheck = { kind: IPHONE_DIAGNOSIS_OK }
  if (!responds) {
    server = { kind: IPHONE_DIAGNOSIS_FAILED, message: IPHONE_DIAGNOSIS_SERVER_UNAVAILABLE }
  }
  let simulator: IphoneDiagnosisCheck = { kind: IPHONE_DIAGNOSIS_NOT_APPLICABLE }
  if (host === IPHONE_MACOS && config.target.kind === IPHONE_SIMULATOR) {
    const found = await port.hasBootedSimulator(signal)
    signal.throwIfAborted()
    if (found) {
      simulator = { kind: IPHONE_DIAGNOSIS_OK }
    } else {
      simulator = { kind: IPHONE_DIAGNOSIS_FAILED, message: IPHONE_DIAGNOSIS_SIMULATOR_MISSING }
    }
  }
  return { server, target, simulator }
}
