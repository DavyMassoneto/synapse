import { createServer, type Server } from "node:net"
import { type IphoneConfiguration, type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export function simulatorWdaConfig(serverUrl: string, port: number): IphoneConfiguration {
  return {
    serverUrl,
    target: { kind: "simulator", udid: "fake-simulator", deviceName: "Fake", wdaInstalled: false },
    capabilities: { wdaLocalPort: port, useNewWDA: true },
  }
}

export async function listenWdaTest(server: Server, host: string, port: number): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen({ host, port, ipv6Only: true }, resolve)
  })
  const address = server.address()
  if (!address || typeof address === "string") {
    throw new Error("Servidor falso sem porta")
  }
  return address.port
}

export async function closeWdaTest(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export async function freeWdaTestPort(): Promise<number> {
  const socket = createServer()
  const port = await listenWdaTest(socket, "127.0.0.1", 0)
  await closeWdaTest(socket)
  return port
}

export async function noSimulatorCommand(): Promise<IphoneSimulatorCommandOutput> {
  throw new Error("Descoberta inesperada")
}
