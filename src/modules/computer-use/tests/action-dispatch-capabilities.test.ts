import { describe, expect, test } from "vitest"
import { COMPUTER_TREE_FORMAT_ELEMENTS } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DISPATCH_MAX_ELEMENTS, ComputerActionDispatch } from "../internal"
import { ComputerCapabilityDriver } from "./action-dispatch-capabilities-driver"
import { ComputerTestCaptureStorage, ComputerTestWait } from "./doubles"

async function modernCaptureUsesDeclaredArguments(): Promise<void> {
  const driver = new ComputerCapabilityDriver()
  const dispatch = new ComputerActionDispatch(
    driver,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  await dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })

  expect(driver.windowStateCalls[0]?.tree_format).toBe(COMPUTER_TREE_FORMAT_ELEMENTS)
  expect(driver.windowStateCalls[0]?.max_elements).toBe(COMPUTER_DISPATCH_MAX_ELEMENTS)
}

describe("capacidades descobertas no despacho de captura", () => {
  test("envia tree_format e max_elements declarados pelo driver", modernCaptureUsesDeclaredArguments)
})
