import { createServer, type Server, type Socket } from "node:net"
import { IPHONE_WDA_CLOSE_EVENT, IPHONE_WDA_ERROR_EVENT, IPHONE_WDA_LISTENING_EVENT } from "./constants"

export class IphoneWdaSocket {
  private readonly server: Server = createServer(this.rejectConnection.bind(this))

  private readonly abort = new AbortController()

  private readonly listening = Promise.withResolvers<void>()

  private readonly closed = Promise.withResolvers<void>()

  private closing = false

  private rejectConnection(socket: Socket): void {
    socket.destroy()
  }

  async bind(host: string, port: number): Promise<void> {
    this.server.once(IPHONE_WDA_LISTENING_EVENT, this.listening.resolve)
    this.server.once(IPHONE_WDA_ERROR_EVENT, this.listening.reject)
    this.server.once(IPHONE_WDA_CLOSE_EVENT, this.finishClose.bind(this))
    this.server.listen({ host, port, ipv6Only: true, exclusive: true, signal: this.abort.signal })
    await this.listening.promise
    this.abort.signal.throwIfAborted()
  }

  private finishClose(): void {
    this.listening.reject(new Error(IPHONE_WDA_CLOSE_EVENT))
    this.closed.resolve()
  }

  async close(): Promise<void> {
    if (!this.closing) {
      this.closing = true
      this.abort.abort()
      this.server.close()
    }
    await this.closed.promise
  }
}
