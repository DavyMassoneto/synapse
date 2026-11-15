import {
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_IMAGE_PRESENT,
  type ComputerDriverCallResult,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeMeasurement } from "./action"

export function computerUnityBridgeCaptureMeasurement(
  result: ComputerDriverCallResult,
): ComputerUnityBridgeMeasurement {
  if (result.kind !== COMPUTER_DRIVER_RESPONSE) {
    return {}
  }
  const image = result.envelope.image
  if (image.kind !== COMPUTER_IMAGE_PRESENT) {
    return {}
  }
  return { image: { width: image.width, height: image.height } }
}
