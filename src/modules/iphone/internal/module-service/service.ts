import { executeIphoneDeviceAction } from "#synapse/modules/iphone/internal/device-actions"
import { IphoneSessionQueue } from "#synapse/modules/iphone/internal/session-lifecycle"
import {
  IPHONE_ACTION_CLOSE,
  IPHONE_ACTION_TREE,
  IPHONE_REFUSED,
  IPHONE_RESULT_TREE,
  type IphoneConfigurationChange,
  type IphoneConfigurationView,
  type IphoneDeviceAction,
  type IphoneDeviceActionOutput,
  type IphoneHomeOperation,
  type IphoneHomeOutput,
  type IphoneInfrastructure,
  type IphoneManagedPort,
  type IphoneModule,
  type IphoneModuleDependencies,
  type IphoneModuleDiagnosis,
  type IphoneModuleLog,
  type IphoneSupportResult,
  type IphoneTargetedAction,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_MODULE_CLOSED, IPHONE_MODULE_CONFIG_BUSY, IPHONE_MODULE_START_BUSY } from "./constants"
import { copyIphoneElement } from "./copy-element"
import { executeIphoneHome } from "./home-dispatch"
import { executeIphoneTargeted } from "./targeted"

export class IphoneModuleService implements IphoneModule {
  private readonly dependencies: IphoneModuleDependencies

  private readonly infrastructure: IphoneInfrastructure

  private queue?: IphoneSessionQueue<IphoneManagedPort>

  private closed = false

  private stopping = false

  private shutdownPromise?: Promise<void>

  private startPromise?: Promise<void>

  private serverStarted = false

  private readonly lifecycleAbort = new AbortController()

  constructor(dependencies: IphoneModuleDependencies, infrastructure: IphoneInfrastructure) {
    this.dependencies = dependencies
    this.infrastructure = infrastructure
  }

  private ensureOpen(): void {
    if (this.closed || this.stopping) {
      throw new Error(IPHONE_MODULE_CLOSED)
    }
  }

  private sessionQueue(): IphoneSessionQueue<IphoneManagedPort> {
    if (!this.queue) {
      this.queue = new IphoneSessionQueue(this.infrastructure.sessionFactory)
    }
    return this.queue
  }

  async execute(action: IphoneDeviceAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    this.ensureOpen()
    return this.sessionQueue().execute(this.runDeviceAction.bind(this, action), signal)
  }

  async executeTargeted(request: IphoneTargetedAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    this.ensureOpen()
    return this.sessionQueue().execute(executeIphoneTargeted.bind(null, request), signal)
  }

  private async runDeviceAction(
    action: IphoneDeviceAction,
    session: IphoneManagedPort,
    signal: AbortSignal,
  ): Promise<IphoneDeviceActionOutput> {
    if (action.kind === IPHONE_ACTION_TREE) {
      session.elements = []
      const result = await executeIphoneDeviceAction(session, action, signal)
      if (result.kind === IPHONE_RESULT_TREE) {
        session.elements = result.elements.map(copyIphoneElement)
      }
      return result
    }
    if (action.kind === IPHONE_ACTION_CLOSE) {
      try {
        return await executeIphoneDeviceAction(session, action, signal)
      } finally {
        this.sessionQueue().invalidate()
      }
    }
    session.elements = []
    return executeIphoneDeviceAction(session, action, signal)
  }

  async home(operation: IphoneHomeOperation, signal: AbortSignal): Promise<IphoneHomeOutput> {
    this.ensureOpen()
    return this.sessionQueue().execute(this.runHomeOperation.bind(this, operation), signal)
  }

  private async runHomeOperation(
    operation: IphoneHomeOperation,
    session: IphoneManagedPort,
    signal: AbortSignal,
  ): Promise<IphoneHomeOutput> {
    session.elements = []
    return executeIphoneHome(this.infrastructure.homePort(session), operation, signal)
  }

  async diagnose(signal: AbortSignal): Promise<IphoneModuleDiagnosis> {
    this.ensureOpen()
    const config = this.infrastructure.configuration(this.dependencies.configPath, this.dependencies.host)
    return this.infrastructure.diagnose(config, this.dependencies, signal)
  }

  async startServer(signal: AbortSignal): Promise<void> {
    this.ensureOpen()
    if (this.startPromise) {
      return Promise.reject(new Error(IPHONE_MODULE_START_BUSY))
    }
    signal.throwIfAborted()
    const combined = AbortSignal.any([signal, this.lifecycleAbort.signal])
    this.serverStarted = true
    const start = this.startConfiguredServer(combined)
    this.startPromise = start
    return start.finally(this.clearStart.bind(this))
  }

  private async startConfiguredServer(signal: AbortSignal): Promise<void> {
    const config = this.infrastructure.configuration(this.dependencies.configPath, this.dependencies.host)
    signal.throwIfAborted()
    await this.infrastructure.start(config, this.dependencies, signal)
    signal.throwIfAborted()
  }

  private clearStart(): void {
    delete this.startPromise
  }

  configuration(): IphoneConfigurationView {
    return this.infrastructure.configurationView(this.dependencies.configPath)
  }

  configure(changes: IphoneConfigurationChange[]): IphoneSupportResult {
    if (this.closed || this.stopping) {
      return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_CLOSED }
    }
    if (this.queue || this.startPromise || this.serverStarted) {
      return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_CONFIG_BUSY }
    }
    return this.infrastructure.configure(this.dependencies.configPath, changes)
  }

  log(): IphoneModuleLog {
    return this.infrastructure.log(this.dependencies.stateDirectory)
  }

  async reset(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.ensureOpen()
    if (this.queue) {
      await this.queue.reset(signal)
    }
  }

  async stopServer(): Promise<void> {
    this.ensureOpen()
    const queue = this.queue
    this.stopping = true
    try {
      if (this.startPromise) {
        try {
          await this.startPromise
        } catch {
          this.serverStarted = false
        }
      }
      if (queue) {
        await queue.shutdown()
        delete this.queue
      } else {
        await this.infrastructure.stop()
      }
    } finally {
      this.serverStarted = false
      this.stopping = false
    }
  }

  shutdown(): Promise<void> {
    this.closed = true
    this.lifecycleAbort.abort()
    this.queue?.cancel()
    if (!this.shutdownPromise) {
      this.shutdownPromise = this.closeResources()
    }
    return this.shutdownPromise
  }

  private async closeResources(): Promise<void> {
    if (this.startPromise) {
      try {
        await this.startPromise
      } catch {
        this.lifecycleAbort.abort()
      }
    }
    await this.stopResources()
  }

  private async stopResources(): Promise<void> {
    if (this.queue) {
      await this.queue.shutdown()
    } else {
      await this.infrastructure.stop()
    }
  }
}
