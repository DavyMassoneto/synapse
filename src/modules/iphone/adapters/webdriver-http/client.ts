import { Value } from "typebox/value"
import {
  IPHONE_HTTP_CONTENT_TYPE,
  IPHONE_HTTP_ERROR_SCHEMA,
  IPHONE_HTTP_INVALID_RESPONSE,
  IPHONE_HTTP_JSON,
  IPHONE_HTTP_RESPONSE_SCHEMA,
} from "./constants"
import { IphoneWebDriverError } from "./error"

function classifyIphoneWebDriverResponse(text: string, status: number, ok: boolean): void {
  const parsed = Value.Parse(IPHONE_HTTP_RESPONSE_SCHEMA, JSON.parse(text))
  if (Value.Check(IPHONE_HTTP_ERROR_SCHEMA, parsed)) {
    throw new IphoneWebDriverError(parsed.value.error, parsed.value.message)
  }
  if (!ok) {
    throw new Error(`${IPHONE_HTTP_INVALID_RESPONSE} HTTP ${status}`)
  }
}

export async function requestIphoneWebDriver(
  url: string,
  method: string,
  body: string,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<string> {
  const options: RequestInit = {
    method,
    headers: { [IPHONE_HTTP_CONTENT_TYPE]: IPHONE_HTTP_JSON },
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  }
  if (body) {
    options.body = body
  }
  const response = await fetch(url, options)
  const text = await response.text()
  signal.throwIfAborted()
  classifyIphoneWebDriverResponse(text, response.status, response.ok)
  return text
}
