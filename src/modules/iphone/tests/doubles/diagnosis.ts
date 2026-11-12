import { type IphoneDiagnosisPort } from "#synapse/modules/iphone/internal/diagnosis"

export class TestIphoneDiagnosis implements IphoneDiagnosisPort {
  responds = true

  async serverResponds(_signal: AbortSignal): Promise<boolean> {
    return this.responds
  }

  async hasBootedSimulator(_signal: AbortSignal): Promise<boolean> {
    return false
  }
}
