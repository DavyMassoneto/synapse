import { join } from "node:path"
import {
  type IphoneAppiumProvisionCommand,
  type IphoneAppiumProvisionOutput,
} from "#synapse/modules/iphone/adapters/appium-provision"

import { writeIphoneProvisionFixtures } from "./appium-provision-fixtures"

export class IphoneProvisionExecutorDouble {
  readonly commands: IphoneAppiumProvisionCommand[] = []

  fail = false

  incomplete = false

  npmVersion = "11.19.1"

  wrongIntegrity = false

  abortAfterProbe?: AbortController

  async execute(command: IphoneAppiumProvisionCommand): Promise<IphoneAppiumProvisionOutput> {
    this.commands.push(command)
    if (this.fail) {
      throw new Error("download failed")
    }
    if (command.arguments.includes("install") && command.arguments.includes("appium@3.9.0")) {
      await writeIphoneProvisionFixtures(command.directory, this.wrongIntegrity)
    }
    if (command.arguments.includes("--installed")) {
      this.abortAfterProbe?.abort()
      return {
        stdout: JSON.stringify({
          xcuitest: {
            installed: true,
            version: "12.22.8",
            pkgName: "appium-xcuitest-driver",
            installPath: join(command.directory, "node_modules", "appium-xcuitest-driver"),
            repositoryUrl: "https://github.com/appium/appium-xcuitest-driver",
          },
        }),
        stderr: "",
      }
    }
    if (this.incomplete) {
      return { stdout: "", stderr: "" }
    }
    const version = command.arguments[0] === "--version" ? this.npmVersion : "3.9.0"
    return { stdout: version, stderr: "" }
  }
}
