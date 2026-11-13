export interface IphoneSimulatorDevice {
  udid: string
  name: string
  state: string
}

export interface IphoneSimctlReadingValid {
  kind: "output-valid"
  devices: IphoneSimulatorDevice[]
}

export interface IphoneSimctlReadingInvalid {
  kind: "output-invalid"
}

export type IphoneSimctlReading = IphoneSimctlReadingValid | IphoneSimctlReadingInvalid

export interface IphoneSimctlDeviceValid {
  kind: "output-valid"
  device: IphoneSimulatorDevice
}

export type IphoneSimctlDeviceReading = IphoneSimctlDeviceValid | IphoneSimctlReadingInvalid

export interface IphoneSimctlTextValid {
  kind: "output-valid"
  text: string
}

export type IphoneSimctlText = IphoneSimctlTextValid | IphoneSimctlReadingInvalid

export type IphoneSimctlRuntimeGroups = Map<string, IphoneSimctlReading>

export interface IphoneSimctlRuntimeGroup {
  key: string
  reading: IphoneSimctlReadingValid
}

export type IphoneJsonContainer = "object" | "array"

export interface IphoneJsonEscapes {
  '"': string
  "\\": string
  "/": string
  b: string
  f: string
  n: string
  r: string
  t: string
}
