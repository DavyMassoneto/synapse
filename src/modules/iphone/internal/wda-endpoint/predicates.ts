import { IPHONE_SIMULATOR, type IphoneConfiguration } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_WDA_BINDING_IP, IPHONE_WDA_IPV6_LOOPBACK, IPHONE_WDA_LOCALHOST } from "./constants"

export function isIphoneLocalSimulatorWda(config: IphoneConfiguration): boolean {
  if (config.target.kind !== IPHONE_SIMULATOR || config.target.wdaUrl) {
    return false
  }
  const host = new URL(config.serverUrl).hostname
  return host === IPHONE_WDA_BINDING_IP || host === IPHONE_WDA_IPV6_LOOPBACK || host === IPHONE_WDA_LOCALHOST
}
