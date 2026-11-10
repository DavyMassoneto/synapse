import { type ConfigPort, type Consultation } from "#synapse/modules"
import { AdvisorService } from "#synapse/modules/advisor/internal"

export function serviceFor(storage: ConfigPort): AdvisorService {
  return new AdvisorService(storage, storage.load())
}

export function emptyConsultation(signal: AbortSignal): Consultation {
  return { system: "", messages: [], signal }
}
