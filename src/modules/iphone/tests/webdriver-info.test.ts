import { describe, expect, test } from "vitest"
import { createIphoneWebDriverSession } from "#synapse/modules/iphone/adapters/webdriver-http"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import {
  IPHONE_WEBDRIVER_INFO_ACCEPTS_DESCRIPTION,
  IPHONE_WEBDRIVER_INFO_ADDITIONAL_RESPONSE,
  IPHONE_WEBDRIVER_INFO_CONFIGURATION,
  IPHONE_WEBDRIVER_INFO_EXPECTED,
  IPHONE_WEBDRIVER_INFO_HOST,
  IPHONE_WEBDRIVER_INFO_MALFORMED_RESPONSE,
  IPHONE_WEBDRIVER_INFO_REJECTS_DESCRIPTION,
  IPHONE_WEBDRIVER_INFO_SCRIPT,
  IPHONE_WEBDRIVER_INFO_SUITE_DESCRIPTION,
} from "./constants"
import { TestIphoneHttpServer } from "./doubles"

async function rejectsMalformedInfoError(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(
      base,
      buildIphoneCapabilities(IPHONE_WEBDRIVER_INFO_CONFIGURATION, IPHONE_WEBDRIVER_INFO_HOST),
      new AbortController().signal,
    )
    server.response = JSON.stringify(IPHONE_WEBDRIVER_INFO_MALFORMED_RESPONSE)
    await expect(session.mobileInfo(IPHONE_WEBDRIVER_INFO_SCRIPT, new AbortController().signal)).rejects.toThrow()
  } finally {
    await server.stop()
  }
}

async function acceptsInfoWithAdditionalFields(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(
      base,
      buildIphoneCapabilities(IPHONE_WEBDRIVER_INFO_CONFIGURATION, IPHONE_WEBDRIVER_INFO_HOST),
      new AbortController().signal,
    )
    server.response = JSON.stringify(IPHONE_WEBDRIVER_INFO_ADDITIONAL_RESPONSE)
    expect(await session.mobileInfo(IPHONE_WEBDRIVER_INFO_SCRIPT, new AbortController().signal)).toMatchObject(
      IPHONE_WEBDRIVER_INFO_EXPECTED,
    )
  } finally {
    await server.stop()
  }
}

function suite(): void {
  test(IPHONE_WEBDRIVER_INFO_ACCEPTS_DESCRIPTION, acceptsInfoWithAdditionalFields)
  test(IPHONE_WEBDRIVER_INFO_REJECTS_DESCRIPTION, rejectsMalformedInfoError)
}

describe(IPHONE_WEBDRIVER_INFO_SUITE_DESCRIPTION, suite)
