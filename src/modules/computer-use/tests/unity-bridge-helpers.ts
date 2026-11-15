import {
  COMPUTER_UNITY_BRIDGE_CLICK_OP,
  type ComputerUnityBridgeFacts,
  type ComputerUnityBridgeFactsResult,
  type ComputerUnityBridgeGeometry,
  type ComputerUnityBridgeRequest,
  type ComputerUnityBridgeValidation,
  computerUnityBridgeGeometry,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_DRIVER_RESPONSE,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_Y,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
} from "./unity-bridge-constants"
import { computerUnityBridgeTestGeometry } from "./unity-bridge-support"
import { type ComputerUnityBridgeTestPoint } from "./unity-bridge-types"

export function computerUnityBridgeTestDomainGeometry(clientY: number): ComputerUnityBridgeGeometry {
  return computerUnityBridgeGeometry(computerUnityBridgeTestGeometry(clientY))
}

export function computerUnityBridgeTestRejectedReason(validation: ComputerUnityBridgeValidation): string {
  if (validation.kind === "handshake-invalid") {
    return validation.reason
  }
  throw new Error("esperava handshake inválido")
}

export function computerUnityBridgeTestFacts(result: ComputerUnityBridgeFactsResult): ComputerUnityBridgeFacts {
  if (result.kind !== "facts-valid") {
    throw new Error("esperava fatos válidos")
  }
  return result.facts
}

export function computerUnityBridgeTestEnvelope(result: ComputerDriverCallResult): ComputerDriverEnvelope {
  if (result.kind !== COMPUTER_DRIVER_RESPONSE) {
    throw new Error("esperava resposta do driver")
  }
  return result.envelope
}

export function computerUnityBridgeTestCaptureArguments(): ComputerDriverArguments {
  return { pid: COMPUTER_UNITY_BRIDGE_TEST_PID, window_id: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID }
}

export function computerUnityBridgeTestClickArguments(x: number, y: number): ComputerDriverArguments {
  return { pid: COMPUTER_UNITY_BRIDGE_TEST_PID, window_id: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID, x, y }
}

export function computerUnityBridgeTestFofocasArguments(): ComputerDriverArguments {
  return computerUnityBridgeTestClickArguments(
    COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_X,
    COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_Y,
  )
}

export function computerUnityBridgeTestClickPoint(
  requests: ComputerUnityBridgeRequest[],
): ComputerUnityBridgeTestPoint {
  const clicks = requests.filter((request) => request.op === COMPUTER_UNITY_BRIDGE_CLICK_OP)
  const click = clicks[0]
  if (!click) {
    throw new Error("esperava um clique na bridge")
  }
  if (typeof click.x === "number" && typeof click.y === "number") {
    return { x: click.x, y: click.y }
  }
  throw new Error("esperava coordenadas no clique da bridge")
}

export function computerUnityBridgeTestClickCount(requests: ComputerUnityBridgeRequest[]): number {
  return requests.filter((request) => request.op === COMPUTER_UNITY_BRIDGE_CLICK_OP).length
}

export function computerUnityBridgeTestRequest(
  requests: ComputerUnityBridgeRequest[],
  op: string,
): ComputerUnityBridgeRequest {
  const found = requests.find((request) => request.op === op)
  if (!found) {
    throw new Error(`esperava uma requisição ${op} na bridge`)
  }
  return found
}

export function computerUnityBridgeTestOpCount(requests: ComputerUnityBridgeRequest[], op: string): number {
  return requests.filter((request) => request.op === op).length
}
