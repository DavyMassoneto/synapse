import { findIphoneAppium, IPHONE_APPIUM_NOT_FOUND } from "#synapse/modules/iphone/adapters/appium-process"
import { IPHONE_PROVISION_EXPLICIT_HOME } from "./constants"
import { IphoneProvisionCommandRunner } from "./executor"
import { installIphoneManagedAppium } from "./installation"
import {
  type IphoneAppiumInstallation,
  type IphoneAppiumProvisionCommand,
  type IphoneAppiumProvisionExecutor,
  type IphoneAppiumProvisionOutput,
  type IphoneAppiumProvisionRequest,
} from "./types"

export async function provisionIphoneAppium(
  request: IphoneAppiumProvisionRequest,
  signal: AbortSignal,
  execute: IphoneAppiumProvisionExecutor,
): Promise<IphoneAppiumInstallation> {
  signal.throwIfAborted()
  try {
    const executable = findIphoneAppium(request.path, request.host)
    const installation: IphoneAppiumInstallation = { executable }
    if (request.appiumHome) {
      installation.appiumHome = request.appiumHome
    }
    return installation
  } catch (error) {
    if (!(error instanceof Error && error.message === IPHONE_APPIUM_NOT_FOUND)) {
      throw error
    }
  }
  if (request.appiumHome) {
    throw new Error(IPHONE_PROVISION_EXPLICIT_HOME)
  }
  return installIphoneManagedAppium(request, execute, signal)
}

export function runIphoneProvisionCommand(command: IphoneAppiumProvisionCommand): Promise<IphoneAppiumProvisionOutput> {
  return new IphoneProvisionCommandRunner(command).run()
}
