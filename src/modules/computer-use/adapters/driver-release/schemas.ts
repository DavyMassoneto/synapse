import { Type } from "typebox"

export const COMPUTER_DRIVER_RELEASE_ASSET_SCHEMA = Type.Object({
  name: Type.String(),
  digest: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

export const COMPUTER_DRIVER_RELEASE_SCHEMA = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  tag_name: Type.String(),
  draft: Type.Boolean(),
  prerelease: Type.Boolean(),
  assets: Type.Array(COMPUTER_DRIVER_RELEASE_ASSET_SCHEMA),
})

export const COMPUTER_DRIVER_RELEASE_PAGE_SCHEMA = Type.Array(COMPUTER_DRIVER_RELEASE_SCHEMA)

export const COMPUTER_DRIVER_RELEASE_MANIFEST_ASSET_SCHEMA = Type.Object({
  name: Type.String(),
  sha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
})

export const COMPUTER_DRIVER_RELEASE_MANIFEST_SCHEMA = Type.Object({
  assets: Type.Array(COMPUTER_DRIVER_RELEASE_MANIFEST_ASSET_SCHEMA),
})
