import {
  COMPUTER_AX_FORMAT,
  COMPUTER_MODE_SOM,
  COMPUTER_MODE_VISION,
  type ComputerCapture,
  type ComputerCaptureAction,
  type ComputerCaptureMode,
  type ComputerDriverArguments,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_TREE_READ, computerReadElementTree } from "../element-tree-reading"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_SCREEN,
  COMPUTER_TARGET_SELECTED,
  type ComputerTargetSelection,
} from "../window-targeting"
import {
  COMPUTER_DISPATCH_DESKTOP_STATE,
  COMPUTER_DISPATCH_JPEG_FORMAT,
  COMPUTER_DISPATCH_JPEG_QUALITY,
  COMPUTER_DISPATCH_MAX_ELEMENTS,
  COMPUTER_DISPATCH_SCREEN_APP,
  COMPUTER_DISPATCH_SCREENSHOT,
  COMPUTER_DISPATCH_WINDOW_STATE,
} from "./constants"
import { type ComputerPreparedCapture } from "./types"

export function computerPrepareCapture(
  action: ComputerCaptureAction,
  selection: ComputerTargetSelection,
): ComputerPreparedCapture {
  const argumentsValue: ComputerDriverArguments = { max_elements: COMPUTER_DISPATCH_MAX_ELEMENTS }
  let mode: ComputerCaptureMode = COMPUTER_MODE_SOM
  if (action.mode) {
    mode = action.mode
  }
  let tool = mode === COMPUTER_MODE_VISION ? COMPUTER_DISPATCH_SCREENSHOT : COMPUTER_DISPATCH_WINDOW_STATE
  if (tool === COMPUTER_DISPATCH_SCREENSHOT) {
    argumentsValue.format = COMPUTER_DISPATCH_JPEG_FORMAT
    argumentsValue.quality = COMPUTER_DISPATCH_JPEG_QUALITY
  }
  let app = COMPUTER_DISPATCH_SCREEN_APP
  if (selection.kind === COMPUTER_TARGET_SELECTED) {
    argumentsValue.pid = selection.window.pid
    argumentsValue.window_id = selection.window.windowId
    app = selection.window.app
  } else if (selection.kind === COMPUTER_EXACT_TARGET_SELECTED) {
    argumentsValue.pid = selection.pid
    argumentsValue.window_id = selection.windowId
  } else if (selection.kind === COMPUTER_TARGET_SCREEN) {
    tool = COMPUTER_DISPATCH_DESKTOP_STATE
    mode = COMPUTER_MODE_VISION
  } else {
    throw new Error(selection.message)
  }
  return { tool, arguments: argumentsValue, mode, app }
}

export function computerCaptureFromEnvelope(
  prepared: ComputerPreparedCapture,
  envelope: ComputerDriverEnvelope,
): ComputerCapture {
  const tree = computerReadElementTree(envelope.tree, COMPUTER_AX_FORMAT)
  if (tree.kind !== COMPUTER_TREE_READ) {
    throw new Error(tree.format)
  }
  const elements = envelope.elements.length ? envelope.elements : tree.elements
  for (const element of elements) {
    element.app = prepared.app
  }
  return {
    mode: prepared.mode,
    app: prepared.app,
    image: envelope.image,
    elements,
    windowTitle: tree.windowTitle,
    note: "",
    axMaxElements: COMPUTER_DISPATCH_MAX_ELEMENTS,
  }
}
