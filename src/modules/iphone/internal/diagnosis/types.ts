import {
  type IPHONE_DIAGNOSIS_FAILED,
  type IPHONE_DIAGNOSIS_NOT_APPLICABLE,
  type IPHONE_DIAGNOSIS_OK,
} from "./constants"

export interface IphoneDiagnosisOk {
  kind: typeof IPHONE_DIAGNOSIS_OK
}

export interface IphoneDiagnosisFailed {
  kind: typeof IPHONE_DIAGNOSIS_FAILED
  message: string
}

export interface IphoneDiagnosisNotApplicable {
  kind: typeof IPHONE_DIAGNOSIS_NOT_APPLICABLE
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
