import { Type } from "typebox"

export const IPHONE_SIMULATOR_UNSUPPORTED = "A descoberta de simuladores só está disponível no macOS."

export const IPHONE_SIMULATOR_EXECUTABLE = "xcrun"

export const IPHONE_SIMULATOR_ARGUMENTS = ["simctl", "list", "devices", "booted", "-j"]

export const IPHONE_SIMULATOR_BOOTED = "Booted"

export const IPHONE_SIMULATOR_INVALID = "A lista de simuladores retornada é inválida."

export const IPHONE_SIMULATOR_COMMAND_FAILED = "Não foi possível listar os simuladores."

export const IPHONE_SIMULATOR_COMMAND_SUCCEEDED = "command-succeeded"

export const IPHONE_SIMULATOR_COMMAND_ERROR = "command-error"

export const IPHONE_SIMULATOR_OUTPUT_VALID = "output-valid"

export const IPHONE_SIMULATOR_OUTPUT_INVALID = "output-invalid"

export const IPHONE_SIMULATOR_DEVICE_SCHEMA = Type.Object({
  udid: Type.String(),
  name: Type.String(),
  state: Type.String(),
})

export const IPHONE_SIMULATOR_DEVICE_LIST_SCHEMA = Type.Array(IPHONE_SIMULATOR_DEVICE_SCHEMA)

export const IPHONE_SIMULATOR_OUTPUT_SCHEMA = Type.Object({
  devices: Type.Object({}),
})
