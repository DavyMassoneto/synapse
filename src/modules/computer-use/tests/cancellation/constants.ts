import {
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_IMAGE_ABSENT,
  type ComputerDriverCallResult,
  type ComputerExecutionContext,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerTestWait } from "../doubles"

export const COMPUTER_CANCELLATION_CONTEXT: ComputerExecutionContext = { sessionId: "test", modelSupportsImages: true }

export const COMPUTER_CANCELLATION_DEPENDENCIES: ComputerUseDependencies = {
  platform: "darwin",
  installationDirectory: "unused",
  captureDirectory: "unused",
  environment: {},
  wait: new ComputerTestWait(),
}

export const COMPUTER_CANCELLATION_RESPONSE: ComputerDriverCallResult = {
  kind: COMPUTER_DRIVER_RESPONSE,
  envelope: {
    message: "confirmed evidence",
    isError: false,
    windows: [],
    applications: [],
    elements: [],
    tree: "",
    image: { kind: COMPUTER_IMAGE_ABSENT },
    verified: true,
  },
}
