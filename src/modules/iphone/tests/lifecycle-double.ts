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
import { type IphoneLifecycleResolve } from "./types"

export class LifecycleSession extends DeviceActionsPort implements IphoneManagedPort {
  elements: IphoneElement[] = []

  disposals = 0

  waitSignal?: AbortSignal

  waitRelease?: IphoneLifecycleResolve

  async wait(_milliseconds: number, signal: AbortSignal): Promise<void> {
    this.waitSignal = signal
    await new Promise<void>(this.holdWait.bind(this))
    signal.throwIfAborted()
  }

  private holdWait(resolve: IphoneLifecycleResolve): void {
    this.waitRelease = resolve
  }

  async probe(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
  }

  async dispose(_signal: AbortSignal): Promise<void> {
    this.disposals++
  }
}

export class LifecycleInfrastructure implements IphoneInfrastructure, IphoneSessionFactory<IphoneManagedPort> {
  readonly sessionFactory: IphoneSessionFactory<IphoneManagedPort> = this

  readonly session = new LifecycleSession()

  writes = 0

  stops = 0

  startEntered = false

  startSignal?: AbortSignal

  startRelease?: IphoneLifecycleResolve

  async create(_signal: AbortSignal): Promise<IphoneManagedPort> {
    return this.session
  }

  async stop(): Promise<void> {
    this.stops++
  }

  configuration(_path: string, _host: IphoneHost): IphoneConfiguration {
    return {
      serverUrl: "http://127.0.0.1:1",
      target: { kind: "device", udid: "fake", deviceName: "fake", wdaInstalled: true },
    }
  }

  configurationView(_path: string): IphoneConfigurationView {
    return { missing: [] }
  }

  configure(_path: string, _changes: IphoneConfigurationChange[]): IphoneSupportResult {
    this.writes++
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
    signal: AbortSignal,
  ): Promise<void> {
    this.startEntered = true
    this.startSignal = signal
    await new Promise<void>(this.holdStart.bind(this))
    signal.throwIfAborted()
  }

  private holdStart(resolve: IphoneLifecycleResolve): void {
    this.startRelease = resolve
  }

  homePort(_session: IphoneManagedPort): IphoneHomeScreenPort {
    throw new Error("não usado")
  }
}
