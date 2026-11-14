import { Type } from "typebox"
import {
  IPHONE_PROVISION_APPIUM_INTEGRITY,
  IPHONE_PROVISION_APPIUM_VERSION,
  IPHONE_PROVISION_DRIVER_INTEGRITY,
  IPHONE_PROVISION_DRIVER_VERSION,
  IPHONE_PROVISION_UUID_PATTERN,
} from "./constants"

export const IPHONE_PROVISION_RECEIPT_SCHEMA = Type.Object(
  {
    installation: Type.String({ pattern: IPHONE_PROVISION_UUID_PATTERN }),
    files: Type.Array(
      Type.Object({ path: Type.String({ minLength: 1 }), digest: Type.String({ pattern: "^[0-9a-f]{64}$" }) }),
      { maxItems: 9 },
    ),
  },
  { additionalProperties: false },
)

export const IPHONE_PROVISION_APPIUM_PACKAGE_SCHEMA = Type.Object({
  name: Type.Literal("appium"),
  version: Type.Literal(IPHONE_PROVISION_APPIUM_VERSION),
  main: Type.Literal("./build/lib/main.js"),
})

export const IPHONE_PROVISION_DRIVER_PACKAGE_SCHEMA = Type.Object({
  name: Type.Literal("appium-xcuitest-driver"),
  version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
  main: Type.Literal("./build/lib/index.js"),
})

export const IPHONE_PROVISION_LOCK_SCHEMA = Type.Object({
  packages: Type.Object({
    "node_modules/appium": Type.Object({
      version: Type.Literal(IPHONE_PROVISION_APPIUM_VERSION),
      resolved: Type.Literal("https://registry.npmjs.org/appium/-/appium-3.9.0.tgz"),
      integrity: Type.Literal(IPHONE_PROVISION_APPIUM_INTEGRITY),
    }),
    "node_modules/appium-xcuitest-driver": Type.Object({
      version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
      resolved: Type.Literal("https://registry.npmjs.org/appium-xcuitest-driver/-/appium-xcuitest-driver-12.22.8.tgz"),
      integrity: Type.Literal(IPHONE_PROVISION_DRIVER_INTEGRITY),
    }),
  }),
})

export const IPHONE_PROVISION_DRIVER_REGISTRY_SCHEMA = Type.Object({
  xcuitest: Type.Object({
    pkgName: Type.Literal("appium-xcuitest-driver"),
    version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
    installed: Type.Literal(true),
    installPath: Type.String({ minLength: 1 }),
  }),
})
