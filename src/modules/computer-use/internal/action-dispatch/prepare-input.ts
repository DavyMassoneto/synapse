import {
  COMPUTER_CLICK,
  COMPUTER_DOUBLE_CLICK,
  COMPUTER_DRAG,
  COMPUTER_KEY,
  COMPUTER_MIDDLE_CLICK,
  COMPUTER_RIGHT_CLICK,
  COMPUTER_SCROLL,
  COMPUTER_SET_VALUE,
  COMPUTER_TYPE,
  type ComputerDragAction,
  type ComputerDriverArguments,
  type ComputerPlatform,
  type ComputerPointerOptions,
  type ComputerScrollAction,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_KEY_PARSED, computerParseKeyCombo } from "../key-combo-parsing"
import {
  COMPUTER_DISPATCH_AMOUNT_PROPERTY,
  COMPUTER_DISPATCH_BAD_KEY,
  COMPUTER_DISPATCH_BAD_POINTER,
  COMPUTER_DISPATCH_DESKTOP_SCOPE,
  COMPUTER_DISPATCH_DOWN_DIRECTION,
  COMPUTER_DISPATCH_FROM_PROPERTY,
  COMPUTER_DISPATCH_HOTKEY,
  COMPUTER_DISPATCH_LEFT_BUTTON,
  COMPUTER_DISPATCH_MIDDLE_BUTTON,
  COMPUTER_DISPATCH_PRESS_KEY,
  COMPUTER_DISPATCH_RIGHT_BUTTON,
  COMPUTER_DISPATCH_SCROLL_AMOUNT,
  COMPUTER_DISPATCH_SCROLL_MAX,
  COMPUTER_DISPATCH_SCROLL_MIN,
  COMPUTER_DISPATCH_SET_VALUE,
  COMPUTER_DISPATCH_TO_PROPERTY,
  COMPUTER_DISPATCH_TYPE_TEXT,
  COMPUTER_PREPARED_TARGET_ABSENT,
  COMPUTER_PREPARED_TARGET_COORDINATE,
  COMPUTER_PREPARED_TARGET_ELEMENT,
} from "./constants"
import {
  type ComputerClickInputAction,
  type ComputerDispatchPreparedInput,
  type ComputerDispatchTarget,
  type ComputerInputAction,
} from "./types"

export function computerPrepareInput(
  action: ComputerInputAction,
  platform: ComputerPlatform,
): ComputerDispatchPreparedInput {
  const argumentsValue: ComputerDriverArguments = {}
  switch (action.action) {
    case COMPUTER_CLICK:
    case COMPUTER_DOUBLE_CLICK:
    case COMPUTER_RIGHT_CLICK:
    case COMPUTER_MIDDLE_CLICK:
      return computerPrepareClick(action, argumentsValue)
    case COMPUTER_DRAG:
      return computerPrepareDrag(action, argumentsValue)
    case COMPUTER_SCROLL:
      return computerPrepareScroll(action, argumentsValue)
    case COMPUTER_TYPE:
      argumentsValue.text = action.text
      if (action.scope === COMPUTER_DISPATCH_DESKTOP_SCOPE) {
        argumentsValue.scope = action.scope
      }
      return {
        tool: COMPUTER_DISPATCH_TYPE_TEXT,
        arguments: argumentsValue,
        target: { kind: COMPUTER_PREPARED_TARGET_ABSENT },
      }
    case COMPUTER_KEY:
      return computerPrepareKey(action.keys, argumentsValue, platform)
    case COMPUTER_SET_VALUE:
      argumentsValue.element_index = action.element
      argumentsValue.value = action.value
      return {
        tool: COMPUTER_DISPATCH_SET_VALUE,
        arguments: argumentsValue,
        target: { kind: COMPUTER_PREPARED_TARGET_ELEMENT, index: action.element },
      }
  }
}

function computerPreparePointer(
  action: ComputerPointerOptions,
  argumentsValue: ComputerDriverArguments,
): ComputerDispatchTarget {
  if (typeof action.element === "number") {
    argumentsValue.element_index = action.element
    return { kind: COMPUTER_PREPARED_TARGET_ELEMENT, index: action.element }
  }
  if (action.coordinate) {
    argumentsValue.x = action.coordinate.x
    argumentsValue.y = action.coordinate.y
    return { kind: COMPUTER_PREPARED_TARGET_COORDINATE, x: action.coordinate.x, y: action.coordinate.y }
  }
  throw new Error(COMPUTER_DISPATCH_BAD_POINTER)
}

