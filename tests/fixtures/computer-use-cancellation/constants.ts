import {
  type ComputerExecutedAction,
  type ComputerExecuteResult,
  type ComputerRenderedScreenshot,
} from "#synapse/modules"

export const COMPUTER_CANCELLATION_COMPLETED: ComputerExecutedAction = {
  kind: "computer-executed",
  result: { kind: "completed", action: "click", message: "confirmed" },
  verdict: { decision: "stop", retryAllowed: false },
}

export const COMPUTER_CANCELLATION_UNKNOWN: ComputerExecuteResult = {
  kind: "computer-executed",
  result: { kind: "outcome-unknown", action: "click", message: "uncertain", retryAllowed: false },
  verdict: { decision: "stop", retryAllowed: false },
}

export const COMPUTER_CANCELLATION_REFUSED: ComputerExecuteResult = {
  kind: "computer-executed",
  result: { kind: "refused", action: "key", message: "unsafe" },
  verdict: { decision: "stop", retryAllowed: false },
}

export const COMPUTER_CANCELLATION_FAILED: ComputerExecuteResult = {
  kind: "computer-executed",
  result: { kind: "failed", action: "click", message: "failed" },
  verdict: { decision: "stop", retryAllowed: false },
}

export const COMPUTER_CANCELLATION_CAPTURE: ComputerRenderedScreenshot = {
  summary: "captured",
  elements: [],
  totalElements: 0,
  truncatedElements: 0,
  image: { kind: "image-absent" },
  omission: { kind: "image-omitted", reason: "not-needed" },
  scale: { kind: "scale-absent" },
  screenshotStorage: { kind: "capture-not-stored", message: "not-needed" },
  elementsStorage: { kind: "capture-not-stored", message: "not-needed" },
}

export const COMPUTER_CANCELLATION_SESSION = "cancellation-test"

export const COMPUTER_CANCELLATION_DIAGNOSTIC = "fake"

export const COMPUTER_CANCELLATION_CANCELLED: ComputerExecutedAction = {
  kind: "computer-executed",
  result: { kind: "cancelled", action: "click", message: "cancelled" },
  verdict: { decision: "stop", retryAllowed: false },
}

export const COMPUTER_CANCELLATION_CAPTURE_FAILURE = "captura cancelada após efeito confirmado"

export const COMPUTER_CANCELLATION_PRECEDING_EFFECTS: ComputerExecutedAction = {
  kind: "computer-executed",
  result: { kind: "cancelled", action: "click", message: "cancelled" },
  verdict: { decision: "stop", retryAllowed: false },
  precedingEffects: [{ kind: "completed", action: "focus_app", message: "focus-confirmed" }],
}
