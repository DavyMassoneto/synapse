import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import {
  IPHONE_TEST_HTTP_RESPONSE,
  IPHONE_TEST_HTTP_SESSION_PATH,
  IPHONE_TEST_HTTP_STATUS_PATH,
} from "./http-constants"

export class TestIphoneHttpServer {
  readonly server: Server

  requests = 0

  response = IPHONE_TEST_HTTP_RESPONSE

  status = 200

  responses: string[] = []

  statuses: number[] = []

  paths: string[] = []

  delayMs = 0

  bodies: string[] = []

  readonly statusRequested = Promise.withResolvers<void>()

  readonly statusReleased = Promise.withResolvers<void>()

  holdStatus = false

  readonly sessionRequested = Promise.withResolvers<void>()

  readonly sessionReleased = Promise.withResolvers<void>()

  holdSession = false

  constructor() {
    this.server = createServer(this.handle.bind(this))
  }

  private handle(request: IncomingMessage, response: ServerResponse): void {
    this.requests++
    request.setEncoding("utf8")
    request.on("data", this.readBody.bind(this))
    if (request.url) {
      this.paths.push(request.url)
    }
    if (this.holdStatus && request.url === IPHONE_TEST_HTTP_STATUS_PATH) {
      this.statusRequested.resolve()
      void this.releaseStatus(response)
    } else if (this.holdSession && request.url === IPHONE_TEST_HTTP_SESSION_PATH) {
      this.sessionRequested.resolve()
      void this.releaseSession(response)
    } else {
      this.respond(response)
    }
  }

  private async releaseSession(response: ServerResponse): Promise<void> {
    await this.sessionReleased.promise
    this.respond(response)
  }

  private async releaseStatus(response: ServerResponse): Promise<void> {
    await this.statusReleased.promise
    this.respond(response)
  }

  private respond(response: ServerResponse): void {
    const status = this.statuses.shift()
    const body = this.responses.shift()
    response.writeHead(status ? status : this.status, { "content-type": "application/json" })
    if (this.delayMs > 0) {
      setTimeout(this.finish.bind(this, response, body ? body : this.response), this.delayMs)
    } else {
      response.end(body ? body : this.response)
    }
  }

  private readBody(chunk: string): void {
    this.bodies.push(chunk)
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
