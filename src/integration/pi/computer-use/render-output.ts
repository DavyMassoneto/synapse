import { COMPUTER_IMAGE_PRESENT, type ComputerExecuteResult, type ComputerRenderedScreenshot } from "#synapse/modules"
import { PI_COMPUTER_IMAGE_CONTENT, PI_COMPUTER_TEXT_CONTENT } from "./constants"
import { isComputerToolError } from "./predicates"
import { type PiComputerCaptureText, type PiComputerToolOutput } from "./types"

export function computerToolOutput(result: ComputerExecuteResult): PiComputerToolOutput {
  const output: PiComputerToolOutput = {
    content: [],
    details: { result },
    isError: isComputerToolError(result),
  }
  if ("capture" in result && result.capture) {
    const capture = result.capture
    output.content.push({
      type: PI_COMPUTER_TEXT_CONTENT,
      text: JSON.stringify({ ...result, capture: computerCaptureText(capture) }),
    })
    computerAppendImage(output, capture)
  } else {
    output.content.push({ type: PI_COMPUTER_TEXT_CONTENT, text: JSON.stringify(result) })
  }
  return output
}

function computerCaptureText(capture: ComputerRenderedScreenshot): PiComputerCaptureText {
  const { image: _image, ...text } = capture
  return text
}

function computerAppendImage(output: PiComputerToolOutput, capture: ComputerRenderedScreenshot): void {
  if (capture.image.kind === COMPUTER_IMAGE_PRESENT) {
    output.content.push({ type: PI_COMPUTER_IMAGE_CONTENT, data: capture.image.data, mimeType: capture.image.mime })
  }
}

export function computerToolError(message: string): PiComputerToolOutput {
  return { content: [{ type: PI_COMPUTER_TEXT_CONTENT, text: message }], details: { error: message }, isError: true }
}
