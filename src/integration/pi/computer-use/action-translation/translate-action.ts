import {
  COMPUTER_CAPTURE,
  COMPUTER_CLICK,
  COMPUTER_DOUBLE_CLICK,
  COMPUTER_DRAG,
  COMPUTER_FOCUS_APP,
  COMPUTER_KEY,
  COMPUTER_LIST_APPS,
  COMPUTER_LIST_WINDOWS,
  COMPUTER_MIDDLE_CLICK,
  COMPUTER_RIGHT_CLICK,
  COMPUTER_SCROLL,
  COMPUTER_SET_VALUE,
  COMPUTER_TYPE,
  COMPUTER_WAIT,
  type ComputerAction,
  type ComputerCoordinate,
  type ComputerPointerOptions,
} from "#synapse/modules"
import {
  PI_COMPUTER_REQUIRED_APP,
  PI_COMPUTER_REQUIRED_KEYS,
  PI_COMPUTER_REQUIRED_TEXT,
  PI_COMPUTER_REQUIRED_VALUE,
  type PiComputerInput,
} from "../tool-schema"
import { type PiComputerCoordinate, type PiComputerMouseOptions, type PiComputerScopedInputOptions } from "./types"

function computerInputOptions(input: PiComputerInput): PiComputerScopedInputOptions {
  const options: PiComputerScopedInputOptions = {}
  if (input.app) {
    options.app = input.app
  }
  if (input.delivery_mode) {
    options.deliveryMode = input.delivery_mode
  }
  if (typeof input.bring_to_front === "boolean") {
    options.bringToFront = input.bring_to_front
  }
  if (typeof input.capture_after === "boolean") {
    options.captureAfter = input.capture_after
  }
  if (input.scope) {
    options.scope = input.scope
  }
  return options
}

function computerPointerOptions(input: PiComputerInput): ComputerPointerOptions {
  const options: ComputerPointerOptions = computerInputOptions(input)
  if (typeof input.element === "number") {
    options.element = input.element
  }
  if (input.coordinate) {
    options.coordinate = computerCoordinate(input.coordinate)
  }
  Object.assign(options, computerMouseOptions(input))
  return options
}

export function translateComputerAction(input: PiComputerInput): ComputerAction {
  switch (input.action) {
    case COMPUTER_CLICK:
    case COMPUTER_DOUBLE_CLICK:
    case COMPUTER_RIGHT_CLICK:
    case COMPUTER_MIDDLE_CLICK:
      return { action: input.action, ...computerPointerOptions(input) }
    case COMPUTER_TYPE:
      return computerTypeAction(input)
    case COMPUTER_KEY:
      return computerKeyAction(input)
    case COMPUTER_SET_VALUE:
      return computerValueAction(input)
    case COMPUTER_FOCUS_APP:
      return computerFocusAction(input)
    case COMPUTER_CAPTURE:
      return computerCaptureAction(input)
    case COMPUTER_DRAG:
      return computerDragAction(input)
    case COMPUTER_SCROLL:
      return computerScrollAction(input)
    case COMPUTER_WAIT:
      return { action: input.action, ...(typeof input.seconds === "number" ? { seconds: input.seconds } : {}) }
    case COMPUTER_LIST_APPS:
    case COMPUTER_LIST_WINDOWS:
      return { action: input.action }
  }
}

function computerCaptureAction(input: PiComputerInput): ComputerAction {
  return {
    action: COMPUTER_CAPTURE,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.app ? { app: input.app } : {}),
    ...(typeof input.pid === "number" ? { pid: input.pid } : {}),
    ...(typeof input.window_id === "number" ? { windowId: input.window_id } : {}),
  }
}

function computerDragAction(input: PiComputerInput): ComputerAction {
  return {
    action: COMPUTER_DRAG,
    ...computerInputOptions(input),
    ...(typeof input.from_element === "number" ? { fromElement: input.from_element } : {}),
    ...(typeof input.to_element === "number" ? { toElement: input.to_element } : {}),
    ...(input.from_coordinate ? { fromCoordinate: computerCoordinate(input.from_coordinate) } : {}),
    ...(input.to_coordinate ? { toCoordinate: computerCoordinate(input.to_coordinate) } : {}),
    ...computerMouseOptions(input),
  }
}

function computerScrollAction(input: PiComputerInput): ComputerAction {
  return {
    action: COMPUTER_SCROLL,
    ...computerInputOptions(input),
    ...(typeof input.element === "number" ? { element: input.element } : {}),
    ...(input.coordinate ? { coordinate: computerCoordinate(input.coordinate) } : {}),
    ...(input.direction ? { direction: input.direction } : {}),
    ...(typeof input.amount === "number" ? { amount: input.amount } : {}),
  }
}

function computerTypeAction(input: PiComputerInput): ComputerAction {
  if (!(typeof input.text === "string")) {
    throw new Error(PI_COMPUTER_REQUIRED_TEXT)
  }
  return {
    action: COMPUTER_TYPE,
    text: input.text,
    ...computerInputOptions(input),
  }
}

function computerKeyAction(input: PiComputerInput): ComputerAction {
  if (!(typeof input.keys === "string")) {
    throw new Error(PI_COMPUTER_REQUIRED_KEYS)
  }
  return {
    action: COMPUTER_KEY,
    keys: input.keys,
    ...computerInputOptions(input),
  }
}

function computerValueAction(input: PiComputerInput): ComputerAction {
  if (!(typeof input.element === "number") || !(typeof input.value === "string")) {
    throw new Error(PI_COMPUTER_REQUIRED_VALUE)
  }
  return {
    action: COMPUTER_SET_VALUE,
    element: input.element,
    value: input.value,
    ...(input.app ? { app: input.app } : {}),
    ...(typeof input.capture_after === "boolean" ? { captureAfter: input.capture_after } : {}),
  }
}

function computerFocusAction(input: PiComputerInput): ComputerAction {
  if (!input.app) {
    throw new Error(PI_COMPUTER_REQUIRED_APP)
  }
  return {
    action: COMPUTER_FOCUS_APP,
    app: input.app,
    ...(typeof input.raise_window === "boolean" ? { raiseWindow: input.raise_window } : {}),
  }
}

function computerCoordinate(coordinate: PiComputerCoordinate): ComputerCoordinate {
  return { x: coordinate[0], y: coordinate[1] }
}

function computerMouseOptions(input: PiComputerInput): PiComputerMouseOptions {
  const options: PiComputerMouseOptions = {}
  if (input.button) {
    options.button = input.button
  }
  if (input.modifiers) {
    options.modifiers = input.modifiers
  }
  return options
}
