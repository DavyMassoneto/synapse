import { once } from "node:events"
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import { SHELL_NATIVE_ARTIFACT_ERROR } from "./constants"
import { SHELL_TEST_EVENT_CLOSE } from "./native-fixture-constants"
import {
  SHELL_ARTIFACT_CONTENT_LENGTH,
  SHELL_ARTIFACT_HOST,
  SHELL_ARTIFACT_LISTENING,
  SHELL_ARTIFACT_PORT_AUTOMATIC,
  SHELL_ARTIFACT_SUCCESS,
  SHELL_ARTIFACT_URL_PREFIX,
  SHELL_ARTIFACT_URL_SUFFIX,
} from "./native-scenario-constants"

export class NativeArtifactServer {
  private readonly server: Server
  private readonly payload: Buffer
  constructor(payload: Buffer) {
    this.payload = payload
    this.server = createServer(this.respond.bind(this))
  }
  async start(): Promise<string> {
    this.server.listen(SHELL_ARTIFACT_PORT_AUTOMATIC, SHELL_ARTIFACT_HOST)
    await once(this.server, SHELL_ARTIFACT_LISTENING)
    try {
      const address = this.server.address()
      if (!address || typeof address === "string") {
        throw new Error(SHELL_NATIVE_ARTIFACT_ERROR)
      }
      return `${SHELL_ARTIFACT_URL_PREFIX}${address.port}${SHELL_ARTIFACT_URL_SUFFIX}`
    } catch (error) {
      await this.close()
      throw error
    }
  }
  async close(): Promise<void> {
    const closed = once(this.server, SHELL_TEST_EVENT_CLOSE)
    this.server.close()
    await closed
  }
  private respond(_request: IncomingMessage, response: ServerResponse): void {
    response.writeHead(SHELL_ARTIFACT_SUCCESS, { [SHELL_ARTIFACT_CONTENT_LENGTH]: this.payload.length })
    response.end(this.payload)
  }
}
