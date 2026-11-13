import { Type } from "typebox"

export const IPHONE_SIMULATOR_DEVICE_SCHEMA = Type.Object({
  udid: Type.String(),
  name: Type.String(),
  state: Type.String(),
})

export const IPHONE_SIMULATOR_DEVICE_LIST_SCHEMA = Type.Array(IPHONE_SIMULATOR_DEVICE_SCHEMA)

export const IPHONE_SIMULATOR_OUTPUT_SCHEMA = Type.Object({
  devices: Type.Object({}),
})
