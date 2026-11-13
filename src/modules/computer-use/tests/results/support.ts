import { ComputerUseService } from "#synapse/modules/computer-use/internal"
import { type ComputerDriverPort, type ComputerDriverResponse } from "#synapse/modules/computer-use/public"
import { ComputerTestWait } from "../doubles"
import { computerTestCapture, computerTestWindow } from "../support"
import { ComputerResultsInfrastructure } from "./infrastructure"

export function computerResultsResponse(): ComputerDriverResponse {
  const capture = computerTestCapture()
  return {
    kind: "driver-response",
    envelope: {
      message: "confirmed",
      isError: false,
      windows: [computerTestWindow("Editor", 1, 0)],
      applications: [],
      elements: capture.elements,
      tree: "",
      image: capture.image,
      verified: true,
    },
  }
}

export function computerResultsService(driver: ComputerDriverPort): ComputerUseService {
  return new ComputerUseService(
    {
      platform: "darwin",
      installationDirectory: "unused",
      captureDirectory: "unused",
      wait: new ComputerTestWait(),
      environment: {},
    },
    new ComputerResultsInfrastructure(driver),
  )
}
