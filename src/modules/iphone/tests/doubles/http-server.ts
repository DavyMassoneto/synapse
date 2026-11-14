import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import { HeldHttpPath } from "./held-http-path"
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

  readonly statusPath = new HeldHttpPath()

  readonly sessionPath = new HeldHttpPath()

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
    if (this.statusPath.hold && request.url === IPHONE_TEST_HTTP_STATUS_PATH) {
      void this.statusPath.waitAndRespond(response, this.respond.bind(this))
    } else if (this.sessionPath.hold && request.url === IPHONE_TEST_HTTP_SESSION_PATH) {
      void this.sessionPath.waitAndRespond(response, this.respond.bind(this))
    } else {
      this.respond(response)
    }
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
