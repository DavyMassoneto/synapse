import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadConfig, CONFIG_PATH, LOG_PATH, appiumHome, findAppium, run, bootedSimulator, listDevices } from "./appium.ts";
export const management = {
 load: loadConfig,
 configPath: CONFIG_PATH,
 save(c: Record<string, unknown>) { mkdirSync(dirname(CONFIG_PATH), { recursive: true }); writeFileSync(CONFIG_PATH, JSON.stringify(c, null, 2)); },
 log() { return existsSync(LOG_PATH) ? readFileSync(LOG_PATH, "utf8").split(String.fromCharCode(10)).slice(-25).join(String.fromCharCode(10)) : "no log yet"; },
 async doctor(server: { isUp(): Promise<boolean> }, session: { id: string } | null) {
  const c = loadConfig(); const lines: string[] = [];
  const check = (ok: boolean, text: string) => lines.push((ok ? "✔ " : "✘ ") + text);
  const xcode = await run("xcodebuild", ["-version"]); check(xcode.code === 0, xcode.code === 0 ? xcode.stdout : "Xcode not active");
  const bin = await findAppium(); check(!!bin, bin ? "appium: " + bin : "appium missing");
  if (bin) { const driver = await run(bin, ["driver", "list", "--installed"], { env: { APPIUM_HOME: appiumHome(c) }, timeout: 60000 }); check(/xcuitest/.test(driver.stdout + driver.stderr), "xcuitest driver"); }
  check(existsSync(appiumHome(c)), "APPIUM_HOME: " + appiumHome(c));
  if (c.target === "simulator") { const sim = await bootedSimulator(); check(!!sim, sim ? "simulator: " + sim.name : "no booted simulator"); }
  else { const devices = await listDevices(); check(devices.length > 0, devices.length ? "iPhones: " + devices.join(", ") : "no iPhone detected"); check(!!c.xcodeOrgId, c.xcodeOrgId ? "xcodeOrgId: " + c.xcodeOrgId : "xcodeOrgId not set"); check(!!c.updatedWDABundleId, c.updatedWDABundleId ? "WDA bundle id: " + c.updatedWDABundleId : "updatedWDABundleId not set"); lines.push("Enable Developer Mode and UI Automation on the iPhone."); }
  check(await server.isUp(), "appium server running"); check(!!session, session ? "session " + session.id : "no active session");
  return lines.join(String.fromCharCode(10));
 }
};
