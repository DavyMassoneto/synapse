import { Type } from "typebox"
import { COMPUTER_DARWIN, COMPUTER_LINUX, COMPUTER_WIN32 } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_RECEIPT_HASH_PATTERN, COMPUTER_DRIVER_RECEIPT_VERSION_PATTERN } from "./constants"

export const COMPUTER_DRIVER_RECEIPT_SCHEMA = Type.Object(
  {
    version: Type.String({ pattern: COMPUTER_DRIVER_RECEIPT_VERSION_PATTERN }),
    tag: Type.String({ minLength: 1 }),
    releaseId: Type.Integer({ minimum: 1 }),
    assetName: Type.String({ minLength: 1 }),
    expectedSha256: Type.String({ pattern: COMPUTER_DRIVER_RECEIPT_HASH_PATTERN }),
    checksumSource: Type.String({ minLength: 1 }),
    platform: Type.Union([Type.Literal(COMPUTER_DARWIN), Type.Literal(COMPUTER_LINUX), Type.Literal(COMPUTER_WIN32)]),
    architecture: Type.String({ minLength: 1 }),
    executable: Type.String({ minLength: 1 }),
    executableSha256: Type.String({ pattern: COMPUTER_DRIVER_RECEIPT_HASH_PATTERN }),
    policy: Type.Object(
      {
        mode: Type.String({ minLength: 1 }),
        reason: Type.Optional(Type.String({ minLength: 1 })),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
)