function computerPrepareDrag(
  action: ComputerDragAction,
  argumentsValue: ComputerDriverArguments,
): ComputerDispatchPreparedInput {
  if (COMPUTER_DISPATCH_FROM_PROPERTY in action && COMPUTER_DISPATCH_TO_PROPERTY in action) {
    argumentsValue.from_element = action.fromElement
    argumentsValue.to_element = action.toElement
  } else if (action.fromCoordinate && action.toCoordinate) {
    argumentsValue.from_x = Math.trunc(action.fromCoordinate.x)
    argumentsValue.from_y = Math.trunc(action.fromCoordinate.y)
    argumentsValue.to_x = Math.trunc(action.toCoordinate.x)
    argumentsValue.to_y = Math.trunc(action.toCoordinate.y)
  } else {
    throw new Error(COMPUTER_DISPATCH_BAD_POINTER)
  }
  if (action.modifiers) {
    argumentsValue.modifier = action.modifiers
  }
  return { tool: COMPUTER_DRAG, arguments: argumentsValue, target: { kind: COMPUTER_PREPARED_TARGET_ABSENT } }
}

function computerPrepareScroll(
  action: ComputerScrollAction,
  argumentsValue: ComputerDriverArguments,
): ComputerDispatchPreparedInput {
  argumentsValue.direction = COMPUTER_DISPATCH_DOWN_DIRECTION
  if (action.direction) {
    argumentsValue.direction = action.direction
  }
  let amount = COMPUTER_DISPATCH_SCROLL_AMOUNT
  if (COMPUTER_DISPATCH_AMOUNT_PROPERTY in action) {
    amount = action.amount
  }
  argumentsValue.amount = Math.max(COMPUTER_DISPATCH_SCROLL_MIN, Math.min(COMPUTER_DISPATCH_SCROLL_MAX, amount))
  let target: ComputerDispatchTarget = { kind: COMPUTER_PREPARED_TARGET_ABSENT }
  if (typeof action.element === "number") {
    argumentsValue.element_index = action.element
    target = { kind: COMPUTER_PREPARED_TARGET_ELEMENT, index: action.element }
  } else if (action.coordinate) {
    argumentsValue.x = action.coordinate.x
    argumentsValue.y = action.coordinate.y
    target = { kind: COMPUTER_PREPARED_TARGET_COORDINATE, x: action.coordinate.x, y: action.coordinate.y }
  }
  return { tool: COMPUTER_SCROLL, arguments: argumentsValue, target }
}

function computerPrepareKey(
  keys: string,
  argumentsValue: ComputerDriverArguments,
  platform: ComputerPlatform,
): ComputerDispatchPreparedInput {
  const combo = computerParseKeyCombo(keys, platform)
  if (combo.kind !== COMPUTER_KEY_PARSED) {
    throw new Error(COMPUTER_DISPATCH_BAD_KEY)
  }
  if (combo.modifiers.length) {
    argumentsValue.keys = [...combo.modifiers, combo.key]
    return {
      tool: COMPUTER_DISPATCH_HOTKEY,
      arguments: argumentsValue,
      target: { kind: COMPUTER_PREPARED_TARGET_ABSENT },
    }
  }
  argumentsValue.key = combo.key
  return {
    tool: COMPUTER_DISPATCH_PRESS_KEY,
    arguments: argumentsValue,
    target: { kind: COMPUTER_PREPARED_TARGET_ABSENT },
  }
}

function computerPrepareClick(
  action: ComputerClickInputAction,
  argumentsValue: ComputerDriverArguments,
): ComputerDispatchPreparedInput {
  const target = computerPreparePointer(action, argumentsValue)
  argumentsValue.button = COMPUTER_DISPATCH_LEFT_BUTTON
  if (action.button) {
    argumentsValue.button = action.button
  }
  if (action.action === COMPUTER_RIGHT_CLICK) {
    argumentsValue.button = COMPUTER_DISPATCH_RIGHT_BUTTON
  }
  if (action.action === COMPUTER_MIDDLE_CLICK) {
    argumentsValue.button = COMPUTER_DISPATCH_MIDDLE_BUTTON
  }
  if (action.modifiers) {
    argumentsValue.modifier = action.modifiers
  }
  return {
    tool: action.action === COMPUTER_DOUBLE_CLICK ? COMPUTER_DOUBLE_CLICK : COMPUTER_CLICK,
    arguments: argumentsValue,
    target,
  }
}
