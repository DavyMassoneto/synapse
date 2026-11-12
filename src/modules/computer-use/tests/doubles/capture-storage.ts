import {
  COMPUTER_CAPTURE_STORED,
  type ComputerCapture,
  type ComputerCaptureStoragePort,
  type ComputerCaptureStorageResult,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"

export class ComputerTestCaptureStorage implements ComputerCaptureStoragePort {
  images: ComputerPresentImage[] = []

  captures: ComputerCapture[] = []

  storeImage(image: ComputerPresentImage): ComputerCaptureStorageResult {
    this.images.push(image)
    return { kind: COMPUTER_CAPTURE_STORED, reference: "captura" }
  }

  storeElements(capture: ComputerCapture): ComputerCaptureStorageResult {
    this.captures.push(capture)
    return { kind: COMPUTER_CAPTURE_STORED, reference: "elementos" }
  }
}
