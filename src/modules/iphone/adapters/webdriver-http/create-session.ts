import { type IphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { requestIphoneWebDriver } from "./client"
import {
  IPHONE_HTTP_POST,
  IPHONE_HTTP_SESSION,
  IPHONE_HTTP_SESSION_TIMEOUT_MS,
  IPHONE_HTTP_TIMEOUT_MS,
} from "./constants"
import { IPHONE_HTTP_SESSION_SCHEMA } from "./schemas"
import { IphoneWebDriverSession } from "./session"

export async function createIphoneWebDriverSession(
  base: string,
  capabilities: IphoneCapabilities,
  signal: AbortSignal,
): Promise<IphoneWebDriverSession> {
  const result = await requestIphoneWebDriver(
    `${base}/${IPHONE_HTTP_SESSION}`,
    IPHONE_HTTP_POST,
    JSON.stringify({ capabilities: { alwaysMatch: capabilities } }),
    signal,
    IPHONE_HTTP_SESSION_TIMEOUT_MS,
    IPHONE_HTTP_SESSION_SCHEMA,
  )
  const session = new IphoneWebDriverSession(base, result.sessionId)
  if (signal.aborted) {
    await session.dispose(AbortSignal.timeout(IPHONE_HTTP_TIMEOUT_MS))
    signal.throwIfAborted()
  }
  return session
}
