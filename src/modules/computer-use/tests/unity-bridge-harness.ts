import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ComputerUnityBridgeDriver } from "#synapse/modules/computer-use/adapters/unity-bridge"
import { computerUnityBridgeTestConfiguration } from "./unity-bridge-command-support"
import {
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
} from "./unity-bridge-constants"
import { ComputerUnityBridgeTestCommands, ComputerUnityBridgeTestDriver } from "./unity-bridge-driver-support"
import { ComputerUnityBridgeTestServer } from "./unity-bridge-server"
import {
  computerUnityBridgeTestGeometry,
  computerUnityBridgeTestHandshake,
  computerWriteUnityBridgeTestHandshake,
} from "./unity-bridge-support"
import { type ComputerUnityBridgeTestHarnessOptions } from "./unity-bridge-types"

const HARNESS_PREFIX = "synapse-unity-bridge-"

export class ComputerUnityBridgeTestHarness {
  readonly directory: string
  readonly port: number
  readonly driver: ComputerUnityBridgeDriver
  readonly native: ComputerUnityBridgeTestDriver
  readonly commands: ComputerUnityBridgeTestCommands
  readonly server: ComputerUnityBridgeTestServer
  readonly protocol: number

  private constructor(
    directory: string,
    port: number,
    driver: ComputerUnityBridgeDriver,
    native: ComputerUnityBridgeTestDriver,
    commands: ComputerUnityBridgeTestCommands,
    server: ComputerUnityBridgeTestServer,
    protocol: number,
  ) {
    this.directory = directory
    this.port = port
    this.driver = driver
    this.native = native
    this.commands = commands
    this.server = server
    this.protocol = protocol
  }

  static async create(options: ComputerUnityBridgeTestHarnessOptions): Promise<ComputerUnityBridgeTestHarness> {
    const directory = await mkdtemp(join(tmpdir(), HARNESS_PREFIX))
    const geometry = computerUnityBridgeTestGeometry(options.clientY)
    const screen = {
      width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
      height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
    }
    const server = new ComputerUnityBridgeTestServer({
      pid: COMPUTER_UNITY_BRIDGE_TEST_PID,
      instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
      screen,
      geometry,
      click: options.click,
      clickDrop: options.clickDrop,
      protocol: options.protocol,
      generation: options.generation,
      tree: options.tree,
      action: options.action,
    })
    const port = await server.start()
    if (options.bridge) {
      const handshake = computerUnityBridgeTestHandshake({
        port,
        instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
        token: COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
        geometry,
        screen,
        protocol: options.protocol,
      })
      computerWriteUnityBridgeTestHandshake(directory, handshake)
    }
    const configuration = computerUnityBridgeTestConfiguration(directory, options.unityProbe, options.attachCommand)
    const native = new ComputerUnityBridgeTestDriver(options.image)
    const commands = new ComputerUnityBridgeTestCommands(options.commands)
    const driver = new ComputerUnityBridgeDriver(native, configuration, commands.runner)
    return new ComputerUnityBridgeTestHarness(directory, port, driver, native, commands, server, options.protocol)
  }

  publishHandshake(): void {
    const geometry = computerUnityBridgeTestGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y)
    const handshake = computerUnityBridgeTestHandshake({
      port: this.port,
      instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
      token: COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
      geometry,
      screen: {
        width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
        height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
      },
      protocol: this.protocol,
    })
    computerWriteUnityBridgeTestHandshake(this.directory, handshake)
  }

  async dispose(): Promise<void> {
    await this.server.close()
    await rm(this.directory, { recursive: true, force: true })
  }
}
