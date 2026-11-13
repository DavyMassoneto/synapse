import { Type } from "typebox"
import { IPHONE_DEVICE, IPHONE_SIMULATOR } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_CONFIG_MAX_PORT } from "./constants"

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
