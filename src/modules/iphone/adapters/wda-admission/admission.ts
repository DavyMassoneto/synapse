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

  private readonly requestedPorts: number[]

  private owned = false

  private readonly abort = new AbortController()

  private readonly sockets: IphoneWdaSocket[] = []

  private readonly admissions: IphoneWdaAdmissions

  private closing?: Promise<void>

  constructor(ports: number[], admissions: IphoneWdaAdmissions) {
    this.requestedPorts = ports
    this.admissions = admissions
  }

  get signal(): AbortSignal {
    return this.abort.signal
  }

  async reserve(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
    if (this.owned) {
      throw new Error(IPHONE_WDA_ENDPOINT_BUSY)
    }
    for (const port of this.requestedPorts) {
      if (IphoneWdaAdmission.ports.has(port)) {
        throw new Error(IPHONE_WDA_ENDPOINT_BUSY)
      }
    }
    for (const port of this.requestedPorts) {
      IphoneWdaAdmission.ports.add(port)
    }
    this.owned = true
    this.admissions.add(this)
    try {
      const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
      for (const port of this.requestedPorts) {
        for (const host of hosts) {
          await this.bind(host, port, signal)
        }
      }
    } catch (error) {
      await this.release()
      throw error
    }
  }

  private async bind(host: string, port: number, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.abort.signal.throwIfAborted()
    const socket = new IphoneWdaSocket()
    this.sockets.push(socket)
    await socket.bind(host, port)
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
      for (const port of this.requestedPorts) {
        IphoneWdaAdmission.ports.delete(port)
      }
      this.owned = false
      this.admissions.delete(this)
    }
  }
}
