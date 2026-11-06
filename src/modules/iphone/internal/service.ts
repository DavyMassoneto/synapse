import { center, findByText, formatElements, parseSource, type El } from "./tree.ts";
import { buildDragActions, createHome, type Driver } from "./homescreen.ts";
import type { Dependencies, SessionPort } from "../public/contracts.ts";
const json = (o: unknown) => JSON.stringify(o);
type Out = { content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }>; details: Record<string, unknown> };
const text = (t: string, details: Record<string, unknown> = {}): Out => ({ content: [{ type: "text", text: t }], details });

const ACTIONS = ["tree", "screenshot", "tap", "double_tap", "long_press", "type", "clear", "swipe", "drag", "homescreen", "scroll", "launch", "terminate", "install", "activate", "home", "press", "alert", "url", "info", "wait", "orientation", "close"] as const;

export function createService(deps: Dependencies) {
	const { loadConfig, AppiumServer, Session, bootedSimulator, listDevices, CONFIG_PATH } = deps;
	const cfg = () => loadConfig();
	const server = new AppiumServer(cfg);
	let session: SessionPort | null = null;
	let elements: El[] = [];
	let viewport = { w: 0, h: 0 };

	let closed = false;
	let currentSignal: AbortSignal | undefined;
	let chain: Promise<unknown> = Promise.resolve();
	const serialize = <T>(fn: () => Promise<T>): Promise<T> => {
		if (closed) return Promise.reject(new Error("iPhone module closed"));
		const run = () => { if (closed) throw new Error("iPhone module closed"); return fn(); };
		const r = chain.then(run, run);
		chain = r.catch(() => undefined);
		return r;
	};

	async function buildCaps(): Promise<Record<string, unknown>> {
		const c = cfg();
		const caps: Record<string, unknown> = {
			platformName: "iOS",
			"appium:automationName": "XCUITest",
			"appium:newCommandTimeout": 600,
			"appium:noReset": true,
			"appium:wdaLaunchTimeout": 240_000,
			"appium:wdaConnectionTimeout": 240_000,
			"appium:useNewWDA": false,
		};
		if (c.target === "simulator") {
			const sim = await bootedSimulator();
			caps["appium:udid"] = c.simulator ?? sim?.udid;
			caps["appium:deviceName"] = c.deviceName ?? sim?.name ?? "iPhone";
			if (c.platformVersion ?? sim?.version) caps["appium:platformVersion"] = c.platformVersion ?? sim?.version;
			if (!caps["appium:udid"]) throw new Error("No booted simulator. Boot one (xcrun simctl boot <name>) or set `simulator` in " + CONFIG_PATH);
		} else {
			const udid = c.udid ?? (await listDevices())[0];
			if (!udid) throw new Error("No iPhone found over USB. Connect + unlock + 'Trust' the Mac, or set `udid` in " + CONFIG_PATH);
			caps["appium:udid"] = udid;
			caps["appium:deviceName"] = c.deviceName ?? "iPhone";
			if (c.platformVersion) caps["appium:platformVersion"] = c.platformVersion;
			if (c.xcodeOrgId) caps["appium:xcodeOrgId"] = c.xcodeOrgId;
			caps["appium:xcodeSigningId"] = c.xcodeSigningId ?? "Apple Development";
			if (c.updatedWDABundleId) caps["appium:updatedWDABundleId"] = c.updatedWDABundleId;
			caps["appium:allowProvisioningDeviceRegistration"] = true;
		}
		return { ...caps, ...(c.capabilities ?? {}) };
	}

	async function getSession(): Promise<SessionPort> {
		currentSignal?.throwIfAborted();
		if (session) {
			try {
				await session.req("GET", "/window/rect", undefined, 8000);
				return session;
			} catch {
				session = null;
			}
		}
		await server.start();
		session = await Session.create(cfg(), await buildCaps(), currentSignal);
		try {
			const r = await session.req("GET", "/window/rect");
			viewport = { w: r.width, h: r.height };
		} catch {}
		return session;
	}

	async function refresh(s: SessionPort, max = 200) {
		const xml: string = await s.req("GET", "/source");
		const p = parseSource(xml, max);
		elements = p.elements;
		return p;
	}

	async function shot(s: SessionPort): Promise<string> {
		return s.req("GET", "/screenshot");
	}

	async function treeResult(s: SessionPort, ctx: any, max?: number, prefix = ""): Promise<Out> {
		const p = await refresh(s, max);
		const body = prefix + formatElements(p.app, p.elements, p.truncated) + (viewport.w ? `\nscreen: ${viewport.w}x${viewport.h} pt` : "");
		const supportsImages = Array.isArray(ctx?.input) ? ctx.input.includes("image") : true;
		const content: Out["content"] = [{ type: "text", text: body }];
		if (supportsImages) {
			try {
				content.push({ type: "image", data: await shot(s), mimeType: "image/png" });
			} catch {}
		}
		return { content, details: { count: p.elements.length, app: p.app } };
	}

	/** Resolve element/text/x,y to a point in screen points. */
	function target(a: any): { x: number; y: number; el?: El } | null {
		if (a.element != null) {
			const e = elements.find((x) => x.i === a.element);
			if (!e) throw new Error(`element ${a.element} not in last tree — run action="tree" first`);
			return { ...center(e), el: e };
		}
		if (a.text) {
			const e = findByText(elements, a.text);
			if (!e) throw new Error(`no element matching ${json(a.text)} in last tree`);
			return { ...center(e), el: e };
		}
		if (a.x != null && a.y != null) return { x: Math.round(a.x), y: Math.round(a.y) };
		return null;
	}

	/** Driver used by homescreen.ts: thin wrappers over the same Appium calls as the plain actions. */
	function makeDriver(s: SessionPort): Driver {
		return {
			shot: async () => {
				const xml: string = await s.req("GET", "/source");
				const p = parseSource(xml, 400);
				elements = p.elements;
				return { app: p.app, els: p.elements };
			},
			drag: async (sp) => {
				const seq = buildDragActions({ ...sp, viewportW: viewport.w || 440 });
				await s.req("POST", "/actions", { actions: [{ type: "pointer", id: "finger1", parameters: { pointerType: "touch" }, actions: seq }] });
				await s.req("DELETE", "/actions").catch(() => undefined);
			},
			tap: async (x, y) => {
				await s.exec("tap", { x, y });
			},
			longPress: async (x, y, seconds) => {
				await s.exec("touchAndHold", { x, y, duration: seconds });
			},
			type: async (t, submit) => {
				await s.exec("keys", { keys: [...t] });
				if (submit) await s.exec("keys", { keys: ["\n"] }).catch(() => undefined);
			},
			swipe: async (dir, x, y) => {
				const dx = Math.round((viewport.w || 440) * 0.3);
				const [fx, tx] = dir === "left" ? [x + dx, x - dx] : [x - dx, x + dx];
				await s.exec("dragFromToForDuration", { fromX: fx, fromY: y, toX: tx, toY: y, duration: 0.3 });
			},
			wait: (seconds) => new Promise<void>((r) => setTimeout(r, seconds * 1000)),
			viewport: () => ({ w: viewport.w, h: viewport.h }),
		};
	}

	async function dispatch(a: any, ctx: any): Promise<Out> {
		const action = String(a.action ?? "").toLowerCase();
		if (!(ACTIONS as readonly string[]).includes(action)) return text(json({ error: `unknown action ${json(action)}`, actions: ACTIONS }));
		if (action === "close") {
			await session?.close();
			session = null;
			return text("session closed");
		}
		const original = await getSession();
		const s: SessionPort = { id: original.id, close: () => original.close(), req: async (method, path, body, timeout) => { currentSignal?.throwIfAborted(); const value = await original.req(method, path, body, timeout, currentSignal); currentSignal?.throwIfAborted(); return value; }, exec: async (script, args) => { currentSignal?.throwIfAborted(); const value = await original.exec(script, args, currentSignal); currentSignal?.throwIfAborted(); return value; } };
		const after = async (note: string): Promise<Out> => {
			if (!a.tree_after) return text(note);
			await new Promise((r) => setTimeout(r, 600));
			return treeResult(s, ctx, a.max, note + "\n");
		};

		switch (action) {
			case "tree":
				return treeResult(s, ctx, a.max);
			case "screenshot":
				return { content: [{ type: "image", data: await shot(s), mimeType: "image/png" }], details: {} };
			case "tap": {
				const t = target(a);
				if (!t) throw new Error("tap needs element, text, or x+y");
				await s.exec("tap", { x: t.x, y: t.y });
				return after(`tapped (${t.x},${t.y})${t.el ? " " + json(t.el.label || t.el.name || t.el.type) : ""}`);
			}
			case "double_tap": {
				const t = target(a);
				if (!t) throw new Error("double_tap needs element, text, or x+y");
				await s.exec("doubleTap", { x: t.x, y: t.y });
				return after(`double-tapped (${t.x},${t.y})`);
			}
			case "long_press": {
				const t = target(a);
				if (!t) throw new Error("long_press needs element, text, or x+y");
				await s.exec("touchAndHold", { x: t.x, y: t.y, duration: a.seconds ?? 1 });
				return after(`long-pressed (${t.x},${t.y})`);
			}
			case "type": {
				if (a.text_input == null) throw new Error("type needs text_input");
				const t = a.element != null || a.x != null ? target(a) : a.text ? target(a) : null;
				if (t) {
					await s.exec("tap", { x: t.x, y: t.y });
					await new Promise((r) => setTimeout(r, 400));
				}
				await s.exec("keys", { keys: [...(a.text_input as string)] }).catch(async () => {
					currentSignal?.throwIfAborted();
					// Fallback: W3C actions on the active element
					const act = await s.req("GET", "/element/active");
					const id = act["element-6066-11e4-a52e-4f735466cecf"] ?? Object.values(act)[0];
					await s.req("POST", `/element/${id}/value`, { text: a.text_input });
				});
				if (a.submit) await s.exec("keys", { keys: ["\n"] }).catch(() => undefined);
				return after(`typed ${a.text_input.length} chars${a.submit ? " + return" : ""}`);
			}
			case "clear": {
				const t = target(a);
				if (!t) throw new Error("clear needs element or text");
				await s.exec("tap", { x: t.x, y: t.y });
				const act = await s.req("GET", "/element/active");
				const id = act["element-6066-11e4-a52e-4f735466cecf"] ?? Object.values(act)[0];
				await s.req("POST", `/element/${id}/clear`, {});
				return after("cleared");
			}
			case "homescreen": {
				const op = String(a.op ?? "").toLowerCase();
				if (!op) throw new Error("homescreen needs op: read|edit|exit_edit|goto|folder|merge|create|extract|rename|hop|compact|audit");
				if (!viewport.w) {
					const r = await s.req("GET", "/window/rect");
					viewport = { w: r.width, h: r.height };
				}
				const res = await createHome(makeDriver(s)).run(op, a);
				return text(json(res), { result: res });
			}
			case "drag": {
				const from = target(a);
				if (!from) throw new Error("drag needs a source: element, text, or x+y");
				const flips = Math.max(0, Math.round(a.flips ?? 0));
				const hasDest = a.to_element != null || a.to_text || (a.to_x != null && a.to_y != null);
				const to = hasDest ? target({ element: a.to_element, text: a.to_text, x: a.to_x, y: a.to_y }) : null;
				if (!to && !flips) throw new Error("drag needs a destination: to_element, to_text, or to_x+to_y (or edge+flips)");
				const holdMs = Math.round((a.seconds ?? 1) * 1000);
				const hoverMs = Math.round((a.hover ?? 0.8) * 1000);
				const moveMs = Math.round((a.move ?? 0.03) * 1000);
				const flipMs = Math.round((a.flip_wait ?? 1.4) * 1000);
				const edgeX = String(a.edge ?? "right").toLowerCase() === "left" ? 2 : Math.max(2, Math.round((viewport.w || 440) - 2));
				const edge2 = edgeX <= 2 ? 16 : edgeX - 14;
				const seq: any[] = [
					{ type: "pointerMove", duration: 0, x: from.x, y: from.y },
					{ type: "pointerDown", button: 0 },
					{ type: "pause", duration: holdMs },
				];
				{
					const liftPx = a.lift_px ?? 14;
					const liftMs = Math.round((a.lift_ms ?? 0.25) * 1000);
					const tx = flips ? edgeX : to ? to.x : from.x;
					const ty = flips ? from.y : to ? to.y : from.y;
					const dist = Math.hypot(tx - from.x, ty - from.y);
					if (liftPx > 0 && dist > liftPx) {
						seq.push({ type: "pointerMove", duration: liftMs, x: Math.round(from.x + ((tx - from.x) / dist) * liftPx), y: Math.round(from.y + ((ty - from.y) / dist) * liftPx) });
						seq.push({ type: "pause", duration: 150 });
					}
				}
				if (flips) {
					seq.push({ type: "pointerMove", duration: 500, x: edgeX, y: from.y });
					for (let i = 0; i < flips; i++) {
						seq.push({ type: "pause", duration: flipMs });
						if (i < flips - 1) {
							seq.push({ type: "pointerMove", duration: 150, x: edge2, y: from.y });
							seq.push({ type: "pointerMove", duration: 150, x: edgeX, y: from.y });
						}
					}
				}
				if (to) {
					seq.push({ type: "pointerMove", duration: moveMs, x: to.x, y: to.y });
					seq.push({ type: "pause", duration: hoverMs });
				}
				seq.push({ type: "pointerUp", button: 0 });
				await s.req("POST", "/actions", { actions: [{ type: "pointer", id: "finger1", parameters: { pointerType: "touch" }, actions: seq }] });
				await s.req("DELETE", "/actions").catch(() => undefined);
				return after("dragged (" + from.x + "," + from.y + ") -> " + (to ? "(" + to.x + "," + to.y + ")" : "edge") + (flips ? " after " + flips + " page flip(s)" : ""));
			}
			case "swipe":
			case "scroll": {
				const dir = String(a.direction ?? "").toLowerCase();
				if (!["up", "down", "left", "right"].includes(dir)) throw new Error("direction must be up|down|left|right");
				const t = target(a);
				// scroll(dir) moves content in `dir` => finger moves the opposite way.
				const swipeDir = action === "scroll" ? ({ up: "down", down: "up", left: "right", right: "left" } as Record<string, string>)[dir] : dir;
				if (t?.el?.type && action === "scroll" && t.el) {
					const r = await s.exec("scroll", { direction: dir, x: t.x, y: t.y }).then(() => true).catch(() => { currentSignal?.throwIfAborted(); return false; });
					if (r) return after(`scrolled ${dir}`);
				}
				const cx = t?.x ?? Math.round(viewport.w / 2);
				const cy = t?.y ?? Math.round(viewport.h / 2);
				const dx = Math.round(viewport.w * 0.3);
				const dy = Math.round(viewport.h * 0.3);
				const [fx, fy, tx, ty] = swipeDir === "up" ? [cx, cy + dy, cx, cy - dy] : swipeDir === "down" ? [cx, cy - dy, cx, cy + dy] : swipeDir === "left" ? [cx + dx, cy, cx - dx, cy] : [cx - dx, cy, cx + dx, cy];
				await s.exec("dragFromToForDuration", { fromX: fx, fromY: fy, toX: tx, toY: ty, duration: 0.3 });
				return after(`${action} ${dir}`);
			}
			case "launch":
			case "activate": {
				if (!a.bundle_id) throw new Error("bundle_id required");
				await s.exec(action === "launch" ? "launchApp" : "activateApp", { bundleId: a.bundle_id });
				return after(`${action}ed ${a.bundle_id}`);
			}
			case "terminate": {
				if (!a.bundle_id) throw new Error("bundle_id required");
				const ok = await s.exec("terminateApp", { bundleId: a.bundle_id });
				return text(`terminated ${a.bundle_id}: ${json(ok)}`);
			}
			case "install": {
				if (!a.path) throw new Error("path required");
				await s.exec("installApp", { app: a.path });
				return text(`installed ${a.path}`);
			}
			case "home":
				await s.exec("pressButton", { name: "home" });
				return after("home");
			case "press": {
				if (!a.button) throw new Error("button required");
				await s.exec("pressButton", { name: a.button });
				return after(`pressed ${a.button}`);
			}
			case "alert": {
				const act = a.alert_action === "dismiss" ? "dismiss" : "accept";
				await s.exec("alert", { action: act, ...(a.button_label ? { buttonLabel: a.button_label } : {}) });
				return after(`alert ${act}ed`);
			}
			case "url": {
				if (!a.url) throw new Error("url required");
				await s.exec("deepLink", { url: a.url, bundleId: a.bundle_id ?? "com.apple.mobilesafari" }).catch(() => { currentSignal?.throwIfAborted(); return s.req("POST", "/url", { url: a.url }); });
				return after(`opened ${a.url}`);
			}
			case "info": {
				const [dev, app] = await Promise.all([s.exec("deviceInfo").catch(() => ({})), s.exec("activeAppInfo").catch(() => ({}))]);
				return text(json({ device: dev, activeApp: app, viewport }));
			}
			case "wait":
				await new Promise((r) => setTimeout(r, Math.min(30, a.seconds ?? 1) * 1000));
				return after(`waited ${a.seconds ?? 1}s`);
			case "orientation": {
				if (a.orientation) await s.req("POST", "/orientation", { orientation: String(a.orientation).toUpperCase() });
				return text(`orientation: ${json(await s.req("GET", "/orientation"))}`);
			}
		}
		return text("unhandled");
	}


	const command = (args: string) => serialize(async () => {
		const [sub = "status", ...rest] = args.trim().split(/\s+/);
		const m = deps.management;
		if (sub === "start") return { text: "appium: " + await server.start(), level: "info" as const };
		if (sub === "stop" || sub === "reset") { try { await session?.close(); } finally { session = null; if (sub === "stop") await server.stop(); } return { text: "session closed", level: "info" as const }; }
		if (sub === "log") return { text: m.log(), level: "info" as const };
		if (sub === "doctor" || sub === "status") return { text: await m.doctor(server, session), level: "info" as const };
		if (sub === "config") { const c: Record<string, any> = m.load(); const pairs = rest.filter(x => x.includes("=")); for (const pair of pairs) { const [key, ...parts] = pair.split("="); c[key] = key === "port" ? Number(parts.join("=")) : parts.join("="); } if (pairs.length) m.save(c); return { text: m.configPath + String.fromCharCode(10) + JSON.stringify(c, null, 2), level: "info" as const }; }
		return { text: "usage: /iphone status | doctor | config [k=v] | start | stop | reset | log", level: "warning" as const };
	});
	return { command, execute: (params: any, supportsImages: boolean, signal?: AbortSignal) => serialize(() => { signal?.throwIfAborted(); currentSignal = signal; return dispatch(params, { input: supportsImages ? ["image"] : [] }).then(result => { signal?.throwIfAborted(); return result; }).finally(() => { currentSignal = undefined; }); }), stop: () => serialize(async () => { await session?.close(); session = null; await server.stop(); }), reset: () => serialize(async () => { await session?.close(); session = null; }), start: () => serialize(() => server.start()), shutdown: async () => { closed = true; await chain; try { await session?.close(); } finally { session = null; await server.stop(); } } };
}