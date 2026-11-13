import { type IphoneModule } from "#synapse/modules"

export interface IphoneIntegrationSut {
  iphone: IphoneModule
  server: IphoneFixtureServerPort
  directory: string
}

export type IphoneFixtureResolve = () => void

export type IphoneFixtureReject = (error: Error) => void

export interface IphoneFixtureServerPort {
  paths: string[]
  start(): Promise<string>
  stop(): Promise<void>
}

export interface IphoneFixtureRoutes {
  "/status": string
  "/session": string
  "/source": string
  "/window/rect": string
  "/screenshot": string
}
