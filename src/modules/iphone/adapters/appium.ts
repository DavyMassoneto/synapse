/**
 * Appium lifecycle + a tiny W3C WebDriver client (plain fetch, no dependencies).
 * Appium and the XCUITest driver live on the external SSD (APPIUM_HOME).
 */
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, openSync, closeSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const STATE_DIR = join(homedir(), ".pi", "agent", "iphone");
export const CONFIG_PATH = join(homedir(), ".pi", "agent", "iphone.json");
export const LOG_PATH = join(STATE_DIR, "appium.log");
const DEFAULT_APPIUM_HOME = "/Volumes/SSD Externo/Development/tooling/appium";

import type { IphoneConfig } from "../public/contracts.ts";

export function loadConfig(): IphoneConfig {
	try {
		return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
	} catch {
		return {};
	}
}

export const appiumHome = (c: IphoneConfig) => process.env.APPIUM_HOME || c.appiumHome || (existsSync(DEFAULT_APPIUM_HOME) ? DEFAULT_APPIUM_HOME : join(homedir(), ".appium"));
export const baseUrl = (c: IphoneConfig) => `http://127.0.0.1:${c.port ?? 4723}`;

export function run(cmd: string, args: string[], opts: { env?: NodeJS.ProcessEnv; timeout?: number } = {}): Promise<{ code: number; stdout: string; stderr: string }> {
	return new Promise((resolve) => {
		execFile(cmd, args, { env: { ...process.env, ...opts.env }, timeout: opts.timeout ?? 30_000, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
			const code = err ? ((err as any).code && typeof (err as any).code === "number" ? (err as any).code : 1) : 0;
			resolve({ code, stdout: String(stdout ?? ""), stderr: String(stderr ?? (err as Error | null)?.message ?? "") });
		});
	});
}

export async function findAppium(): Promise<string | null> {
	const sibling = join(dirname(process.execPath), "appium");
	if (existsSync(sibling)) return sibling;
	const r = await run("/usr/bin/which", ["appium"]);
	return r.code === 0 ? r.stdout.trim() : null;
}

export async function listDevices(): Promise<string[]> {
	const r = await run("idevice_id", ["-l"], { timeout: 8000 });
	return r.code === 0 ? r.stdout.split("\n").map((s) => s.trim()).filter(Boolean) : [];
}

export async function bootedSimulator(): Promise<{ udid: string; name: string; version: string } | null> {
	const r = await run("xcrun", ["simctl", "list", "devices", "booted", "-j"], { timeout: 10_000 });
	if (r.code !== 0) return null;
	try {
		const j = JSON.parse(r.stdout);
		for (const [rt, devs] of Object.entries<any[]>(j.devices ?? {})) {
			const d = devs.find((x) => x.state === "Booted");
			if (d) return { udid: d.udid, name: d.name, version: (rt.match(/iOS-([\d-]+)/)?.[1] ?? "").replace(/-/g, ".") };
		}
	} catch {}
	return null;
}

export class AppiumServer {
	private proc: ChildProcess | null = null;
	constructor(private cfg: () => IphoneConfig) {}

	async isUp(): Promise<boolean> {
		try {
			const r = await fetch(`${baseUrl(this.cfg())}/status`, { signal: AbortSignal.timeout(2000) });
			return r.ok;
		} catch {
			return false;
		}
	}

	async start(): Promise<string> {
		if (await this.isUp()) return "already running";
		const bin = await findAppium();
		if (!bin) throw new Error("appium not found. Install: npm i -g appium && appium driver install xcuitest");
		mkdirSync(STATE_DIR, { recursive: true });
		const log = openSync(LOG_PATH, "a");
		const c = this.cfg();
		try {
			this.proc = spawn(bin, ["--port", String(c.port ?? 4723), "--log-timestamp"], { env: { ...process.env, APPIUM_HOME: appiumHome(c) }, stdio: ["ignore", log, log], detached: false });
		} finally { closeSync(log); }
		this.proc.on("error", () => (this.proc = null));
		this.proc.on("exit", () => (this.proc = null));
		for (let i = 0; i < 40; i++) {
			if (await this.isUp()) return `started (pid ${this.proc?.pid}, log ${LOG_PATH})`;
			if (!this.proc) break;
			await new Promise((r) => setTimeout(r, 500));
		}
		throw new Error(`appium failed to start; see ${LOG_PATH}`);
	}

	async stop() {
		const proc = this.proc;
		if (!proc) return;
		if (proc.exitCode !== null || proc.signalCode !== null) return;
		await new Promise<void>((resolve) => {
			const timer = setTimeout(() => { proc.kill("SIGKILL"); }, 5000);
			const done = () => { clearTimeout(timer); resolve(); };
			proc.once("exit", done); proc.once("error", done); if (!proc.kill("SIGTERM")) done();
		});
		if (this.proc === proc) this.proc = null;
	}
}

export class WebDriverError extends Error {
	constructor(public code: string, message: string) {
		super(message);
	}
}

export class Session {
	constructor(public id: string, public base: string, public caps: Record<string, any>) {}

	static async create(cfg: IphoneConfig, caps: Record<string, unknown>, signal?: AbortSignal): Promise<Session> {
		const base = baseUrl(cfg);
		const v = await http("POST", `${base}/session`, { capabilities: { alwaysMatch: caps } }, 15 * 60_000, signal);
		return new Session(v.sessionId, base, v.capabilities ?? {});
	}

	req(method: string, path: string, body?: unknown, timeout = 120_000, signal?: AbortSignal) {
		return http(method, `${this.base}/session/${this.id}${path}`, body, timeout, signal);
	}
	exec(script: string, args: Record<string, unknown> = {}, signal?: AbortSignal) {
		return this.req("POST", "/execute/sync", { script: `mobile: ${script}`, args: [args] }, 120000, signal);
	}
	async close() {
		try {
			await http("DELETE", `${this.base}/session/${this.id}`, undefined, 15_000);
		} catch {}
	}
}

async function http(method: string, url: string, body?: unknown, timeout = 120_000, signal?: AbortSignal): Promise<any> {
	const res = await fetch(url, {
		method,
		headers: body !== undefined ? { "content-type": "application/json" } : undefined,
		body: body !== undefined ? JSON.stringify(body) : undefined,
		signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout),
	});
	const text = await res.text();
	let j: any;
	try {
		j = JSON.parse(text);
	} catch {
		throw new WebDriverError("bad response", `HTTP ${res.status}: ${text.slice(0, 300)}`);
	}
	const v = j.value;
	if (v && typeof v === "object" && typeof v.error === "string") throw new WebDriverError(v.error, String(v.message ?? v.error).split("\n")[0].slice(0, 500));
	if (!res.ok) throw new WebDriverError("http", `HTTP ${res.status}: ${text.slice(0, 300)}`);
	return v;
}
