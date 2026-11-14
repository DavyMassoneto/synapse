import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  IPHONE_PROVISION_APPIUM_INTEGRITY,
  IPHONE_PROVISION_DRIVER_INTEGRITY,
  IPHONE_PROVISION_RECEIPT_FILES,
} from "#synapse/modules/iphone/adapters/appium-provision"

export async function writeIphoneProvisionFixtures(home: string, wrongIntegrity: boolean): Promise<void> {
  for (const file of IPHONE_PROVISION_RECEIPT_FILES) {
    const path = join(home, file)
    await mkdir(join(path, ".."), { recursive: true })
    await writeFile(path, "fixture")
  }
  await writeFile(
    join(home, "node_modules/appium/package.json"),
    JSON.stringify({
      name: "appium",
      version: "3.9.0",
      main: "./build/lib/main.js",
    }),
  )
  await writeFile(
    join(home, "node_modules/appium-xcuitest-driver/package.json"),
    JSON.stringify({
      name: "appium-xcuitest-driver",
      version: "12.22.8",
      main: "./build/lib/index.js",
    }),
  )
  await writeFile(
    join(home, "package-lock.json"),
    JSON.stringify({
      packages: {
        "node_modules/appium": {
          version: "3.9.0",
          resolved: "https://registry.npmjs.org/appium/-/appium-3.9.0.tgz",
          integrity: wrongIntegrity ? "sha512-corrupt" : IPHONE_PROVISION_APPIUM_INTEGRITY,
        },
        "node_modules/appium-xcuitest-driver": {
          version: "12.22.8",
          resolved: "https://registry.npmjs.org/appium-xcuitest-driver/-/appium-xcuitest-driver-12.22.8.tgz",
          integrity: IPHONE_PROVISION_DRIVER_INTEGRITY,
        },
      },
    }),
  )
}
