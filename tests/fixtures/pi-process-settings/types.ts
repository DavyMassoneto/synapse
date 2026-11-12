export interface PiProcessRetryPolicy {
  enabled: boolean
  maxRetries: number
  baseDelayMs: number
  maxAgentDelayMs: number
}

export interface PiProcessSettings {
  retry: PiProcessRetryPolicy
  enableInstallTelemetry: boolean
  enableAnalytics: boolean
}
