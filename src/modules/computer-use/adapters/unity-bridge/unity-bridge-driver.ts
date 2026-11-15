import { computerCheckCancellation } from "#synapse/modules/computer-use/internal/execution-cancellation"
import {
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerUnityBridgeConfiguration,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeCapture } from "./action"
import { ComputerUnityBridgeAttachment } from "./attachment"
import { computerUnityBridgeCaptureMeasurement } from "./bridge-capture"
import {
  computerUnityBridgeMerged,
  computerUnityBridgeNativeCount,
  computerUnityBridgeRoom,
} from "./bridge-capture-merge"
import { ComputerUnityBridgeConnection } from "./bridge-connection"
import { computerUnityBridgeAwaitBridge, computerUnityBridgeEnsureBridge } from "./bridge-discovery-flow"
import { computerUnityBridgeInputPlan } from "./bridge-input"
import {
  computerUnityBridgeActionTransportResult,
  computerUnityBridgeRejection,
  computerUnityBridgeUnavailable,
} from "./bridge-result"
import { computerUnityBridgeTargetKey, computerUnityBridgeTargetLookup } from "./bridge-target"
import { computerUnityBridgeCapturedWindow } from "./bridge-window-capture"
import {
  COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED,
  COMPUTER_UNITY_BRIDGE_ATTACH_FAILED,
  COMPUTER_UNITY_BRIDGE_ATTACH_FAILED_TEXT,
  COMPUTER_UNITY_BRIDGE_ATTACH_INCOMPLETE_TEXT,
  COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED_TEXT,
  COMPUTER_UNITY_BRIDGE_ATTACH_UNITY_ONLY,
  COMPUTER_UNITY_BRIDGE_CLICK_TIMEOUT_MILLISECONDS,
} from "./constants"
import { computerDiscoverUnityBridge } from "./discovery"
import { type ComputerUnityBridgeReady } from "./handshake"
import { isComputerUnityBridgeCaptureTool, isComputerUnityBridgeInputTool } from "./predicates"
import { type ComputerUnityBridgeCommandRunner, type ComputerUnityBridgeTarget } from "./types"

export class ComputerUnityBridgeDriver implements ComputerDriverPort {
  private readonly driver: ComputerDriverPort
  private readonly configuration: ComputerUnityBridgeConfiguration
  private readonly attachment: ComputerUnityBridgeAttachment
  private readonly captures = new Map<string, ComputerUnityBridgeCapture>()

  constructor(
    driver: ComputerDriverPort,
    configuration: ComputerUnityBridgeConfiguration,
    commands: ComputerUnityBridgeCommandRunner,
  ) {
    this.driver = driver
    this.configuration = configuration
    this.attachment = new ComputerUnityBridgeAttachment(configuration, commands)
  }

  start(): Promise<ComputerDriverTool[]> {
    return this.driver.start()
  }

  stop(): Promise<void> {
    this.captures.clear()
    this.attachment.reset()
    return this.driver.stop()
  }

  async call(
    name: string,
    argumentsValue: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    if (isComputerUnityBridgeCaptureTool(name)) {
      return this.captureCall(name, argumentsValue, signal)
    }
    if (!isComputerUnityBridgeInputTool(name)) {
      return this.driver.call(name, argumentsValue, signal)
    }
    const lookup = computerUnityBridgeTargetLookup(argumentsValue)
    if (!lookup.target) {
      return this.driver.call(name, argumentsValue, signal)
    }
    return this.routeInput(name, argumentsValue, lookup.target, signal)
  }

  private async captureCall(
    name: string,
    argumentsValue: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    const result = await this.driver.call(name, argumentsValue, signal)
    return this.recordCapture(name, argumentsValue, result, signal)
  }

  private async recordCapture(
    name: string,
    argumentsValue: ComputerDriverArguments,
    result: ComputerDriverCallResult,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    const lookup = computerUnityBridgeTargetLookup(argumentsValue)
    const measurement = computerUnityBridgeCaptureMeasurement(result)
    if (!lookup.target || !measurement.image) {
      this.captures.clear()
      return result
    }
    const room = computerUnityBridgeRoom(name, argumentsValue, result)
    const discovery = await computerUnityBridgeEnsureBridge(this.configuration, this.attachment, lookup.target, signal)
    const captured = await computerUnityBridgeCapturedWindow(
      lookup.target,
      measurement.image,
      room,
      computerUnityBridgeNativeCount(result),
      discovery,
    )
    this.captures.set(computerUnityBridgeTargetKey(lookup.target), captured.capture)
    return computerUnityBridgeMerged(name, result, captured)
  }

  private async routeInput(
    name: string,
    argumentsValue: ComputerDriverArguments,
    target: ComputerUnityBridgeTarget,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    computerCheckCancellation(signal)
    const discovery = await computerDiscoverUnityBridge(this.configuration, target)
    if (discovery.kind === "bridge-ready") {
      return this.inputThroughBridge(name, argumentsValue, target, discovery, signal)
    }
    return this.inputWithoutBridge(name, argumentsValue, target, signal)
  }

  private async inputWithoutBridge(
    name: string,
    argumentsValue: ComputerDriverArguments,
    target: ComputerUnityBridgeTarget,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    const attachment = await this.attachment.attach(target, signal)
    if (attachment.kind === COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED) {
      return this.inputAfterAttach(name, argumentsValue, target, signal)
    }
    if (attachment.kind === COMPUTER_UNITY_BRIDGE_ATTACH_FAILED) {
      return computerUnityBridgeUnavailable(target, `${COMPUTER_UNITY_BRIDGE_ATTACH_FAILED_TEXT}${attachment.detail}`)
    }
    if (attachment.kind === COMPUTER_UNITY_BRIDGE_ATTACH_UNITY_ONLY) {
      return computerUnityBridgeUnavailable(target, COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED_TEXT)
    }
    return this.driver.call(name, argumentsValue, signal)
  }

  private async inputAfterAttach(
    name: string,
    argumentsValue: ComputerDriverArguments,
    target: ComputerUnityBridgeTarget,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    const discovery = await computerUnityBridgeAwaitBridge(this.configuration, target)
    if (discovery.kind === "bridge-ready") {
      return this.inputThroughBridge(name, argumentsValue, target, discovery, signal)
    }
    return computerUnityBridgeUnavailable(target, COMPUTER_UNITY_BRIDGE_ATTACH_INCOMPLETE_TEXT)
  }

  private async inputThroughBridge(
    name: string,
    argumentsValue: ComputerDriverArguments,
    target: ComputerUnityBridgeTarget,
    ready: ComputerUnityBridgeReady,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    const capture = this.captures.get(computerUnityBridgeTargetKey(target))
    const plan = computerUnityBridgeInputPlan(name, argumentsValue, target, ready, capture)
    if (plan.kind === "input-refused") {
      return computerUnityBridgeRejection(plan.message)
    }
    if (plan.kind === "input-native") {
      return this.driver.call(name, argumentsValue, signal)
    }
    computerCheckCancellation(signal)
    const connection = new ComputerUnityBridgeConnection(
      ready.port,
      plan.request,
      COMPUTER_UNITY_BRIDGE_CLICK_TIMEOUT_MILLISECONDS,
    )
    return computerUnityBridgeActionTransportResult(await connection.transact())
  }
}
