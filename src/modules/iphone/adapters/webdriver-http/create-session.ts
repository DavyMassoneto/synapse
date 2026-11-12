import { Value } from "typebox/value"
import { type IphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { requestIphoneWebDriver } from "./client"
import {
  IPHONE_HTTP_POST,
  IPHONE_HTTP_SESSION,
  IPHONE_HTTP_SESSION_SCHEMA,
  IPHONE_HTTP_SESSION_TIMEOUT_MS,
  IPHONE_HTTP_TIMEOUT_MS,
} from "./constants"
import { IphoneWebDriverSession } from "./session"

export async function createIphoneWebDriverSession(
  base: string,
  capabilities: IphoneCapabilities,
  signal: AbortSignal,
): Promise<IphoneWebDriverSession> {
  const text = await requestIphoneWebDriver(
    `${base}/${IPHONE_HTTP_SESSION}`,
    IPHONE_HTTP_POST,
    JSON.stringify({ capabilities: { alwaysMatch: capabilities } }),
    signal,
    IPHONE_HTTP_SESSION_TIMEOUT_MS,
  )
  const result = Value.Parse(IPHONE_HTTP_SESSION_SCHEMA, JSON.parse(text))
  const session = new IphoneWebDriverSession(base, result.value.sessionId)
  if (signal.aborted) {
    await session.dispose(AbortSignal.timeout(IPHONE_HTTP_TIMEOUT_MS))
    signal.throwIfAborted()
  }
  return session
}
