import { Type } from "typebox"

export const WorkerInputSchema = Type.Object(
  {
    sha: Type.String({ pattern: "^[0-9a-f]{40}$" }),
    diff: Type.String(),
    prompt: Type.String(),
    model: Type.Object({
      apiKey: Type.String({ minLength: 1 }),
      baseUrl: Type.String({ minLength: 1 }),
      model: Type.String({ minLength: 1 }),
    }),
  },
  { additionalProperties: false },
)
