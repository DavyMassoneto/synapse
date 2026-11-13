import {
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PNG_MIME,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_CAPTURE_TEST_PIXELS } from "./capture-files-constants"

export function computerTestCaptureImage(): ComputerPresentImage {
  return {
    kind: COMPUTER_IMAGE_PRESENT,
    data: Buffer.from(COMPUTER_CAPTURE_TEST_PIXELS).toString("base64"),
    mime: COMPUTER_PNG_MIME,
    width: 1,
    height: 1,
  }
}
