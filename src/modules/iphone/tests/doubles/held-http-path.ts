import { type ServerResponse } from "node:http"
import { type HeldHttpResponse } from "./types"

export class HeldHttpPath {
  readonly requested = Promise.withResolvers<void>()

  readonly released = Promise.withResolvers<void>()

  hold = false

  async waitAndRespond(response: ServerResponse, respond: HeldHttpResponse): Promise<void> {
    this.requested.resolve()
    await this.released.promise
    respond(response)
  }
}
