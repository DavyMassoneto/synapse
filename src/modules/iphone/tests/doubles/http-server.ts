import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import { IPHONE_TEST_HTTP_RESPONSE } from "./http-constants"

export class TestIphoneHttpServer {
  readonly server: Server

  requests = 0

  response = IPHONE_TEST_HTTP_RESPONSE

  status = 200

  responses: string[] = []

  statuses: number[] = []

  paths: string[] = []

  delayMs = 0

  constructor() {
    this.server = createServer(this.handle.bind(this))
  }

  private handle(request: IncomingMessage, response: ServerResponse): void {
    this.requests++
    if (request.url) {
      this.paths.push(request.url)
    }
    const status = this.statuses.shift()
    const body = this.responses.shift()
    response.writeHead(status ? status : this.status, { "content-type": "application/json" })
    if (this.delayMs > 0) {
      setTimeout(this.finish.bind(this, response, body ? body : this.response), this.delayMs)
    } else {
      response.end(body ? body : this.response)
    }
  }

  private finish(response: ServerResponse, body: string): void {
    response.end(body)
  }

  async start(): Promise<string> {
    await new Promise<void>((resolve) => this.server.listen(0, "127.0.0.1", resolve))
    const address = this.server.address()
    if (!address || typeof address === "string") {
      throw new Error("Servidor falso sem endereço")
    }
    return `http://127.0.0.1:${address.port}`
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) => this.server.close((error) => (error ? reject(error) : resolve())))
  }
}
