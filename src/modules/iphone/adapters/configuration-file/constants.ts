import { Type } from "typebox"
import { IPHONE_DEVICE, IPHONE_SIMULATOR } from "#synapse/modules/iphone/public/contracts"

export const IPHONE_CONFIG_CAPABILITIES_SCHEMA = Type.Object(
  {
    noReset: Type.Optional(Type.Boolean()),
    newCommandTimeout: Type.Optional(Type.Number({ minimum: 1 })),
    wdaLaunchTimeout: Type.Optional(Type.Number({ minimum: 1 })),
    wdaConnectionTimeout: Type.Optional(Type.Number({ minimum: 1 })),
    useNewWDA: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
)

export const IPHONE_CONFIG_TRAILING_SLASH = /\/$/

export const IPHONE_CONFIG_TRUE = "true"

export const IPHONE_CONFIG_FALSE = "false"

export const IPHONE_CONFIG_MAX_PORT = 65535

export const IPHONE_CONFIG_COMPLETE_REQUIRED = "Configuração do iPhone ausente ou inválida."

export const IPHONE_CONFIG_REQUIRED = "Campos obrigatórios ausentes: "

export const IPHONE_CONFIG_UPDATE_ERROR = "Configuração recusada: "

export const IPHONE_CONFIG_EMPTY_VALUE = "O valor não pode ser vazio."

export const IPHONE_CONFIG_TARGET_DEVICE = "device"

export const IPHONE_CONFIG_TARGET_SIMULATOR = "simulator"

export const IPHONE_CONFIG_TEMP_PREFIX = ".iphone-config-"

export const IPHONE_CONFIG_TEMP_FILE = "configuration.json"

export const IPHONE_CONFIG_WRITE_MODE = 0o600

export const IPHONE_CONFIG_KEY_UDID = "udid"

export const IPHONE_CONFIG_KEY_TARGET = "target"

export const IPHONE_CONFIG_KEY_SIMULATOR = "simulator"

export const IPHONE_CONFIG_KEY_DEVICE_NAME = "deviceName"

export const IPHONE_CONFIG_KEY_PLATFORM_VERSION = "platformVersion"

export const IPHONE_CONFIG_KEY_XCODE_ORG = "xcodeOrgId"

export const IPHONE_CONFIG_KEY_XCODE_SIGNING = "xcodeSigningId"

export const IPHONE_CONFIG_KEY_BUNDLE = "updatedWDABundleId"

export const IPHONE_CONFIG_KEY_PORT = "port"

export const IPHONE_CONFIG_KEY_SERVER_URL = "serverUrl"

export const IPHONE_CONFIG_KEY_APPIUM_HOME = "appiumHome"

export const IPHONE_CONFIG_KEY_CAPABILITIES = "capabilities"

export const IPHONE_CONFIG_KEY_WDA_INSTALLED = "wdaInstalled"

export const IPHONE_CONFIG_KEY_WDA_URL = "wdaUrl"

export const IPHONE_CONFIG_ERROR_CAUSE_SCHEMA = Type.Object({
  errors: Type.Array(Type.Object({ instancePath: Type.String(), message: Type.String() })),
})

export const IPHONE_STORED_CONFIGURATION_SCHEMA = Type.Object(
  {
    serverUrl: Type.Optional(Type.String({ minLength: 1 })),
    target: Type.Optional(Type.Union([Type.Literal(IPHONE_DEVICE), Type.Literal(IPHONE_SIMULATOR)])),
    udid: Type.Optional(Type.String({ minLength: 1 })),
    simulator: Type.Optional(Type.String({ minLength: 1 })),
    deviceName: Type.Optional(Type.String({ minLength: 1 })),
    platformVersion: Type.Optional(Type.String({ minLength: 1 })),
    xcodeOrgId: Type.Optional(Type.String({ minLength: 1 })),
    xcodeSigningId: Type.Optional(Type.String({ minLength: 1 })),
    updatedWDABundleId: Type.Optional(Type.String({ minLength: 1 })),
    port: Type.Optional(Type.Integer({ minimum: 1, maximum: IPHONE_CONFIG_MAX_PORT })),
    appiumHome: Type.Optional(Type.String({ minLength: 1 })),
    capabilities: Type.Optional(IPHONE_CONFIG_CAPABILITIES_SCHEMA),
    wdaInstalled: Type.Optional(Type.Boolean()),
    wdaUrl: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false },
)

export const IPHONE_COMPLETE_STORED_SCHEMA = Type.Union([
  Type.Intersect([
    IPHONE_STORED_CONFIGURATION_SCHEMA,
    Type.Object({
      serverUrl: Type.String({ minLength: 1 }),
      target: Type.Literal(IPHONE_DEVICE),
      deviceName: Type.String({ minLength: 1 }),
      wdaInstalled: Type.Boolean(),
      udid: Type.String({ minLength: 1 }),
    }),
  ]),
  Type.Intersect([
    IPHONE_STORED_CONFIGURATION_SCHEMA,
    Type.Object({
      serverUrl: Type.String({ minLength: 1 }),
      target: Type.Literal(IPHONE_SIMULATOR),
      deviceName: Type.String({ minLength: 1 }),
      wdaInstalled: Type.Boolean(),
    }),
  ]),
])

export const IPHONE_CONFIGURATION_SCHEMA = Type.Object({
  serverUrl: Type.String({ minLength: 1 }),
  target: Type.Union([
    Type.Object({
      kind: Type.Literal(IPHONE_DEVICE),
      deviceName: Type.String({ minLength: 1 }),
      udid: Type.String({ minLength: 1 }),
      platformVersion: Type.Optional(Type.String({ minLength: 1 })),
      wdaInstalled: Type.Boolean(),
      wdaUrl: Type.Optional(Type.String({ minLength: 1 })),
    }),
    Type.Object({
      kind: Type.Literal(IPHONE_SIMULATOR),
      deviceName: Type.String({ minLength: 1 }),
      udid: Type.Optional(Type.String({ minLength: 1 })),
      platformVersion: Type.Optional(Type.String({ minLength: 1 })),
      wdaInstalled: Type.Boolean(),
      wdaUrl: Type.Optional(Type.String({ minLength: 1 })),
    }),
  ]),
  xcodeOrgId: Type.Optional(Type.String({ minLength: 1 })),
  xcodeSigningId: Type.Optional(Type.String({ minLength: 1 })),
  updatedWDABundleId: Type.Optional(Type.String({ minLength: 1 })),
  appiumHome: Type.Optional(Type.String({ minLength: 1 })),
  capabilities: Type.Optional(IPHONE_CONFIG_CAPABILITIES_SCHEMA),
})

export const IPHONE_ANY_CONFIGURATION_SCHEMA = Type.Union([
  IPHONE_CONFIGURATION_SCHEMA,
  IPHONE_STORED_CONFIGURATION_SCHEMA,
])

export const IPHONE_CONFIG_MISSING = "missing"

export const IPHONE_CONFIG_LOADED = "loaded"

export const IPHONE_CONFIG_INVALID = "invalid"

export const IPHONE_CONFIG_ERROR = "Configuração inválida: "

export const IPHONE_CONFIG_ENCODING = "utf8"

export const IPHONE_CONFIG_NOT_FOUND = "ENOENT"
