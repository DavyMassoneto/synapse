import { MUTATION_INTERVAL_MS } from "./constants"
import { type MutationTiming } from "./types"

export async function paceMutation(timing: MutationTiming): Promise<void> {
  if (timing.hasMutation) {
    await timing.wait(MUTATION_INTERVAL_MS)
  }
  timing.hasMutation = true
}
