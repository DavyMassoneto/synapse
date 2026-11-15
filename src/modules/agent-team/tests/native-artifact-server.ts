import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import { SHELL_NATIVE_ARTIFACT_ERROR } from "./constants"
import { type ShellTestResolve } from "./types"

export class NativeArtifactServer {
  private readonly server: Server
  private readonly payload: Buffer
  constructor(payload: Buffer) {
    this.payload = payload
    this.server = createServer(this.respond.bind(this))
  }
  async start(): Promise<string> {
    await new Promise<void>(this.listen.bind(this))
    const address = this.server.address()
    if (!address || typeof address === "string") {
      throw new Error(SHELL_NATIVE_ARTIFACT_ERROR)
    }
    return `http://127.0.0.1:${address.port}/`
  }
  private listen(resolve: ShellTestResolve): void {
    this.server.listen(0, "127.0.0.1", resolve)
  }
  async close(): Promise<void> {
    await new Promise<void>(this.shutdown.bind(this))
  }
  private shutdown(resolve: ShellTestResolve): void {
    this.server.close(resolve)
  }
  private respond(_request: IncomingMessage, response: ServerResponse): void {
    response.writeHead(200, { "content-length": this.payload.length })
    response.end(this.payload)
  }
}
