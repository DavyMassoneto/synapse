import {
  SHELL_WIRE_AUTH_ABSENT,
  SHELL_WIRE_AUTH_AUTHORIZED,
  SHELL_WIRE_AUTH_CLOSED,
  SHELL_WIRE_AUTH_EMPTY,
  SHELL_WIRE_AUTH_EXECUTION,
  SHELL_WIRE_AUTH_FORBIDDEN,
  SHELL_WIRE_AUTH_REVOKED,
  SHELL_WIRE_AUTH_SENT,
  SHELL_WIRE_INVALID,
} from "./constants"
import {
  type ShellGateCommit,
  type ShellReleaseRequest,
  type ShellReservationProof,
  type ShellUserAuthorization,
} from "./types"

export class ShellWireAuthorization {
  user: ShellUserAuthorization = SHELL_WIRE_AUTH_FORBIDDEN
  request: ShellReleaseRequest = SHELL_WIRE_AUTH_ABSENT
  gate: ShellGateCommit = SHELL_WIRE_AUTH_CLOSED
  proof: ShellReservationProof = SHELL_WIRE_AUTH_ABSENT
  authorize(): void {
    if (this.request === SHELL_WIRE_AUTH_REVOKED || this.proof !== SHELL_WIRE_AUTH_ABSENT) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    this.user = SHELL_WIRE_AUTH_AUTHORIZED
    this.request = SHELL_WIRE_AUTH_SENT
  }
  revoke(): void {
    this.request = SHELL_WIRE_AUTH_REVOKED
  }
  execution(): void {
    if (this.user !== SHELL_WIRE_AUTH_AUTHORIZED) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    this.gate = SHELL_WIRE_AUTH_EXECUTION
  }
  preparationEmpty(cancelled: boolean, stopping: boolean): void {
    if (this.gate === SHELL_WIRE_AUTH_EXECUTION || this.proof !== SHELL_WIRE_AUTH_ABSENT || (cancelled && !stopping)) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    this.gate = SHELL_WIRE_AUTH_REVOKED
    this.request = SHELL_WIRE_AUTH_REVOKED
    this.proof = SHELL_WIRE_AUTH_EMPTY
  }
}
