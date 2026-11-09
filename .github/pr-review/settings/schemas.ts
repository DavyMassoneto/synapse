import Type from "typebox"

export const ShaSchema = Type.String({ pattern: "^[0-9a-f]{40}$" })

export const SettingsSchema = Type.Object({
  repo: Type.String(),
  prNumber: Type.String({ pattern: "^[0-9]+$" }),
  baseSha: ShaSchema,
  headSha: ShaSchema,
  baseUrl: Type.String(),
  apiKey: Type.String(),
  model: Type.String(),
  prTitle: Type.String(),
  prBody: Type.String(),
})
