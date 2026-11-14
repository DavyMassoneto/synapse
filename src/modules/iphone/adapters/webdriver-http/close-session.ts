import { IPHONE_WDA_REQUIRED, type IphoneWdaSelection } from "#synapse/modules/iphone/adapters/wda-admission"
import { requestIphoneWebDriver } from "./client"
import { IPHONE_HTTP_DELETE, IPHONE_HTTP_TIMEOUT_MS } from "./constants"
import { IPHONE_HTTP_EMPTY_SCHEMA } from "./schemas"

export async function closeIphoneWebDriverSession(
  url: string,
  signal: AbortSignal,
  selection?: IphoneWdaSelection,
): Promise<void> {
  try {
    await requestIphoneWebDriver(url, IPHONE_HTTP_DELETE, "", signal, IPHONE_HTTP_TIMEOUT_MS, IPHONE_HTTP_EMPTY_SCHEMA)
  } finally {
    if (selection?.kind === IPHONE_WDA_REQUIRED) {
      await selection.admission.release()
    }
  }
}
