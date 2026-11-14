import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneConfiguration,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_WDA_MAX_PORT,
  IPHONE_WDA_PORT_INVALID,
  IPHONE_WDA_PORT_REQUIRED,
  IPHONE_WDA_RESTART_OPT_IN_REQUIRED,
} from "./constants"
import { isIphoneLocalSimulatorWda } from "./predicates"

export function validateIphoneWdaEndpoint(config: IphoneConfiguration): IphoneSupportResult {
  const port = config.capabilities?.wdaLocalPort
  if (config.capabilities && "wdaLocalPort" in config.capabilities) {
    if (!(typeof port === "number" && Number.isInteger(port) && port > 0 && port <= IPHONE_WDA_MAX_PORT)) {
      return { kind: IPHONE_REFUSED, message: IPHONE_WDA_PORT_INVALID }
    }
  }
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
