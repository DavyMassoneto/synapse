import { type Static } from "typebox"
import { type SettingsSchema } from "./schemas"

export type Settings = Static<typeof SettingsSchema>
