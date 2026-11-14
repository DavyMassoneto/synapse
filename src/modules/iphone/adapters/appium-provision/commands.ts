import { delimiter, dirname, join } from "node:path"
import { iphoneAppiumCommand } from "#synapse/modules/iphone/adapters/appium-process"
import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_PROVISION_APPIUM_VERSION,
  IPHONE_PROVISION_CACHE,
  IPHONE_PROVISION_DRIVER_ARGUMENTS,
  IPHONE_PROVISION_ENVIRONMENT_PATTERN,
  IPHONE_PROVISION_FALSE,
  IPHONE_PROVISION_INSTALL_ARGUMENTS,
  IPHONE_PROVISION_INVALID_INSTALLATION,
  IPHONE_PROVISION_LIST_ARGUMENTS,
  IPHONE_PROVISION_NPM,
  IPHONE_PROVISION_NPM_MINIMUM,
  IPHONE_PROVISION_NPM_UNSUPPORTED,
  IPHONE_PROVISION_REGISTRY,
  IPHONE_PROVISION_TRUE,
  IPHONE_PROVISION_VERSION_ARGUMENTS,
  IPHONE_PROVISION_VERSION_PATTERN,
  IPHONE_PROVISION_WINDOWS,
  IPHONE_PROVISION_WINDOWS_NPM,
} from "./constants"
import {
  type IphoneAppiumProvisionCommand,
  type IphoneAppiumProvisionExecutor,
  type IphoneAppiumProvisionLayout,
} from "./types"

export function iphoneProvisionEnvironment(layout: IphoneAppiumProvisionLayout, path: string): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (!IPHONE_PROVISION_ENVIRONMENT_PATTERN.test(key)) {
      environment[key] = value
    }
  }
  return {
    ...environment,
    PATH: `${dirname(process.execPath)}${delimiter}${path}`,
    APPIUM_HOME: layout.home,
    npm_config_registry: IPHONE_PROVISION_REGISTRY,
    npm_config_userconfig: layout.configuration,
    npm_config_globalconfig: layout.globalConfiguration,
    npm_config_cache: join(layout.installation, IPHONE_PROVISION_CACHE),
    npm_config_prefix: layout.home,
    npm_config_engine_strict: IPHONE_PROVISION_TRUE,
    npm_config_ignore_scripts: IPHONE_PROVISION_FALSE,
    npm_config_package_lock: IPHONE_PROVISION_TRUE,
    npm_config_save_exact: IPHONE_PROVISION_TRUE,
    npm_config_global: IPHONE_PROVISION_FALSE,
  }
}

export function iphoneProvisionNpmCommand(
  layout: IphoneAppiumProvisionLayout,
  path: string,
  host: IphoneHost,
  argumentsValue: string[],
  signal: AbortSignal,
): IphoneAppiumProvisionCommand {
  const executable = host === IPHONE_PROVISION_WINDOWS ? IPHONE_PROVISION_WINDOWS_NPM : IPHONE_PROVISION_NPM
  const command = iphoneAppiumCommand(executable, argumentsValue, host)
  return {
    executable: command.command,
    arguments: command.arguments,
    directory: layout.home,
    environment: iphoneProvisionEnvironment(layout, path),
    signal,
  }
}

export function iphoneProvisionAppiumCommand(
  layout: IphoneAppiumProvisionLayout,
  path: string,
  argumentsValue: string[],
  signal: AbortSignal,
): IphoneAppiumProvisionCommand {
  return {
    executable: process.execPath,
    arguments: [layout.executable, ...argumentsValue],
    directory: layout.home,
    environment: iphoneProvisionEnvironment(layout, path),
    signal,
  }
}

export async function installIphoneAppiumDependencies(
  layout: IphoneAppiumProvisionLayout,
  path: string,
  host: IphoneHost,
  execute: IphoneAppiumProvisionExecutor,
  signal: AbortSignal,
): Promise<void> {
  const version = await execute(
    iphoneProvisionNpmCommand(layout, path, host, IPHONE_PROVISION_VERSION_ARGUMENTS, signal),
  )
  const match = IPHONE_PROVISION_VERSION_PATTERN.exec(version.stdout.trim())
  if (!match || Number(match[1]) < IPHONE_PROVISION_NPM_MINIMUM) {
    throw new Error(IPHONE_PROVISION_NPM_UNSUPPORTED)
  }
  signal.throwIfAborted()
  await execute(iphoneProvisionNpmCommand(layout, path, host, IPHONE_PROVISION_INSTALL_ARGUMENTS, signal))
  signal.throwIfAborted()
  await execute(iphoneProvisionAppiumCommand(layout, path, IPHONE_PROVISION_DRIVER_ARGUMENTS, signal))
  signal.throwIfAborted()
}

export async function probeIphoneAppiumInstallation(
  layout: IphoneAppiumProvisionLayout,
  path: string,
  execute: IphoneAppiumProvisionExecutor,
  signal: AbortSignal,
): Promise<string> {
  const version = await execute(iphoneProvisionAppiumCommand(layout, path, IPHONE_PROVISION_VERSION_ARGUMENTS, signal))
  if (version.stdout.trim() !== IPHONE_PROVISION_APPIUM_VERSION) {
    throw new Error(IPHONE_PROVISION_INVALID_INSTALLATION)
  }
  signal.throwIfAborted()
  const registry = await execute(iphoneProvisionAppiumCommand(layout, path, IPHONE_PROVISION_LIST_ARGUMENTS, signal))
  signal.throwIfAborted()
  return registry.stdout
}
