import { type IphoneSimulatorDevice } from "#synapse/modules/iphone/adapters/simctl-device-list-reading"

export interface IphoneSimctlValidCase {
  scenario: string
  source: string
  devices: IphoneSimulatorDevice[]
}

export interface IphoneSimctlInvalidCase {
  scenario: string
  source: string
}
