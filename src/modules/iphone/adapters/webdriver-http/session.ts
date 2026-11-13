import { setTimeout } from "node:timers/promises"
import { Value } from "typebox/value"
import { type IphoneActionArguments } from "#synapse/modules/iphone/internal/device-actions"
import { type IphonePointerAction } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  type IphoneElement,
  type IphoneMobileInfo,
  type IphoneRectangle,
} from "#synapse/modules/iphone/public/contracts"
import { requestIphoneWebDriver } from "./client"
import {
  IPHONE_HTTP_ACTIONS,
  IPHONE_HTTP_DELETE,
  IPHONE_HTTP_ELEMENT,
  IPHONE_HTTP_ELEMENT_CLEAR,
  IPHONE_HTTP_ELEMENT_ID,
  IPHONE_HTTP_ELEMENT_ROOT,
  IPHONE_HTTP_ELEMENT_VALUE,
  IPHONE_HTTP_EXECUTE,
  IPHONE_HTTP_FINGER,
  IPHONE_HTTP_GET,
  IPHONE_HTTP_MOBILE_LAUNCH,
  IPHONE_HTTP_MOBILE_PREFIX,
  IPHONE_HTTP_MOBILE_TERMINATE,
  IPHONE_HTTP_ORIENTATION,
  IPHONE_HTTP_POINTER,
  IPHONE_HTTP_POST,
  IPHONE_HTTP_RECT,
  IPHONE_HTTP_SCREENSHOT,
  IPHONE_HTTP_SESSION,
  IPHONE_HTTP_SOURCE,
  IPHONE_HTTP_TIMEOUT_MS,
  IPHONE_HTTP_TOUCH,
  IPHONE_HTTP_URL,
} from "./constants"
import {
  IPHONE_HTTP_ELEMENT_SCHEMA,
  IPHONE_HTTP_EMPTY_SCHEMA,
  IPHONE_HTTP_INFO_SCHEMA,
  IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA,
  IPHONE_HTTP_MOBILE_RESULT_SCHEMA,
  IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA,
  IPHONE_HTTP_RECT_SCHEMA,
  IPHONE_HTTP_STRING_SCHEMA,
} from "./schemas"

export class IphoneWebDriverSession {
  readonly id: string

  elements: IphoneElement[] = []

  private readonly base: string

  constructor(base: string, id: string) {
    this.base = base
    this.id = id
  }

  private url(path: string): string {
    return `${this.base}/${IPHONE_HTTP_SESSION}/${encodeURIComponent(this.id)}/${path}`
  }

  async probe(signal: AbortSignal): Promise<void> {
    await this.rect(signal)
  }

  async dispose(signal: AbortSignal): Promise<void> {
    try {
      await this.close(signal)
    } catch {
      signal.throwIfAborted()
    }
  }

  private async emptyRequest(url: string, method: string, body: string, signal: AbortSignal): Promise<void> {
    const text = await requestIphoneWebDriver(url, method, body, signal, IPHONE_HTTP_TIMEOUT_MS)
    Value.Parse(IPHONE_HTTP_EMPTY_SCHEMA, JSON.parse(text))
  }

