import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
  COMPUTER_UNITY_BRIDGE_ENDPOINT_PREFIX,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_FILE,
  COMPUTER_UNITY_BRIDGE_LISTENING_STATE,
  COMPUTER_UNITY_BRIDGE_OK_STATUS,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V2,
  COMPUTER_UNITY_BRIDGE_REFUSED_STATUS,
  COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY,
  COMPUTER_UNITY_BRIDGE_UNITY_WINDOW_CLASS,
  type ComputerUnityBridgeActionRecord,
  type ComputerUnityBridgeClickRecord,
  type ComputerUnityBridgeGeometryRecord,
  type ComputerUnityBridgeHandshakeRecord,
  type ComputerUnityBridgePingRecord,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_UNITY_BRIDGE_TEST_CAPTION_OFFSET,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_IMAGE_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_IMAGE_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_LABEL,
  COMPUTER_UNITY_BRIDGE_TEST_MAIN_THREAD_TICKS,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_X,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_Y,
} from "./unity-bridge-constants"
import {
  COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION,
  computerUnityBridgeTestEmptyTree,
  computerUnityBridgeTestTree,
} from "./unity-bridge-tree-support"
import {
  type ComputerUnityBridgeTestHandshakeInput,
  type ComputerUnityBridgeTestHarnessOptions,
  type ComputerUnityBridgeTestServerOptions,
} from "./unity-bridge-types"

export function computerUnityBridgeTestGeometry(clientY: number): ComputerUnityBridgeGeometryRecord {
  return {
    window: {
      x: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_X,
      y: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_Y,
      w: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_WIDTH,
      h: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_HEIGHT,
    },
    client: {
      x: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X,
      y: clientY,
      w: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
      h: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
    },
    caption_offset: COMPUTER_UNITY_BRIDGE_TEST_CAPTION_OFFSET,
    window_class: COMPUTER_UNITY_BRIDGE_UNITY_WINDOW_CLASS,
    hwnd: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
  }
}

export function computerUnityBridgeTestCapabilities(protocol: number): ComputerUnityBridgePingRecord["capabilities"] {
  if (protocol >= COMPUTER_UNITY_BRIDGE_PROTOCOL_V2) {
    return {
      tree: true,
      hit: true,
      click: true,
      key: true,
      text: true,
      scroll: true,
      drag: true,
      ids: true,
      texts: true,
      generation: true,
    }
  }
  return { tree: true, hit: true, click: true, key: false, text: false }
}

export function computerUnityBridgeTestHandshake(
  input: ComputerUnityBridgeTestHandshakeInput,
): ComputerUnityBridgeHandshakeRecord {
  return {
    protocol: input.protocol,
    state: COMPUTER_UNITY_BRIDGE_LISTENING_STATE,
    pid: COMPUTER_UNITY_BRIDGE_TEST_PID,
    process_name: "MM.exe",
    instance: input.instance,
    token: input.token,
    port: input.port,
    endpoint: `${COMPUTER_UNITY_BRIDGE_ENDPOINT_PREFIX}${input.port}`,
    unity_version: "5.3.8f2",
    scene: "TrackFrontEnd",
    unity_screen: input.screen,
    event_system: true,
    gameobject_created: true,
    main_thread_captured: true,
    geometry: input.geometry,
    capabilities: computerUnityBridgeTestCapabilities(input.protocol),
  }
}

export function computerUnityBridgeTestPing(
  options: ComputerUnityBridgeTestServerOptions,
): ComputerUnityBridgePingRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_OK_STATUS,
    protocol: options.protocol,
    pid: options.pid,
    instance: options.instance,
    main_thread_ticks: COMPUTER_UNITY_BRIDGE_TEST_MAIN_THREAD_TICKS,
    main_thread_captured: true,
    gameobject_created: true,
    state: COMPUTER_UNITY_BRIDGE_LISTENING_STATE,
    unity_version: "5.3.8f2",
    scene: "TrackFrontEnd",
    screen: options.screen,
    event_system: true,
    geometry: options.geometry,
    capabilities: computerUnityBridgeTestCapabilities(options.protocol),
    generation: options.generation,
  }
}

export function computerWriteUnityBridgeTestHandshake(
  directory: string,
  record: ComputerUnityBridgeHandshakeRecord,
): void {
  mkdirSync(join(directory, COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY), { recursive: true })
  const path = join(directory, COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY, COMPUTER_UNITY_BRIDGE_HANDSHAKE_FILE)
  writeFileSync(path, JSON.stringify(record))
}

export function computerUnityBridgeTestDispatchedClick(
  clientX: number,
  clientY: number,
): ComputerUnityBridgeClickRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
    route: "raycast",
    effect: "unverifiable",
    point: { client_x: clientX, client_y: clientY },
    target: { path: "MailScreen/Toggle", type: "GameObject", label: COMPUTER_UNITY_BRIDGE_TEST_LABEL },
    hint: "A entrega nao prova efeito visual.",
  }
}

export function computerUnityBridgeTestRefusedClick(reason: string): ComputerUnityBridgeClickRecord {
  return { status: COMPUTER_UNITY_BRIDGE_REFUSED_STATUS, reason }
}

export function computerUnityBridgeTestOptions(): ComputerUnityBridgeTestHarnessOptions {
  const click = computerUnityBridgeTestDispatchedClick(
    COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
    COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
  )
  return {
    image: { width: COMPUTER_UNITY_BRIDGE_TEST_IMAGE_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_IMAGE_HEIGHT },
    click,
    clickDrop: false,
    protocol: COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
    generation: 0,
    tree: computerUnityBridgeTestEmptyTree(),
    action: click,
    bridge: true,
    unityProbe: true,
    attachCommand: false,
    commands: [],
    clientY: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  }
}

export function computerUnityBridgeTestV2Options(
  action: ComputerUnityBridgeActionRecord,
): ComputerUnityBridgeTestHarnessOptions {
  const options = computerUnityBridgeTestOptions()
  options.protocol = COMPUTER_UNITY_BRIDGE_PROTOCOL_V2
  options.generation = COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION
  options.tree = computerUnityBridgeTestTree()
  options.action = action
  return options
}
