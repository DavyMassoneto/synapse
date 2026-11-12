import { IphoneAppiumProcess, runIphoneAppiumCommand } from "#synapse/modules/iphone/adapters/appium-process"
import {
  loadIphoneCompleteConfiguration,
  readIphoneConfigurationView,
  writeIphoneConfiguration,
} from "#synapse/modules/iphone/adapters/configuration-file"
import { readIphoneServerLog } from "#synapse/modules/iphone/adapters/log-reading"
import {
  IphoneConcreteSessionFactory,
  IphoneHttpDiagnosis,
  IphoneHttpHomePort,
  startIphoneServer,
} from "#synapse/modules/iphone/adapters/webdriver-http"
import { diagnoseIphone } from "#synapse/modules/iphone/internal/diagnosis"
import {
  type IphoneConfiguration,
  type IphoneConfigurationChange,
  type IphoneConfigurationView,
  type IphoneHost,
  type IphoneInfrastructure,
  type IphoneManagedPort,
  type IphoneModuleDependencies,
  type IphoneModuleDiagnosis,
  type IphoneModuleLog,
  type IphoneSupportResult,
} from "./contracts"

export class IphoneSystemInfrastructure implements IphoneInfrastructure {
  private readonly server = new IphoneAppiumProcess(runIphoneAppiumCommand)

  readonly sessionFactory: IphoneConcreteSessionFactory

  constructor(dependencies: IphoneModuleDependencies) {
    this.sessionFactory = new IphoneConcreteSessionFactory(dependencies, this.server)
  }

  configuration(path: string, host: IphoneHost): IphoneConfiguration {
    return loadIphoneCompleteConfiguration(path, host)
  }

  configurationView(path: string): IphoneConfigurationView {
    return readIphoneConfigurationView(path)
  }

  configure(path: string, changes: IphoneConfigurationChange[]): IphoneSupportResult {
    return writeIphoneConfiguration(path, changes)
  }

  log(directory: string): IphoneModuleLog {
    return readIphoneServerLog(directory)
  }

  diagnose(
    config: IphoneConfiguration,
    dependencies: IphoneModuleDependencies,
    signal: AbortSignal,
  ): Promise<IphoneModuleDiagnosis> {
    return diagnoseIphone(config, dependencies.host, new IphoneHttpDiagnosis(config.serverUrl, dependencies), signal)
  }

  start(config: IphoneConfiguration, dependencies: IphoneModuleDependencies, signal: AbortSignal): Promise<void> {
    return startIphoneServer(config, dependencies, this.server, signal)
  }

  stop(): Promise<void> {
    return this.server.stop()
  }

  homePort(session: IphoneManagedPort): IphoneHttpHomePort {
    return new IphoneHttpHomePort(session)
  }
}
