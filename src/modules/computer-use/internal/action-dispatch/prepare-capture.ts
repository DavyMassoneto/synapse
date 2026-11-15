import {
  COMPUTER_MODE_SOM,
  COMPUTER_MODE_VISION,
  COMPUTER_TREE_FORMAT_ELEMENTS,
  type ComputerCapture,
  type ComputerCaptureAction,
  type ComputerCaptureMode,
  type ComputerDriverArguments,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import { computerReadElementTree } from "../element-tree-reading"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_SCREEN,
  COMPUTER_TARGET_SELECTED,
  type ComputerTargetSelection,
} from "../window-targeting"
import {
  COMPUTER_DISPATCH_DESKTOP_STATE,
  COMPUTER_DISPATCH_MAX_ELEMENTS,
  COMPUTER_DISPATCH_SCREEN_APP,
  COMPUTER_DISPATCH_WINDOW_STATE,
} from "./constants"
import { type ComputerPreparedCapture } from "./types"

export function computerPrepareCapture(
  action: ComputerCaptureAction,
  selection: ComputerTargetSelection,
): ComputerPreparedCapture {
  const argumentsValue: ComputerDriverArguments = {}
  let mode: ComputerCaptureMode = COMPUTER_MODE_SOM
  if (action.mode) {
    mode = action.mode
  }
  let tool = COMPUTER_DISPATCH_WINDOW_STATE
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
  if (tool === COMPUTER_DISPATCH_WINDOW_STATE) {
    argumentsValue.max_elements = COMPUTER_DISPATCH_MAX_ELEMENTS
    argumentsValue.tree_format = COMPUTER_TREE_FORMAT_ELEMENTS
  }
  return { tool, arguments: argumentsValue, mode, app }
}

export function computerCaptureFromEnvelope(
  prepared: ComputerPreparedCapture,
  envelope: ComputerDriverEnvelope,
): ComputerCapture {
  const tree = computerReadElementTree(envelope.tree)
  const elements = envelope.elements.length ? envelope.elements : tree.elements
  let app = prepared.app
  const elementApp = elements[0]?.app
  if (prepared.app === COMPUTER_DISPATCH_SCREEN_APP && elementApp) {
    app = elementApp
  }
  for (const element of elements) {
    element.app = app
  }
  return {
    mode: prepared.mode,
    app,
    image: envelope.image,
    elements,
    windowTitle: tree.windowTitle,
    note: "",
    axMaxElements: COMPUTER_DISPATCH_MAX_ELEMENTS,
  }
}
