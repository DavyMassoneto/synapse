import { Type } from "typebox"
import {
  IPHONE_PROVISION_APPIUM_INTEGRITY,
  IPHONE_PROVISION_APPIUM_MAIN,
  IPHONE_PROVISION_APPIUM_PACKAGE,
  IPHONE_PROVISION_APPIUM_RESOLVED,
  IPHONE_PROVISION_APPIUM_VERSION,
  IPHONE_PROVISION_DIGEST_PATTERN,
  IPHONE_PROVISION_DRIVER_INTEGRITY,
  IPHONE_PROVISION_DRIVER_MAIN,
  IPHONE_PROVISION_DRIVER_PACKAGE,
  IPHONE_PROVISION_DRIVER_RESOLVED,
  IPHONE_PROVISION_DRIVER_VERSION,
  IPHONE_PROVISION_RECEIPT_FILES,
  IPHONE_PROVISION_UUID_PATTERN,
} from "./constants"

export const IPHONE_PROVISION_RECEIPT_SCHEMA = Type.Object(
  {
    installation: Type.String({ pattern: IPHONE_PROVISION_UUID_PATTERN }),
    files: Type.Array(
      Type.Object({
        path: Type.String({ minLength: 1 }),
        digest: Type.String({ pattern: IPHONE_PROVISION_DIGEST_PATTERN }),
      }),
      { maxItems: IPHONE_PROVISION_RECEIPT_FILES.length },
    ),
  },
  { additionalProperties: false },
)

export const IPHONE_PROVISION_APPIUM_PACKAGE_SCHEMA = Type.Object({
  name: Type.Literal(IPHONE_PROVISION_APPIUM_PACKAGE),
  version: Type.Literal(IPHONE_PROVISION_APPIUM_VERSION),
  main: Type.Literal(IPHONE_PROVISION_APPIUM_MAIN),
})

export const IPHONE_PROVISION_DRIVER_PACKAGE_SCHEMA = Type.Object({
  name: Type.Literal(IPHONE_PROVISION_DRIVER_PACKAGE),
  version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
  main: Type.Literal(IPHONE_PROVISION_DRIVER_MAIN),
})

export const IPHONE_PROVISION_LOCK_SCHEMA = Type.Object({
  packages: Type.Object({
    "node_modules/appium": Type.Object({
      version: Type.Literal(IPHONE_PROVISION_APPIUM_VERSION),
      resolved: Type.Literal(IPHONE_PROVISION_APPIUM_RESOLVED),
      integrity: Type.Literal(IPHONE_PROVISION_APPIUM_INTEGRITY),
    }),
    "node_modules/appium-xcuitest-driver": Type.Object({
      version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
      resolved: Type.Literal(IPHONE_PROVISION_DRIVER_RESOLVED),
      integrity: Type.Literal(IPHONE_PROVISION_DRIVER_INTEGRITY),
    }),
  }),
})

export const IPHONE_PROVISION_DRIVER_REGISTRY_SCHEMA = Type.Object({
  xcuitest: Type.Object({
    pkgName: Type.Literal(IPHONE_PROVISION_DRIVER_PACKAGE),
    version: Type.Literal(IPHONE_PROVISION_DRIVER_VERSION),
    installed: Type.Literal(true),
    installPath: Type.String({ minLength: 1 }),
  }),
})
