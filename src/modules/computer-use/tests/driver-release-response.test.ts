import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE,
  COMPUTER_DRIVER_RELEASE_TEXT_READ,
  computerReadReleaseResponseText,
} from "#synapse/modules/computer-use/adapters/driver-release"
import { computerReleaseTestStreamingResponse } from "./driver-release-support"
import { type ComputerReleaseTestStreamState } from "./driver-release-types"

const COMPUTER_DRIVER_RELEASE_TEST_STREAM_LIMIT = 8

function streamState(): ComputerReleaseTestStreamState {
  return { cancelled: false, pulls: 0 }
}

function encodedChunks(text: string): Uint8Array[] {
  const bytes = new TextEncoder().encode(text)
  return [bytes.slice(0, 2), bytes.slice(2)]
}

async function readsChunkedUtf8WithinLimit(): Promise<void> {
  const state = streamState()
  const result = await computerReadReleaseResponseText(
    computerReleaseTestStreamingResponse(encodedChunks("ação"), state),
    64,
  )
  expect(result).toStrictEqual({ kind: COMPUTER_DRIVER_RELEASE_TEXT_READ, text: "ação" })
  expect(state.cancelled).toBe(false)
}

async function cancelsWhenChunkExceedsLimit(): Promise<void> {
  const state = streamState()
  const chunks = Array.from({ length: 4 }, () => new Uint8Array(1024))
  const result = await computerReadReleaseResponseText(
    computerReleaseTestStreamingResponse(chunks, state),
    COMPUTER_DRIVER_RELEASE_TEST_STREAM_LIMIT,
  )
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE} ${COMPUTER_DRIVER_RELEASE_TEST_STREAM_LIMIT} bytes.`,
  })
  expect(state).toStrictEqual({ cancelled: true, pulls: 1 })
}

async function cancelsWhenAccumulatedChunksExceedLimit(): Promise<void> {
  const state = streamState()
  const chunks = [new Uint8Array(6), new Uint8Array(6)]
  const result = await computerReadReleaseResponseText(
    computerReleaseTestStreamingResponse(chunks, state),
    COMPUTER_DRIVER_RELEASE_TEST_STREAM_LIMIT,
  )
  expect(result.kind).toBe("release-failed")
  expect(state).toStrictEqual({ cancelled: true, pulls: 2 })
}

async function readsEmptyBody(): Promise<void> {
  const result = await computerReadReleaseResponseText(new Response(null), 8)
  expect(result).toStrictEqual({ kind: COMPUTER_DRIVER_RELEASE_TEXT_READ, text: "" })
}

describe("leitura do corpo das respostas de release", () => {
  test("decodifica corpo em blocos dentro do limite", readsChunkedUtf8WithinLimit)
  test("cancela ao exceder o limite no primeiro bloco", cancelsWhenChunkExceedsLimit)
  test("cancela ao exceder o limite acumulado", cancelsWhenAccumulatedChunksExceedLimit)
  test("lê corpo ausente como texto vazio", readsEmptyBody)
})
