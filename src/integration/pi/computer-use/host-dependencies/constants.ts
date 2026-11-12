import { Type } from "typebox"

export const PI_COMPUTER_LAUNCH_CONFIGURED = "launch-configured"

export const PI_COMPUTER_LAUNCH_UNCONFIGURED = "launch-unconfigured"

export const PI_COMPUTER_STATE_DIRECTORY = "computer-use"

export const PI_COMPUTER_INSTALLATION_DIRECTORY = "driver"

export const PI_COMPUTER_CAPTURE_DIRECTORY = "captures"

export const PI_COMPUTER_DRIVER_CONFIGURATION_FILE = "computer-use-driver.json"

export const PI_COMPUTER_DRIVER_PATH_VARIABLE = "PI_CUA_DRIVER_CMD"

export const PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA = Type.Object(
  { command: Type.String({ minLength: 1 }), arguments: Type.Array(Type.String()) },
  { additionalProperties: false },
)

export const PI_COMPUTER_HOST_TIMEOUT_MILLISECONDS = 30000

export const PI_COMPUTER_UNSUPPORTED_PLATFORM = "Uso do computador indisponível nesta plataforma."

export const PI_COMPUTER_CONFIGURATION_MISSING_CODE = "ENOENT"

export const PI_COMPUTER_CONFIGURATION_ERROR_CODE_PROPERTY = "code"
