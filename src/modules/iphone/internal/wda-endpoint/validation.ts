import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneConfiguration,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_WDA_PORT_REQUIRED, IPHONE_WDA_RESTART_OPT_IN_REQUIRED } from "./constants"
import { isIphoneLocalSimulatorWda } from "./predicates"

export function validateIphoneWdaEndpoint(config: IphoneConfiguration): IphoneSupportResult {
  const port = config.capabilities?.wdaLocalPort
  if (isIphoneLocalSimulatorWda(config)) {
    if (!port) {
      return { kind: IPHONE_REFUSED, message: IPHONE_WDA_PORT_REQUIRED }
    }
    if (config.capabilities?.useNewWDA !== true) {
      return { kind: IPHONE_REFUSED, message: IPHONE_WDA_RESTART_OPT_IN_REQUIRED }
    }
  }
  return { kind: IPHONE_ACCEPTED }
}
