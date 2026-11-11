import { type Cancelled } from "#synapse/modules"

export const MODEL_SELECTION_LIMIT = 100

export const CANCELLED_SELECTION: Cancelled = { kind: "cancelled" }

export const PICKER_TITLE = "Modelo advisor"

export const DISABLED_OPTION = "(sem advisor)"

export const AMBIGUOUS_MODEL = "Mais de um modelo corresponde; informe uma referência mais específica."

export const NO_MATCH = "Nenhum modelo encontrado: "

export const AMBIGUOUS_LEVEL = "warning"

export const NO_MATCH_LEVEL = "error"
