import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import {
  COMPUTER_ARTIFACT_TEST_ADDRESS_FAILED,
  COMPUTER_ARTIFACT_TEST_CONTENT_TYPE,
  COMPUTER_ARTIFACT_TEST_HOST,
  COMPUTER_ARTIFACT_TEST_HTTP_OK,
} from "./artifact-download-constants"

import { type ComputerServerCallback } from "./artifact-download-types"

export class ComputerArtifactTestServer {
  private readonly payload: Buffer

  private readonly server: Server

  constructor(payload: Buffer) {
    this.payload = payload
    this.server = createServer(this.respond.bind(this))
  }

  async start(): Promise<string> {
    await new Promise<void>(this.listen.bind(this))
    const address = this.server.address()
    if (!address || typeof address === "string") {
      throw new Error(COMPUTER_ARTIFACT_TEST_ADDRESS_FAILED)
    }
    return `http://${COMPUTER_ARTIFACT_TEST_HOST}:${address.port}`
  }

  async stop(): Promise<void> {
    await new Promise<void>(this.closeListener.bind(this))
  }

  private listen(resolve: ComputerServerCallback): void {
    this.server.listen(0, COMPUTER_ARTIFACT_TEST_HOST, resolve)
  }

  private closeListener(resolve: ComputerServerCallback): void {
    this.server.close(resolve)
  }

  private respond(_request: IncomingMessage, response: ServerResponse): void {
    response.writeHead(COMPUTER_ARTIFACT_TEST_HTTP_OK, { "content-type": COMPUTER_ARTIFACT_TEST_CONTENT_TYPE })
    response.end(this.payload)
  }
}
