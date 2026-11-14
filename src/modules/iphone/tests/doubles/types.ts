import { type ServerResponse } from "node:http"
import { type IphoneSessionFactory, type IphoneSessionPort } from "#synapse/modules/iphone/public/contracts"

export type HeldHttpResponse = (response: ServerResponse) => void

export interface IphoneSessionDouble extends IphoneSessionPort {
  probes: number
  closes: number
  failProbe: boolean
}

export interface IphoneFactoryDouble extends IphoneSessionFactory<IphoneSessionDouble> {
  creates: number
  stops: number
  session: IphoneSessionDouble
}
