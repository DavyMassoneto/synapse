import {
  IPHONE_ACCEPTED,
  type IphoneConfiguration,
  type IphoneConfigurationChange,
  type IphoneConfigurationView,
  type IphoneElement,
  type IphoneHomeScreenPort,
  type IphoneHost,
  type IphoneInfrastructure,
  type IphoneManagedPort,
  type IphoneModuleDependencies,
  type IphoneModuleDiagnosis,
  type IphoneModuleLog,
  type IphoneSessionFactory,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import { DeviceActionsPort } from "./device-actions-port"

export class DataSession extends DeviceActionsPort implements IphoneManagedPort {
  elements: IphoneElement[] = []

  async probe(_signal: AbortSignal): Promise<void> {}

  async dispose(_signal: AbortSignal): Promise<void> {}
}

export class DataInfrastructure implements IphoneInfrastructure, IphoneSessionFactory<IphoneManagedPort> {
  readonly sessionFactory: IphoneSessionFactory<IphoneManagedPort> = this

  readonly session = new DataSession()

  async create(_signal: AbortSignal): Promise<IphoneManagedPort> {
    return this.session
  }

  async stop(): Promise<void> {}

  configuration(_path: string, _host: IphoneHost): IphoneConfiguration {
    return {
      serverUrl: "http://fake.invalid",
      target: { kind: "device", udid: "fake", deviceName: "fake", wdaInstalled: true },
    }
  }

  configurationView(_path: string): IphoneConfigurationView {
    return { missing: [] }
  }

  configure(_path: string, _changes: IphoneConfigurationChange[]): IphoneSupportResult {
    return { kind: IPHONE_ACCEPTED }
  }

  log(_directory: string): IphoneModuleLog {
    return { path: "fake", text: "fake" }
  }

  async diagnose(
    _config: IphoneConfiguration,
    _dependencies: IphoneModuleDependencies,
    _signal: AbortSignal,
  ): Promise<IphoneModuleDiagnosis> {
    return { server: { kind: "ok" }, target: { kind: "ok" }, simulator: { kind: "not-applicable" } }
  }

  async start(
    _config: IphoneConfiguration,
    _dependencies: IphoneModuleDependencies,
    _signal: AbortSignal,
  ): Promise<void> {}

  homePort(_session: IphoneManagedPort): IphoneHomeScreenPort {
    throw new Error("não usado")
  }
}
