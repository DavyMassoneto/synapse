import { join } from "node:path"
import { Value } from "typebox/value"
import {
  IPHONE_PROVISION_APPIUM_PACKAGE,
  IPHONE_PROVISION_DRIVER_PACKAGE,
  IPHONE_PROVISION_INVALID_REGISTRY,
  IPHONE_PROVISION_NODE_20,
  IPHONE_PROVISION_NODE_20_MINOR,
  IPHONE_PROVISION_NODE_22,
  IPHONE_PROVISION_NODE_22_MINOR,
  IPHONE_PROVISION_NODE_24,
  IPHONE_PROVISION_NODE_MODULES,
  IPHONE_PROVISION_NODE_UNSUPPORTED,
  IPHONE_PROVISION_PACKAGE_JSON,
  IPHONE_PROVISION_PACKAGE_LOCK,
  IPHONE_PROVISION_VERSION_PATTERN,
} from "./constants"
import { readIphoneProvisionFile } from "./files"
import {
  IPHONE_PROVISION_APPIUM_PACKAGE_SCHEMA,
  IPHONE_PROVISION_DRIVER_PACKAGE_SCHEMA,
  IPHONE_PROVISION_DRIVER_REGISTRY_SCHEMA,
  IPHONE_PROVISION_LOCK_SCHEMA,
} from "./schemas"
import { type IphoneAppiumProvisionLayout } from "./types"

export function checkIphoneProvisionNode(version: string): void {
  const match = IPHONE_PROVISION_VERSION_PATTERN.exec(version)
  const major = Number(match?.[1])
  const minor = Number(match?.[2])
  const supported =
    (major === IPHONE_PROVISION_NODE_20 && minor >= IPHONE_PROVISION_NODE_20_MINOR) ||
    (major === IPHONE_PROVISION_NODE_22 && minor >= IPHONE_PROVISION_NODE_22_MINOR) ||
    major >= IPHONE_PROVISION_NODE_24
  if (!supported) {
    throw new Error(IPHONE_PROVISION_NODE_UNSUPPORTED)
  }
}

export async function validateIphoneProvisionPackages(
  layout: IphoneAppiumProvisionLayout,
  registryText: string,
): Promise<void> {
  const appium = await readIphoneProvisionFile(
    layout.home,
    join(IPHONE_PROVISION_NODE_MODULES, IPHONE_PROVISION_APPIUM_PACKAGE, IPHONE_PROVISION_PACKAGE_JSON),
  )
  Value.Parse(IPHONE_PROVISION_APPIUM_PACKAGE_SCHEMA, JSON.parse(appium.toString()))
  const driver = await readIphoneProvisionFile(
    layout.home,
    join(IPHONE_PROVISION_NODE_MODULES, IPHONE_PROVISION_DRIVER_PACKAGE, IPHONE_PROVISION_PACKAGE_JSON),
  )
  Value.Parse(IPHONE_PROVISION_DRIVER_PACKAGE_SCHEMA, JSON.parse(driver.toString()))
  const lock = await readIphoneProvisionFile(layout.home, IPHONE_PROVISION_PACKAGE_LOCK)
  Value.Parse(IPHONE_PROVISION_LOCK_SCHEMA, JSON.parse(lock.toString()))
  const registry = Value.Parse(IPHONE_PROVISION_DRIVER_REGISTRY_SCHEMA, JSON.parse(registryText))
  const expected = join(layout.home, IPHONE_PROVISION_NODE_MODULES, IPHONE_PROVISION_DRIVER_PACKAGE)
  if (registry.xcuitest.installPath !== expected) {
    throw new Error(IPHONE_PROVISION_INVALID_REGISTRY)
  }
}
