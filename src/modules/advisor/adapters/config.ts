import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
const CONFIG_PATH = join(homedir(), ".pi", "agent", "advisor.json");
import { THINKING, type Config } from "../public/contracts.ts";

export function loadConfig(): Config {
	try {
		if (existsSync(CONFIG_PATH)) {
			const c = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
			return { model: c.model || undefined, thinking: THINKING.includes(c.thinking) ? c.thinking : "high" };
		}
	} catch {
		/* arquivo inválido: usa o padrão */
	}
	return { model: "omniroute/cc/claude-opus-5-5", thinking: "high" };
}

export function saveConfig(cfg: Config) {
	mkdirSync(dirname(CONFIG_PATH), { recursive: true });
	writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n");
}
