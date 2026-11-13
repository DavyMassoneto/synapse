import { type IphoneActionArguments } from "#synapse/modules/iphone/public/contracts"

import { requestIphoneWebDriver } from "./client"
import { IPHONE_HTTP_MOBILE_PREFIX, IPHONE_HTTP_POST, IPHONE_HTTP_TIMEOUT_MS } from "./constants"
import { type IphoneHttpMobileSchema } from "./types"

export async function requestIphoneMobile(
  url: string,
  script: string,
  args: IphoneActionArguments,
  signal: AbortSignal,
  schema: IphoneHttpMobileSchema,
): Promise<void> {
  await requestIphoneWebDriver(
    url,
    IPHONE_HTTP_POST,
    JSON.stringify({ script: IPHONE_HTTP_MOBILE_PREFIX + script, args: [args] }),
    signal,
    IPHONE_HTTP_TIMEOUT_MS,
    schema,
  )
}
