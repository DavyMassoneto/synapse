import {
  IPHONE_WDA_DEFAULT_BIND_HOSTS,
  IPHONE_WDA_ENDPOINT_BUSY,
  IPHONE_WDA_LINUX,
  IPHONE_WDA_LINUX_BIND_HOSTS,
} from "./constants"
import { IphoneWdaSocket } from "./socket"
import { type IphoneWdaAdmissions } from "./types"

export class IphoneWdaAdmission {
  private static readonly ports = new Set<number>()

  private readonly port: number

  private owned = false

  private readonly abort = new AbortController()

  private readonly sockets: IphoneWdaSocket[] = []

  private readonly admissions: IphoneWdaAdmissions

  private closing?: Promise<void>

  constructor(port: number, admissions: IphoneWdaAdmissions) {
    this.port = port
    this.admissions = admissions
  }

  get signal(): AbortSignal {
    return this.abort.signal
  }

  async reserve(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
    if (this.owned || IphoneWdaAdmission.ports.has(this.port)) {
      throw new Error(IPHONE_WDA_ENDPOINT_BUSY)
    }
    IphoneWdaAdmission.ports.add(this.port)
    this.owned = true
    this.admissions.add(this)
    try {
      const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
      for (const host of hosts) {
        await this.bind(host, signal)
      }
    } catch (error) {
      await this.release()
      throw error
    }
  }

  private async bind(host: string, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
    const socket = new IphoneWdaSocket()
    this.sockets.push(socket)
    await socket.bind(host, this.port)
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
  }

  async handoff(signal: AbortSignal): Promise<void> {
    this.abort.signal.throwIfAborted()
    await this.closeSockets()
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
  }

  private async closeSockets(): Promise<void> {
    for (const socket of this.sockets) {
      await socket.close()
    }
  }

  release(): Promise<void> {
    this.abort.abort()
    if (!this.closing) {
      this.closing = this.finishRelease()
    }
    return this.closing
  }

  private async finishRelease(): Promise<void> {
    await this.closeSockets()
    if (this.owned) {
      IphoneWdaAdmission.ports.delete(this.port)
      this.owned = false
      this.admissions.delete(this)
    }
  }
}
