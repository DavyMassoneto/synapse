import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  type ComputerUnityBridgeHandshakeRecord,
  type ComputerUnityBridgeTarget,
  computerRunUnityBridgeCommand,
  computerUnityBridgeClientPoint,
  computerUnityBridgeCommandArguments,
  computerUnityBridgePingFacts,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_UNITY_BRIDGE_TEST_CAPTION_OFFSET,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_Y,
  COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
  COMPUTER_UNITY_BRIDGE_TEST_OTHER_INSTANCE,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_PORT,
  COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
} from "./unity-bridge-constants"
import { computerUnityBridgeTestDomainGeometry, computerUnityBridgeTestFacts } from "./unity-bridge-helpers"
import {
  computerUnityBridgeTestGeometry,
  computerUnityBridgeTestHandshake,
  computerUnityBridgeTestPing,
  computerUnityBridgeTestRefusedClick,
} from "./unity-bridge-support"
import { computerUnityBridgeTestEmptyTree } from "./unity-bridge-tree-support"
import { type ComputerUnityBridgeTestServerOptions } from "./unity-bridge-types"

function handshakeRecord(): ComputerUnityBridgeHandshakeRecord {
  return computerUnityBridgeTestHandshake({
    port: COMPUTER_UNITY_BRIDGE_TEST_PORT,
    instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
    token: COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
    geometry: computerUnityBridgeTestGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y),
    screen: { width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT },
    protocol: COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  })
}

function serverOptions(): ComputerUnityBridgeTestServerOptions {
  return {
    pid: COMPUTER_UNITY_BRIDGE_TEST_PID,
    instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
    screen: { width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT },
    geometry: computerUnityBridgeTestGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y),
    click: computerUnityBridgeTestRefusedClick("teste"),
    clickDrop: false,
    protocol: COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
    generation: 0,
    tree: computerUnityBridgeTestEmptyTree(),
    action: computerUnityBridgeTestRefusedClick("teste"),
  }
}

function targetRecord(): ComputerUnityBridgeTarget {
  return { pid: COMPUTER_UNITY_BRIDGE_TEST_PID, windowId: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID }
}

function mapsFreshPingIntoFacts(): void {
  const body = JSON.stringify(computerUnityBridgeTestPing(serverOptions()))
  const facts = computerUnityBridgeTestFacts(computerUnityBridgePingFacts(body, handshakeRecord()))
  expect(facts.instance).toBe(COMPUTER_UNITY_BRIDGE_TEST_INSTANCE)
  expect(facts.geometry.client).toEqual({
    x: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X,
    y: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
    width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
    height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
  })
}

function rejectsPingFromAnotherInstance(): void {
  const options = serverOptions()
  options.instance = COMPUTER_UNITY_BRIDGE_TEST_OTHER_INSTANCE
  const body = JSON.stringify(computerUnityBridgeTestPing(options))
  expect(computerUnityBridgePingFacts(body, handshakeRecord()).kind).toBe("facts-invalid")
}

function rejectsImageThatDoesNotCoverClient(): void {
  const geometry = computerUnityBridgeTestDomainGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y)
  const image = { width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_CAPTION_OFFSET }
  const result = computerUnityBridgeClientPoint({ x: 10, y: 10 }, image, geometry)
  expect(result).toEqual({ kind: "point-rejected", message: COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT })
}

function acceptsImageWithCaptionOffset(): void {
  const geometry = computerUnityBridgeTestDomainGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y)
  const image = {
    width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
    height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT + COMPUTER_UNITY_BRIDGE_TEST_CAPTION_OFFSET - 2,
  }
  const result = computerUnityBridgeClientPoint(
    { x: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_X, y: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_PIXEL_Y },
    image,
    geometry,
  )
  expect(result.kind).toBe("point-mapped")
}

function rejectsPixelOutsideImage(): void {
  const geometry = computerUnityBridgeTestDomainGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y)
  const image = { width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT }
  const result = computerUnityBridgeClientPoint({ x: 5000, y: 10 }, image, geometry)
  expect(result).toEqual({ kind: "point-rejected", message: COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT })
}

function substitutesCommandPlaceholders(): void {
  expect(computerUnityBridgeCommandArguments(["{pid}", "{windowId}"], targetRecord())).toEqual([
    `${COMPUTER_UNITY_BRIDGE_TEST_PID}`,
    `${COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID}`,
  ])
}

async function reportsCommandExitCode(): Promise<void> {
  const result = await computerRunUnityBridgeCommand({ command: "cmd", arguments: ["/c", "exit 20"] }, targetRecord())
  expect(result.kind).toBe("command-exited")
}

async function reportsUnavailableCommand(): Promise<void> {
  const result = await computerRunUnityBridgeCommand(
    { command: "synapse-missing-unity-bridge-command", arguments: [] },
    targetRecord(),
  )
  expect(result.kind).toBe("command-unavailable")
}

test("ping novo vira fatos da bridge", mapsFreshPingIntoFacts)

test("ping de outra instância é rejeitado", rejectsPingFromAnotherInstance)

test("imagem que não cobre a área cliente é recusada", rejectsImageThatDoesNotCoverClient)

test("imagem com legenda na margem é aceita", acceptsImageWithCaptionOffset)

test("pixel fora da imagem é recusado", rejectsPixelOutsideImage)

test("placeholders do comando são substituídos", substitutesCommandPlaceholders)

test("comando com saída não zero vira código de saída", reportsCommandExitCode)

test("comando inexistente vira indisponível", reportsUnavailableCommand)
