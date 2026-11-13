import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import {
  IPHONE_FIXTURE_BIND,
  IPHONE_FIXTURE_DEFAULT_METHOD,
  IPHONE_FIXTURE_EMPTY_PATH,
  IPHONE_FIXTURE_HTTP_HEADERS,
  IPHONE_FIXTURE_HTTP_OK,
  IPHONE_FIXTURE_SERVER_ERROR,
} from "./constants"
import { iphoneFixtureResponse } from "./route-response"
import { type IphoneFixtureReject, type IphoneFixtureResolve } from "./types"

export class IphoneFixtureServer {
  private readonly server: Server

  paths: string[] = []

  constructor() {
    this.server = createServer(this.handle.bind(this))
  }

  private handle(request: IncomingMessage, response: ServerResponse): void {
    const path = request.url
    if (path) {
      this.paths.push(path)
    }
    const value = iphoneFixtureResponse(
      path ? path : IPHONE_FIXTURE_EMPTY_PATH,
      request.method ? request.method : IPHONE_FIXTURE_DEFAULT_METHOD,
    )
    response.writeHead(IPHONE_FIXTURE_HTTP_OK, IPHONE_FIXTURE_HTTP_HEADERS)
    response.end(`{"value":${value}}`)
  }

  async start(): Promise<string> {
    await new Promise<void>(this.listen.bind(this))
    const address = this.server.address()
    if (!address || typeof address === "string") {
      throw new Error(IPHONE_FIXTURE_SERVER_ERROR)
    }
    return `http://${IPHONE_FIXTURE_BIND}:${address.port}`
  }

  private listen(resolve: IphoneFixtureResolve): void {
    this.server.listen(0, IPHONE_FIXTURE_BIND, resolve)
  }

  async stop(): Promise<void> {
    await new Promise<void>(this.close.bind(this))
  }

  private close(resolve: IphoneFixtureResolve, reject: IphoneFixtureReject): void {
    this.server.close(this.closed.bind(this, resolve, reject))
  }

  private closed(resolve: IphoneFixtureResolve, reject: IphoneFixtureReject, error?: Error): void {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  }
}
