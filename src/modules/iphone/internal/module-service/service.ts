import {
  executeIphoneDeviceAction,
  IPHONE_ACTION_CLOSE,
  IPHONE_ACTION_TREE,
} from "#synapse/modules/iphone/internal/device-actions"
import { IphoneSessionQueue } from "#synapse/modules/iphone/internal/session-lifecycle"
import {
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
import { IPHONE_MODULE_CLOSED } from "./constants"
import { executeIphoneHome } from "./home-dispatch"
import { executeIphoneTargeted } from "./targeted"

export class IphoneModuleService implements IphoneModule {
  private readonly dependencies: IphoneModuleDependencies

  private readonly infrastructure: IphoneInfrastructure

  private queue?: IphoneSessionQueue<IphoneManagedPort>

  private closed = false

  private stopping = false

  private shutdownPromise?: Promise<void>

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
        session.elements = result.elements
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
    const config = this.infrastructure.configuration(this.dependencies.configPath, this.dependencies.host)
    signal.throwIfAborted()
    await this.infrastructure.start(config, this.dependencies, signal)
  }

  configuration(): IphoneConfigurationView {
    return this.infrastructure.configurationView(this.dependencies.configPath)
  }

  configure(changes: IphoneConfigurationChange[]): IphoneSupportResult {
    if (this.closed || this.stopping) {
      return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_CLOSED }
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
    const queue = this.queue
    this.stopping = true
    try {
      if (queue) {
        await queue.shutdown()
        delete this.queue
      } else {
        await this.infrastructure.stop()
      }
    } finally {
      this.stopping = false
    }
  }

  shutdown(): Promise<void> {
    this.closed = true
    if (!this.shutdownPromise) {
      this.shutdownPromise = this.queue ? this.queue.shutdown() : this.infrastructure.stop()
    }
    return this.shutdownPromise
  }
}
