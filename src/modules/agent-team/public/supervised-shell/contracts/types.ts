export interface SupervisedShellSpec {
  input?: string
  executable: string
  arguments: string[]
  cwd: string
  environment: NodeJS.ProcessEnv
}

export interface SupervisedShellOutput {
  write(data: Buffer): Promise<void>
}

export interface SupervisedShellLease {
  readonly id: string
  readonly state: SupervisedShellLeaseState
  release(): void
  terminate(): Promise<void>
  completion: Promise<number>
}

export interface SupervisedShellLauncher {
  create(spec: SupervisedShellSpec, output: SupervisedShellOutput): Promise<SupervisedShellLease>
}

export type SupervisedShellLeaseState = "created" | "acknowledged" | "released" | "exited" | "quarantined"

export type SupervisedShellFactory = () => SupervisedShellService

export interface SupervisedShellService {
  create(spec: SupervisedShellSpec, output: SupervisedShellOutput): Promise<SupervisedShellLease>
  stop(): Promise<void>
  close(): Promise<void>
}
