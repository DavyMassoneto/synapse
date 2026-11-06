export interface IphoneConfig { udid?: string; target?: "device" | "simulator"; simulator?: string; deviceName?: string; platformVersion?: string; xcodeOrgId?: string; xcodeSigningId?: string; updatedWDABundleId?: string; port?: number; appiumHome?: string; capabilities?: Record<string, unknown> }
export interface SessionPort { id: string; req(method: string, path: string, body?: unknown, timeout?: number, signal?: AbortSignal): Promise<any>; exec(script: string, args?: Record<string, unknown>, signal?: AbortSignal): Promise<any>; close(): Promise<void> }
export interface Dependencies {
  management: { load(): IphoneConfig; save(config: Record<string, unknown>): void; configPath: string; log(): string; doctor(server: { isUp(): Promise<boolean> }, session: SessionPort | null): Promise<string> };
  loadConfig(): IphoneConfig;
  CONFIG_PATH: string;
  AppiumServer: new (config: () => IphoneConfig) => { start(): Promise<string>; stop(): Promise<void>; isUp(): Promise<boolean> };
  Session: { create(config: IphoneConfig, caps: Record<string, unknown>, signal?: AbortSignal): Promise<SessionPort> };
  bootedSimulator(): Promise<{ udid: string; name: string; version: string } | null>;
  listDevices(): Promise<string[]>;
}
