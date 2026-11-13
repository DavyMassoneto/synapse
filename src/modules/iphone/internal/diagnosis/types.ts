export interface IphoneDiagnosisOk {
  kind: "ok"
}

export interface IphoneDiagnosisFailed {
  kind: "failed"
  message: string
}

export interface IphoneDiagnosisNotApplicable {
  kind: "not-applicable"
}

export type IphoneDiagnosisCheck = IphoneDiagnosisOk | IphoneDiagnosisFailed | IphoneDiagnosisNotApplicable

export interface IphoneDiagnosis {
  server: IphoneDiagnosisCheck
  target: IphoneDiagnosisCheck
  simulator: IphoneDiagnosisCheck
}

export interface IphoneDiagnosisPort {
  serverResponds(signal: AbortSignal): Promise<boolean>
  hasBootedSimulator(signal: AbortSignal): Promise<boolean>
}
