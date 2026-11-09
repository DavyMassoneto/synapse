import { setTimeout as delay } from "node:timers/promises"
import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { type GithubSettings } from "../settings"
import {
  API_URL,
  API_VERSION,
  DEFAULT_RETRY_SECONDS,
  ERROR_BODY_CHARACTERS,
  MILLISECONDS_PER_SECOND,
  REQUEST_ATTEMPTS,
} from "./constants"
import { isRateLimited } from "./predicates"
import { type ReviewPayload } from "./types"

function headerOf(response: Response, name: string): string {
  const value = response.headers.get(name)
  if (typeof value === "string") {
    return value
  }
  return ""
}

function retryDelayMs(response: Response): number {
  const seconds = Number(headerOf(response, "retry-after"))
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * MILLISECONDS_PER_SECOND
  }
  return DEFAULT_RETRY_SECONDS * MILLISECONDS_PER_SECOND
}

async function send(settings: GithubSettings, path: string, init: RequestInit, attempt: number): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${settings.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": API_VERSION,
    },
  })
  const remaining = headerOf(response, "x-ratelimit-remaining")
  if (isRateLimited(response.status, headerOf(response, "retry-after"), remaining) && attempt < REQUEST_ATTEMPTS) {
    console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
    await delay(retryDelayMs(response))
    return send(settings, path, init, attempt + 1)
  }
  if (!response.ok) {
    const detail = (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
    throw new Error(`GitHub respondeu ${response.status} em ${path}: ${detail}`)
  }
  return response
}

export async function getJson<Schema extends TSchema>(
  settings: GithubSettings,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await send(settings, path, { method: "GET" }, 1)
  return Value.Parse(schema, await response.json())
}

export async function postJson<Schema extends TSchema>(
  settings: GithubSettings,
  path: string,
  payload: ReviewPayload,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await send(settings, path, { method: "POST", body: JSON.stringify(payload) }, 1)
  return Value.Parse(schema, await response.json())
}
