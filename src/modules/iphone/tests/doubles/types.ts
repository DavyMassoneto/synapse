import { type IphoneSessionFactory, type IphoneSessionPort } from "#synapse/modules/iphone/internal/session-lifecycle"

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
