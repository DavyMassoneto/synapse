import { type ComputerDriverReleaseFetch } from "#synapse/modules/computer-use/adapters/driver-release"
import { COMPUTER_DRIVER_RELEASE_TEST_UNKNOWN_URL } from "./driver-release-constants"
import {
  type ComputerReleaseTestRequest,
  type ComputerReleaseTestRoute,
  type ComputerReleaseTestStreamState,
} from "./driver-release-types"

export class ComputerFakeReleaseHttp {
  readonly requests: ComputerReleaseTestRequest[] = []

  private readonly routes: ComputerReleaseTestRoute[]

  readonly fetch: ComputerDriverReleaseFetch = this.respond.bind(this)

  constructor(routes: ComputerReleaseTestRoute[]) {
    this.routes = routes
  }

  private async respond(url: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers)
    this.requests.push({ url, headers })
    const route = this.routes.find((entry) => entry.url === url)
    if (!route) {
      throw new Error(`${COMPUTER_DRIVER_RELEASE_TEST_UNKNOWN_URL} ${url}`)
    }
    const responseHeaders = new Headers(route.headers)
    if (route.etag) {
      responseHeaders.set("etag", route.etag)
    }
    const body = route.body.length === 0 ? null : route.body
    return new Response(body, { status: route.status, headers: responseHeaders })
  }
}

export function computerReleaseTestStreamingResponse(
  chunks: Uint8Array[],
  state: ComputerReleaseTestStreamState,
): Response {
  let index = 0
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        state.pulls += 1
        const chunk = chunks[index]
        if (chunk) {
          index += 1
          controller.enqueue(chunk)
        } else {
          controller.close()
        }
      },
      cancel() {
        state.cancelled = true
      },
    },
    { highWaterMark: 0 },
  )
  return new Response(stream)
}
