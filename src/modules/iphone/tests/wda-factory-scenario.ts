import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import { IphoneConcreteSessionFactory } from "#synapse/modules/iphone/adapters/webdriver-http"
import { type IphoneConfiguration } from "#synapse/modules/iphone/public/contracts"
import { IphoneAppiumExecutorDouble } from "./appium-executor-double"

import { noSimulatorCommand } from "./wda-support"

export class WdaFactoryScenario {
  private readonly directory = mkdtempSync(join(process.cwd(), ".test-wda-"))

  readonly factory: IphoneConcreteSessionFactory

  constructor(config: IphoneConfiguration) {
    const configPath = join(this.directory, "config.json")
    writeFileSync(configPath, JSON.stringify(config))
    const executor = new IphoneAppiumExecutorDouble()
    this.factory = new IphoneConcreteSessionFactory(
      {
        host: "darwin",
        configPath,
        stateDirectory: this.directory,
        path: "",
        executeSimulatorCommand: noSimulatorCommand,
      },
      new IphoneAppiumProcess(executor.execute.bind(executor)),
    )
  }

  async stop(): Promise<void> {
    await this.factory.stop()
    rmSync(this.directory, { recursive: true, force: true })
  }
}
