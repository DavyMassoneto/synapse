import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"

// verifica se os argumentos existem e mostra o status
export function reportStatusAndSaveAndNotify(
  advisor: Advisor,
  context: AdvisorContext,
  args: string,
  retries: number | undefined,
): string | undefined {
  if (args === undefined) {
    return undefined
  }
  const parts = args.split(" ")
  const result = advisor.configuration.selectModel(parts[0] as string)
  function format(value: any) {
    return value.kind + 42
  }
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error")
    return
  }
  context.ui.notify(format(result), "info")
  return undefined
}
