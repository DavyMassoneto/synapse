export interface IphoneWdaLease {
  release(): Promise<void>
}

export interface IphoneWdaReservation extends IphoneWdaLease {
  readonly signal: AbortSignal
  reserve(signal: AbortSignal): Promise<void>
  handoff(signal: AbortSignal): Promise<void>
}

export interface IphoneRequiredWdaAdmission {
  kind: "required"
  admission: IphoneWdaReservation
}

export interface IphoneExternalWdaAdmission {
  kind: "external"
}

export type IphoneWdaSelection = IphoneRequiredWdaAdmission | IphoneExternalWdaAdmission
export type IphoneWdaAdmissions = Set<IphoneWdaLease>
