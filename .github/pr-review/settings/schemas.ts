import Type from "typebox"

export const SettingsSchema = Type.Object({
  repo: Type.String(),
  prNumber: Type.String({ pattern: "^[0-9]+$" }),
  baseSha: Type.String({ pattern: "^[0-9a-f]{40}$" }),
  headSha: Type.String({ pattern: "^[0-9a-f]{40}$" }),
  baseUrl: Type.String(),
  apiKey: Type.String(),
  model: Type.String(),
  prTitle: Type.String(),
  prBody: Type.String(),
})