  async source(signal: AbortSignal): Promise<string> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_SOURCE),
      IPHONE_HTTP_GET,
      "",
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    return Value.Parse(IPHONE_HTTP_STRING_SCHEMA, JSON.parse(text)).value
  }

  async screenshot(signal: AbortSignal): Promise<string> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_SCREENSHOT),
      IPHONE_HTTP_GET,
      "",
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    return Value.Parse(IPHONE_HTTP_STRING_SCHEMA, JSON.parse(text)).value
  }

  async rect(signal: AbortSignal): Promise<IphoneRectangle> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_RECT),
      IPHONE_HTTP_GET,
      "",
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    return Value.Parse(IPHONE_HTTP_RECT_SCHEMA, JSON.parse(text)).value
  }

  async actions(actions: IphonePointerAction[], signal: AbortSignal): Promise<void> {
    const body = JSON.stringify({
      actions: [
        { type: IPHONE_HTTP_POINTER, id: IPHONE_HTTP_FINGER, parameters: { pointerType: IPHONE_HTTP_TOUCH }, actions },
      ],
    })
    await this.emptyRequest(this.url(IPHONE_HTTP_ACTIONS), IPHONE_HTTP_POST, body, signal)
  }

  async activeElement(signal: AbortSignal): Promise<string> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_ELEMENT),
      IPHONE_HTTP_GET,
      "",
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    return Value.Parse(IPHONE_HTTP_ELEMENT_SCHEMA, JSON.parse(text)).value[IPHONE_HTTP_ELEMENT_ID]
  }

  async mobile(script: string, args: IphoneActionArguments, signal: AbortSignal): Promise<void> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_EXECUTE),
      IPHONE_HTTP_POST,
      JSON.stringify({ script: `${IPHONE_HTTP_MOBILE_PREFIX}${script}`, args: [args] }),
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    switch (script) {
      case IPHONE_HTTP_MOBILE_TERMINATE:
        Value.Parse(IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA, JSON.parse(text))
        break
      case IPHONE_HTTP_MOBILE_LAUNCH:
        Value.Parse(IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA, JSON.parse(text))
        break
      default:
        Value.Parse(IPHONE_HTTP_MOBILE_RESULT_SCHEMA, JSON.parse(text))
    }
  }

  async mobileInfo(script: string, signal: AbortSignal): Promise<IphoneMobileInfo> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_EXECUTE),
      IPHONE_HTTP_POST,
      JSON.stringify({ script: `${IPHONE_HTTP_MOBILE_PREFIX}${script}`, args: [{}] }),
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    const result = Value.Parse(IPHONE_HTTP_INFO_SCHEMA, JSON.parse(text))
    return result.value
  }

  async elementValue(id: string, value: string, signal: AbortSignal): Promise<void> {
    const path = `${IPHONE_HTTP_ELEMENT_ROOT}/${encodeURIComponent(id)}/${IPHONE_HTTP_ELEMENT_VALUE}`
    await this.emptyRequest(this.url(path), IPHONE_HTTP_POST, JSON.stringify({ text: value }), signal)
  }

  async clearElement(id: string, signal: AbortSignal): Promise<void> {
    const path = `${IPHONE_HTTP_ELEMENT_ROOT}/${encodeURIComponent(id)}/${IPHONE_HTTP_ELEMENT_CLEAR}`
    await this.emptyRequest(this.url(path), IPHONE_HTTP_POST, "{}", signal)
  }

  async openUrl(url: string, signal: AbortSignal): Promise<void> {
    await this.emptyRequest(this.url(IPHONE_HTTP_URL), IPHONE_HTTP_POST, JSON.stringify({ url }), signal)
  }

  async getOrientation(signal: AbortSignal): Promise<string> {
    const text = await requestIphoneWebDriver(
      this.url(IPHONE_HTTP_ORIENTATION),
      IPHONE_HTTP_GET,
      "",
      signal,
      IPHONE_HTTP_TIMEOUT_MS,
    )
    return Value.Parse(IPHONE_HTTP_STRING_SCHEMA, JSON.parse(text)).value
  }

  async setOrientation(orientation: string, signal: AbortSignal): Promise<void> {
    await this.emptyRequest(
      this.url(IPHONE_HTTP_ORIENTATION),
      IPHONE_HTTP_POST,
      JSON.stringify({ orientation }),
      signal,
    )
  }

  async wait(milliseconds: number, signal: AbortSignal): Promise<void> {
    await setTimeout(milliseconds, undefined, { signal })
    signal.throwIfAborted()
  }

  async close(signal: AbortSignal): Promise<void> {
    await this.emptyRequest(
      `${this.base}/${IPHONE_HTTP_SESSION}/${encodeURIComponent(this.id)}`,
      IPHONE_HTTP_DELETE,
      "",
      signal,
    )
  }
}
