import { IPHONE_SESSION_CLOSE_TIMEOUT_MS, IPHONE_SESSION_CLOSED } from "./constants"
import {
  type IphoneMaybeSession,
  type IphoneSessionFactory,
  type IphoneSessionLifecycle,
  type IphoneSessionOperation,
  type IphoneSessionPort,
} from "./types"

export class IphoneSessionQueue<S extends IphoneSessionPort> implements IphoneSessionLifecycle<S> {
  private session: IphoneMaybeSession<S> = null

  private closed = false

  private readonly abort = new AbortController()

  private queue: Promise<boolean> = Promise.resolve(false)

  private shutdownPromise?: Promise<void>

  private readonly factory: IphoneSessionFactory<S>

  constructor(factory: IphoneSessionFactory<S>) {
    this.factory = factory
  }

  execute<T>(operation: IphoneSessionOperation<S, T>, signal: AbortSignal): Promise<T> {
    if (this.closed) {
      return Promise.reject(new Error(IPHONE_SESSION_CLOSED))
    }
    const combined = AbortSignal.any([signal, this.abort.signal])
    const run = this.queue.then(() => this.run(operation, combined))
    this.queue = run.then(this.queueSettled.bind(this), this.queueSettled.bind(this))
    return run
  }

  private queueSettled(): boolean {
    return this.closed
  }

  private async run<T>(operation: IphoneSessionOperation<S, T>, signal: AbortSignal): Promise<T> {
    if (this.closed) {
      throw new Error(IPHONE_SESSION_CLOSED)
    }
    signal.throwIfAborted()
    const session = await this.acquire(signal)
    const result = await operation(session, signal)
    signal.throwIfAborted()
    return result
  }

  private async acquire(signal: AbortSignal): Promise<S> {
    if (this.session) {
      try {
        await this.session.probe(signal)
        signal.throwIfAborted()
        return this.session
      } catch {
        signal.throwIfAborted()
        const stale = this.session
        this.session = null
        try {
          await stale.dispose(signal)
        } catch {
          signal.throwIfAborted()
        }
      }
    }
    const created = await this.factory.create(signal)
    this.session = created
    signal.throwIfAborted()
    return created
  }

  reset(signal: AbortSignal): Promise<void> {
    const result = this.queue.then(this.renewSession.bind(this, signal))
    this.queue = result.then(this.queueSettled.bind(this), this.queueSettled.bind(this))
    return result
  }

  private async renewSession(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    const session = this.session
    this.session = null
    if (session) {
      await session.dispose(signal)
      signal.throwIfAborted()
    }
  }

  invalidate(): void {
    this.session = null
  }

  cancel(): void {
    this.closed = true
    this.abort.abort()
  }

  shutdown(): Promise<void> {
    this.cancel()
    if (!this.shutdownPromise) {
      this.shutdownPromise = this.closeResources()
    }
    return this.shutdownPromise
  }

  private async closeResources(): Promise<void> {
    await this.queue
    try {
      if (this.session) {
        await this.session.dispose(AbortSignal.timeout(IPHONE_SESSION_CLOSE_TIMEOUT_MS))
      }
    } finally {
      await this.factory.stop()
    }
  }
}
