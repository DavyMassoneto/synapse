import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import { type StubReply } from "./types"

export class StubServer {
  server: Server
  replies: StubReply[]
  requests: string[] = []
  bodies: string[] = []

  constructor(replies: StubReply[]) {
    this.replies = replies
    this.server = createServer((request, response) => this.answer(request, response))
  }

  answer(request: IncomingMessage, response: ServerResponse): void {
    this.requests.push(String(request.url))
    request.on("data", (part: Buffer) => this.bodies.push(part.toString()))
    request.on("end", () => this.reply(response))
  }

  reply(response: ServerResponse): void {
    const reply = this.replies.shift()
    if (reply === undefined) {
      response.writeHead(500)
      response.end()
      return
    }
    response.writeHead(reply.status, { "content-type": "text/event-stream" })
    response.end(reply.body)
  }

  start(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.server.listen(0, "127.0.0.1", () => resolve(this.url()))
    })
  }

  url(): string {
    const address = this.server.address()
    if (address === null || typeof address === "string") {
      throw new Error("servidor parado")
    }
    return `http://127.0.0.1:${address.port}`
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve) => this.server.close(() => resolve()))
  }
}
