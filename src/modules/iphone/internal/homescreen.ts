/**
 * Home Screen operations for the iphone tool (action "home").
 *
 * Learned on a real iPhone (iPhone18,2, iOS 26.6, 440x956 pt) while organising the Home Screen into folders.
 * Every fact below was observed on the device (see README, section "Home screen"):
 *  - Grid: 4 columns x 6 rows. Icon-graphic centers: x = 69,170,271,371 and y = 126 + row*108.6. A page holds 24
 *    slots and may contain EMPTY slots. Dock icons (y > 800) are not part of the grid. Widgets cover several slots.
 *  - Dragging only works in edit mode (Button "OK" at the top right; inside a folder: DeleteButton elements).
 *  - A drag is: hold 0.5s, slow 14pt "lift", 30ms jump to the destination, short hover. A slow final move REORDERS
 *    instead of folding into a folder.
 *  - Lifting an icon that has other icons after it makes them slide back into its slot; only moving the LAST icon into
 *    an earlier gap shifts nobody. Every move is verified against a before/after position map.
 *  - Page flips: holding at the screen edge flips pages continuously. edge + flips=1 + flip_wait 0.85 + a destination
 *    slot on the target page crosses exactly ONE page. Never release at the edge, never land on a full page, and and on a
 *    page with widgets start from a slot with no widget between the icon and the edge (pathBlocked; a top-row drag over a widget did not flip, a row below it did).
 *  - Folder names are typed on the keyboard; a-tilde, u-acute and o-acute are silently dropped (c-cedilla works).
 *  - A folder with one app survives until its last app leaves. A vanished icon does NOT prove it entered the intended
 *    folder: always open the destination folder and compare its contents.
 *  - Edit mode adds an EMPTY page at the end of the Home Screen and of every folder: the indicator reads real pages + 1 ("Página 1 de 2" for a one-page
 *    folder, home 3 instead of 2) and a swipe inside a folder never reaches it. Folder contents are therefore read by app count (the "N apps" badge).
 *  - Inside a folder, in edit mode, swipes do NOT paginate and the folder reopens on the last page seen. Observed taps on the page control to leave edit mode
 *    inside a folder: worked twice (as the second tap, or right after entering edit with a long-press inside the folder) and failed twice (as the first tap at
 *    x+w-12 with edit started on the home screen). No reliable gesture exists, so folders are opened with the Home Screen OUT of edit mode (OK button, which
 *    worked every time) and paginated there (right swipe x300,y380 and left swipe x220,y480 worked; right swipes at y=250 or y=700 did not). Edit mode inside
 *    a folder is entered only by a long-press at (300,900) after the page was found, and closing a folder also ends edit mode.
 * Every function returns { ok, stop?, ... } and stops at the first deviation (no automatic parameter variation).
 */
import type { El } from "./tree.ts";

export const GRID = { w: 440, h: 956, xs: [69, 170, 271, 371], y0: 126, dy: 108.6, rows: 6, cols: 4, cap: 24, iconDy: 34, dockY: 800 };

export const rowY = (r: number): number => Math.round(GRID.y0 + r * GRID.dy);
export const colOf = (x: number): number => {
	let b = 0;
	for (let i = 1; i < GRID.cols; i++) if (Math.abs(GRID.xs[i] - x) < Math.abs(GRID.xs[b] - x)) b = i;
	return b;
};
export const rowOfY = (y: number): number => Math.max(0, Math.min(GRID.rows - 1, Math.round((y - GRID.y0) / GRID.dy)));

export interface Shot {
	app: string;
	els: El[];
}
export interface DragSpec {
	x: number;
	y: number;
	toX?: number;
	toY?: number;
	hold?: number;
	hover?: number;
	move?: number;
	liftPx?: number;
	liftMs?: number;
	edge?: string;
	flips?: number;
	flipWait?: number;
	viewportW?: number;
}
export interface Driver {
	shot(): Promise<Shot>;
	drag(spec: DragSpec): Promise<void>;
	tap(x: number, y: number): Promise<void>;
	longPress(x: number, y: number, seconds: number): Promise<void>;
	type(text: string, submit: boolean): Promise<void>;
	swipe(dir: "left" | "right", x: number, y: number): Promise<void>;
	wait(seconds: number): Promise<void>;
	viewport(): { w: number; h: number };
}
export interface Icon {
	name: string;
	folder: boolean;
	badge: string;
	x: number;
	y: number;
	col: number;
	row: number;
	slot: number;
}
export interface State {
	page: number | null;
	total: number | null;
	edit: boolean;
	alert: boolean;
	inFolder: boolean;
	app: string;
	icons: Icon[];
	widgetSlots: number[];
	els: El[];
}
export type Res = { ok: boolean; stop?: string; [k: string]: unknown };
export type Plan = { kind: "ok" } | { kind: "stop"; why: string } | { kind: "move"; mover: Icon; col: number; row: number; endMove: boolean };

const fail = (stop: string, extra: Record<string, unknown> = {}): Res => ({ ok: false, stop, ...extra });
const clean = (s: string): string => s.replace(/[\u200e\u200f\u202a-\u202e]/g, "");
const keyOf = (i: Icon): string => (i.folder ? "F:" : "") + i.name;
/** Edit mode adds an EMPTY page at the end of the Home Screen and of every folder (measured: "Página 1 de 2" for a one-page folder, home total 3 instead of 2). */
export const realTotal = (s: { edit: boolean; total: number | null }): number | null => (s.total !== null && s.edit && s.total > 1 ? s.total - 1 : s.total);

/** Folder titles are typed with the keyboard: only printable ASCII and c-cedilla survive. */
export const isTypable = (name: string): boolean => /^[\x20-\x7EçÇ]+$/.test(name);

/** The W3C pointer sequence of a drag; identical to what the plain "drag" action in index.ts sends (checked against the device log). */
export function buildDragActions(sp: DragSpec): any[] {
	const hold = Math.round((sp.hold ?? 1) * 1000);
	const hover = Math.round((sp.hover ?? 0.8) * 1000);
	const moveMs = Math.round((sp.move ?? 0.03) * 1000);
	const flipMs = Math.round((sp.flipWait ?? 1.4) * 1000);
	const flips = Math.max(0, Math.round(sp.flips ?? 0));
	const vw = sp.viewportW ?? GRID.w;
	const edgeX = String(sp.edge ?? "right").toLowerCase() === "left" ? 2 : Math.max(2, Math.round(vw - 2));
	const edge2 = edgeX <= 2 ? 16 : edgeX - 14;
	const hasTo = sp.toX != null && sp.toY != null;
	if (!hasTo && !flips) throw new Error("drag needs a destination (toX,toY) or edge+flips");
	const seq: any[] = [
		{ type: "pointerMove", duration: 0, x: sp.x, y: sp.y },
		{ type: "pointerDown", button: 0 },
		{ type: "pause", duration: hold },
	];
	const liftPx = sp.liftPx ?? 14;
	const liftMs = Math.round((sp.liftMs ?? 0.25) * 1000);
	const tx = flips ? edgeX : hasTo ? (sp.toX as number) : sp.x;
	const ty = flips ? sp.y : hasTo ? (sp.toY as number) : sp.y;
	const dist = Math.hypot(tx - sp.x, ty - sp.y);
	if (liftPx > 0 && dist > liftPx) {
		seq.push({ type: "pointerMove", duration: liftMs, x: Math.round(sp.x + ((tx - sp.x) / dist) * liftPx), y: Math.round(sp.y + ((ty - sp.y) / dist) * liftPx) });
		seq.push({ type: "pause", duration: 150 });
	}
	if (flips) {
		seq.push({ type: "pointerMove", duration: 500, x: edgeX, y: sp.y });
		for (let i = 0; i < flips; i++) {
			seq.push({ type: "pause", duration: flipMs });
			if (i < flips - 1) {
				seq.push({ type: "pointerMove", duration: 150, x: edge2, y: sp.y });
				seq.push({ type: "pointerMove", duration: 150, x: edgeX, y: sp.y });
			}
		}
	}
	if (hasTo) {
		seq.push({ type: "pointerMove", duration: moveMs, x: sp.toX, y: sp.toY });
		seq.push({ type: "pause", duration: hover });
	}
	seq.push({ type: "pointerUp", button: 0 });
	return seq;
}

/** Parse the accessibility elements of the Home Screen (or of an open folder) into a slot model. */
export function parseState(shot: Shot): State {
	const els = shot.els;
	const icons: Icon[] = [];
	const widget = new Set<number>();
	for (const e of els) {
		if (e.type !== "Icon") continue;
		if (e.y + e.h / 2 >= GRID.dockY) continue;
		if (/Widget/.test(e.value)) {
			for (let r = 0; r < GRID.rows; r++)
				for (let c = 0; c < GRID.cols; c++) {
					const cx = GRID.xs[c];
					const cy = rowY(r);
					if (cx >= e.x && cx <= e.x + e.w && cy >= e.y && cy <= e.y + e.h) widget.add(r * GRID.cols + c);
				}
			continue;
		}
		const label = clean(e.label || e.name);
		const folder = /^pasta /.test(label);
		const name = folder ? clean(e.name && e.name !== e.label ? e.name : label.replace(/^pasta /, "")) : label;
		const x = Math.round(e.x + e.w / 2);
		const y = Math.round(e.y + GRID.iconDy);
		const col = colOf(x);
		const row = rowOfY(y);
		icons.push({ name, folder, badge: e.value, x, y, col, row, slot: row * GRID.cols + col });
	}
	let page: number | null = null;
	let total: number | null = null;
	for (const e of els) {
		if (e.type !== "PageIndicator") continue;
		const m = /Página (\d+) de (\d+)/.exec(e.value || e.label || "");
		if (m) {
			page = Number(m[1]);
			total = Number(m[2]);
		}
	}
	const okButton = els.some((e) => e.type === "Button" && (e.label === "OK" || e.name === "OK") && e.x >= 300 && e.y < 60);
	const deletes = els.filter((e) => e.type === "Button" && e.name === "DeleteButton").length;
	return {
		page,
		total,
		edit: okButton || deletes > 0,
		alert: els.some((e) => e.type === "Alert"),
		inFolder: els.some((e) => e.type === "TextField" && /Nome da pasta/.test(e.label + " " + e.name)),
		app: shot.app,
		icons,
		widgetSlots: [...widget].sort((a, b) => a - b),
		els,
	};
}

export const posMap = (s: State): Record<string, string> => {
	const m: Record<string, string> = {};
	for (const i of s.icons) m[keyOf(i)] = i.col + "," + i.row;
	return m;
};
const usedSlots = (s: State, skip?: Icon): Set<number> => new Set<number>([...s.icons.filter((i) => i !== skip).map((i) => i.slot), ...s.widgetSlots]);
/** First slot after the last occupied one (icons and widgets), ignoring an optional icon. */
export const endSlotOf = (s: State, skip?: Icon): number => {
	const v = [...usedSlots(s, skip)];
	return v.length ? Math.max(...v) + 1 : 0;
};
const countNames = (icons: Icon[]): Record<string, number> => {
	const m: Record<string, number> = {};
	for (const i of icons) m[i.name] = (m[i.name] || 0) + 1;
	return m;
};
const folderCountOf = (badge: string): number => {
	const m = /(\d+) apps?/.exec(badge || "");
	return m ? Number(m[1]) : 0;
};
const pick = (s: State, name: string, folder: boolean): Icon | undefined => {
	const n = clean(name);
	const m = s.icons.filter((i) => i.name === n && i.folder === folder);
	return m.length === 1 ? m[0] : undefined;
};

/** True when a widget lies between the icon and the screen edge it will be dragged to (a top-row drag over a widget did not flip the page; the bottom row did). */
export function pathBlocked(s: { widgetSlots: number[] }, it: { col: number; row: number }, dir: "left" | "right"): boolean {
	return s.widgetSlots.some((q) => Math.floor(q / GRID.cols) === it.row && (dir === "right" ? q % GRID.cols > it.col : q % GRID.cols < it.col));
}

/** Decide how to make icon A sit in the slot right next to icon D (same row) with a move that disturbs nobody. */
export function planAdjacency(s: State, A: Icon, D: Icon): Plan {
	if (A.row === D.row && Math.abs(A.col - D.col) === 1) return { kind: "ok" };
	const occ = usedSlots(s);
	const free = (c: number, r: number) => c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows && !occ.has(r * GRID.cols + c);
	const lastIdx = Math.max(...s.icons.map((i) => i.slot));
	const aLast = A.slot === lastIdx;
	const dLast = D.slot === lastIdx;
	if (aLast) for (const dc of [-1, 1]) if (free(D.col + dc, D.row)) return { kind: "move", mover: A, col: D.col + dc, row: D.row, endMove: false };
	if (dLast) for (const dc of [-1, 1]) if (free(A.col + dc, A.row)) return { kind: "move", mover: D, col: A.col + dc, row: A.row, endMove: false };
	if (!dLast) {
		const n = endSlotOf(s, D);
		if (n >= GRID.cap) return { kind: "stop", why: "page full" };
		return { kind: "move", mover: D, col: n % GRID.cols, row: Math.floor(n / GRID.cols), endMove: true };
	}
	if (!aLast) {
		const n = endSlotOf(s, A);
		if (n >= GRID.cap) return { kind: "stop", why: "page full" };
		return { kind: "move", mover: A, col: n % GRID.cols, row: Math.floor(n / GRID.cols), endMove: true };
	}
	return { kind: "stop", why: "no plan; layout " + JSON.stringify(posMap(s)) };
}

export function createHome(d: Driver) {
	async function read(): Promise<State> {
		const v = d.viewport();
		if (v.w !== GRID.w || v.h !== GRID.h) throw new Error("home grid is calibrated for " + GRID.w + "x" + GRID.h + " pt but the device reports " + v.w + "x" + v.h + "; recalibrate GRID in homescreen.ts");
		return parseState(await d.shot());
	}

	async function closeFolder(): Promise<State> {
		let s = await read();
		for (let i = 0; i < 2 && s.inFolder; i++) {
			await d.tap(220, 850 + i * 30);
			await d.wait(1);
			s = await read();
		}
		return s;
	}

	/** Enter edit mode (long-press an empty area); also works inside an open folder. */
	async function ensureEdit(): Promise<State> {
		let s = await read();
		if (s.alert || s.edit) return s;
		if (s.inFolder) await d.longPress(300, 900, 1.8);
		else await d.longPress(360, 790, 1.8);
		await d.wait(1);
		s = await read();
		return s;
	}

	async function exitEdit(): Promise<Res> {
		let s = await closeFolder();
		if (s.alert) return fail("alert on screen");
		if (!s.edit) return { ok: true, edit: false };
		await d.tap(356, 33);
		await d.wait(1.5);
		s = await read();
		return s.edit ? fail("still in edit mode") : { ok: true, edit: false };
	}

	/** Go to a Home Screen page by swiping. Never swipes past the last page (that opens the App Library). */
	async function goPage(n: number): Promise<Res> {
		const trail: Array<number | null> = [];
		for (let i = 0; i < 10; i++) {
			let s = await read();
			if (s.inFolder) s = await closeFolder();
			trail.push(s.page);
			if (s.page === n) return { ok: true, page: n, total: realTotal(s), trail };
			const dir = s.page === null || s.page > n ? "right" : "left";
			const last = realTotal(s);
			if (dir === "left" && last !== null && s.page !== null && s.page >= last) return fail("page " + n + " does not exist (last page is " + last + ")", { trail });
			await d.swipe(dir, 220, 790);
			await d.wait(0.8);
		}
		return fail("could not reach page " + n, { trail });
	}

	const sigOf = (s: State): string => (s.page ?? 1) + "|" + s.icons.map((i) => i.name).sort().join(",");
	/** Swipes that paginated a folder outside edit mode: right = (x 300, y 380) i.e. 168 -> 432, left = (x 220, y 480) i.e. 352 -> 88. */
	const FOLDER_SWIPE = { right: { x: 300, y: 380 }, left: { x: 220, y: 480 } };
	async function folderRewind(): Promise<State> {
		let s = await read();
		for (let k = 0; k < 4 && s.inFolder && (s.page ?? 1) > 1; k++) {
			const sig = sigOf(s);
			await d.swipe("right", FOLDER_SWIPE.right.x, FOLDER_SWIPE.right.y);
			await d.wait(0.7);
			s = await read();
			if (sigOf(s) === sig) break;
		}
		return s;
	}

	/** Contents of the folder whose icon is at the given position: read OUTSIDE edit mode, all inner pages, then the folder is closed. */
	async function readFolderAt(icon: Icon): Promise<Res> {
		const want = folderCountOf(icon.badge);
		if (want < 1) return fail("the folder icon has no app count in its badge: " + icon.name + " [" + icon.badge + "]");
		let cur = await read();
		if (cur.inFolder) cur = await closeFolder();
		if (cur.edit) {
			// Leaving edit mode inside a folder is not reliable (see header); leave it on the Home Screen with the OK button, then open the folder.
			const x = await exitEdit();
			if (!x.ok) return fail("could not leave edit mode on the home screen before opening " + icon.name + ": " + x.stop);
			cur = await read();
			const again = pick(cur, icon.name, true);
			if (!again) return fail("folder not found after leaving edit mode: " + icon.name);
			icon = again;
		}
		await d.tap(icon.x, icon.y);
		await d.wait(1.3);
		let s = await read();
		if (!s.inFolder) return fail("folder did not open: " + icon.name);
		if (s.edit) {
			await closeFolder();
			return fail("the folder " + icon.name + " opened in edit mode although the Home Screen was not editing");
		}
		const names = new Set<string>();
		let lastPage = 0;
		for (let attempt = 0; attempt < 2 && names.size !== want; attempt++) {
			names.clear();
			s = await folderRewind();
			let prev = "";
			for (let k = 0; k < 8; k++) {
				if (!s.inFolder) return fail("left the folder while reading it");
				const sig = sigOf(s);
				if (sig === prev) break;
				prev = sig;
				lastPage = s.page ?? 1;
				for (const i of s.icons) names.add(i.name);
				if (names.size >= want) break;
				await d.swipe("left", FOLDER_SWIPE.left.x, FOLDER_SWIPE.left.y);
				await d.wait(0.7);
				s = await read();
			}
		}
		await closeFolder();
		const ok = names.size === want;
		const list = [...names].sort();
		return { ok, stop: ok ? undefined : "read " + names.size + " of " + want + " apps in " + icon.name + ": " + list.join(", "), names: list, pages: lastPage };
	}

	async function readFolder(name: string): Promise<Res> {
		const s = await read();
		const f = pick(s, name, true);
		if (!f) return fail("folder not found or ambiguous on page " + s.page + ": " + name);
		return readFolderAt(f);
	}

	/** Make src and dst neighbours in the same row, moving only one icon and checking that nobody else moved. */
	async function ensureAdj(srcName: string, dstName: string, dstIsFolder: boolean, page: number | null, log: string[]): Promise<string | null> {
		for (let iter = 0; iter < 4; iter++) {
			const s = await ensureEdit();
			if (s.page !== page || !s.edit || s.alert || s.inFolder) return "state: page " + s.page + " edit " + s.edit + " alert " + s.alert + " folder " + s.inFolder;
			const A = pick(s, srcName, false);
			const D = pick(s, dstName, dstIsFolder);
			if (!A || !D) return "missing or ambiguous: " + (A ? "" : srcName + " ") + (D ? "" : dstName);
			const plan = planAdjacency(s, A, D);
			if (plan.kind === "ok") return null;
			if (plan.kind === "stop") return plan.why;
			const before = posMap(s);
			const key = keyOf(plan.mover);
			await d.drag({ x: plan.mover.x, y: plan.mover.y, toX: GRID.xs[plan.col], toY: rowY(plan.row), hold: 0.5, hover: 0.5 });
			log.push(key + " -> slot " + plan.col + "," + plan.row);
			await d.wait(1.5);
			const s2 = await read();
			if (s2.page !== page || !s2.edit || s2.alert) return "after move: page " + s2.page + " edit " + s2.edit + " alert " + s2.alert;
			const after = posMap(s2);
			const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
			if (!plan.endMove && (changed.length !== 1 || changed[0] !== key)) return "unexpected layout change: " + JSON.stringify(changed) + " before " + JSON.stringify(before) + " after " + JSON.stringify(after);
		}
		return "no adjacency after 4 moves";
	}

	/** Fold a loose app of the current page into a folder of the same page. Verified: folder = before + app. */
	async function mergeInto(srcName: string, dstName: string): Promise<Res> {
		let s = await ensureEdit();
		if (s.alert) return fail("alert on screen");
		if (!s.edit) return fail("could not enter edit mode");
		const page = s.page;
		if (!pick(s, srcName, false) || !pick(s, dstName, true)) return fail("missing or ambiguous on page " + page + ": " + srcName + " / folder " + dstName);
		const before = await readFolder(dstName);
		if (!before.ok) return fail("could not read folder " + dstName + " before: " + before.stop);
		const log: string[] = [];
		const e = await ensureAdj(srcName, dstName, true, page, log);
		if (e) return fail(e, { log });
		s = await ensureEdit();
		const A = pick(s, srcName, false);
		const D = pick(s, dstName, true);
		if (!A || !D) return fail("lost the icons after adjacency", { log });
		await d.drag({ x: A.x, y: A.y, toX: GRID.xs[D.col], toY: rowY(D.row), hold: 0.5, hover: 0.5 });
		await d.wait(1.5);
		s = await read();
		if (s.page !== page || s.alert) return fail("after drop: page " + s.page + " alert " + s.alert, { log });
		if (pick(s, srcName, false)) return fail(srcName + " is still loose", { log, layout: posMap(s) });
		const after = await readFolder(dstName);
		const want = [...(before.names as string[]), clean(srcName)].sort();
		const ok = !!after.ok && JSON.stringify(after.names) === JSON.stringify(want);
		return { ok, stop: ok ? undefined : "folder contents differ from before+app", before: before.names, after: after.names, want, log };
	}

	/** Rename the folder whose icon is at the given position (edit mode shows the clear-text button). */
	async function renameAt(icon: Icon, newName: string): Promise<Res> {
		if (!isTypable(newName)) return fail("the keyboard drops accented letters (a-tilde, u-acute, o-acute...); use ASCII or c-cedilla: " + newName);
		await ensureEdit();
		await d.tap(icon.x, icon.y);
		await d.wait(1.3);
		let s = await read();
		if (!s.inFolder) return fail("folder did not open");
		const findClear = (st: State) => st.els.find((e) => e.type === "Button" && (e.label === "Limpar texto" || e.name === "Limpar texto"));
		let clear = findClear(s);
		if (!clear) {
			const tf = s.els.find((e) => e.type === "TextField" && /Nome da pasta/.test(e.label + " " + e.name));
			if (tf) {
				await d.tap(Math.round(tf.x + tf.w / 2), Math.round(tf.y + tf.h / 2));
				await d.wait(0.6);
				s = await read();
				clear = findClear(s);
			}
		}
		if (!clear) {
			await closeFolder();
			return fail("no clear-text button in the folder title");
		}
		await d.tap(Math.round(clear.x + clear.w / 2), Math.round(clear.y + clear.h / 2));
		await d.wait(0.5);
		await d.type(newName, true);
		await d.wait(1);
		s = await read();
		const tf2 = s.els.find((e) => e.type === "TextField" && /Nome da pasta/.test(e.label + " " + e.name));
		const got = tf2 ? tf2.value : "";
		await closeFolder();
		return got === newName ? { ok: true, name: got } : fail("the title became '" + got + "'", { got });
	}

	async function renameFolder(oldName: string, newName: string): Promise<Res> {
		if (!isTypable(newName)) return fail("the keyboard drops accented letters; use ASCII or c-cedilla: " + newName);
		const s = await ensureEdit();
		const f = pick(s, oldName, true);
		if (!f) return fail("folder not found or ambiguous on page " + s.page + ": " + oldName);
		return renameAt(f, newName);
	}

	/** Create a folder from two loose icons of the current page and name it. Identified by before/after folder counts. */
	async function createFolder(aName: string, bName: string, newName: string): Promise<Res> {
		if (!isTypable(newName)) return fail("the keyboard drops accented letters; use ASCII or c-cedilla: " + newName);
		let s = await ensureEdit();
		if (s.alert) return fail("alert on screen");
		if (!s.edit) return fail("could not enter edit mode");
		const page = s.page;
		const foldersBefore = countNames(s.icons.filter((i) => i.folder));
		if (!pick(s, aName, false) || !pick(s, bName, false)) return fail("missing or ambiguous loose icons on page " + page + ": " + aName + " / " + bName);
		const log: string[] = [];
		const e = await ensureAdj(aName, bName, false, page, log);
		if (e) return fail(e, { log });
		s = await ensureEdit();
		const A = pick(s, aName, false);
		const B = pick(s, bName, false);
		if (!A || !B) return fail("lost the icons after adjacency", { log });
		await d.drag({ x: A.x, y: A.y, toX: GRID.xs[B.col], toY: rowY(B.row), hold: 0.5, hover: 0.5 });
		await d.wait(1.5);
		s = await read();
		if (s.page !== page || s.alert) return fail("after drop: page " + s.page + " alert " + s.alert, { log });
		if (pick(s, aName, false) || pick(s, bName, false)) return fail("icons are still loose", { log, layout: posMap(s) });
		const foldersAfter = countNames(s.icons.filter((i) => i.folder));
		const created = Object.keys(foldersAfter).filter((k) => foldersAfter[k] > (foldersBefore[k] || 0));
		if (created.length !== 1) return fail("expected exactly one new folder, got " + JSON.stringify(created), { log });
		const want = [clean(aName), clean(bName)].sort();
		let target: Icon | undefined;
		for (const f of s.icons.filter((i) => i.folder && i.name === created[0])) {
			const r = await readFolderAt(f);
			if (r.ok && JSON.stringify(r.names) === JSON.stringify(want)) {
				target = f;
				break;
			}
		}
		if (!target) return fail("no folder with exactly " + want.join(" + ") + " (auto name " + created[0] + ")", { log });
		const rn = await renameAt(target, newName);
		if (!rn.ok) return fail("folder created as '" + created[0] + "' but the rename failed: " + rn.stop, { log });
		// the icon now carries the NEW title: readFolderAt re-finds the folder by name after leaving edit mode
		const check = await readFolderAt({ ...target, name: clean(newName) });
		const ok = !!check.ok && JSON.stringify(check.names) === JSON.stringify(want);
		return { ok, stop: ok ? undefined : "verification after rename failed: " + (check.stop ?? "contents " + JSON.stringify(check.names) + " differ from " + JSON.stringify(want)), autoName: created[0], name: newName, contents: check.names, log };
	}

	/** Take an app out of a folder and drop it in a free slot of the last row (outside the folder box). */
	async function extract(folderName: string, appName: string): Promise<Res> {
		let s = await read();
		if (s.inFolder) s = await closeFolder();
		if (s.alert) return fail("alert on screen");
		if (s.edit) {
			const x = await exitEdit();
			if (!x.ok) return fail("could not leave edit mode on the home screen: " + x.stop);
			s = await read();
		}
		const page = s.page;
		const f = pick(s, folderName, true);
		if (!f) return fail("folder not found or ambiguous on page " + page + ": " + folderName);
		const occ = usedSlots(s);
		let col = -1;
		for (const c of [3, 2, 1, 0]) if (!occ.has(5 * GRID.cols + c)) {
			col = c;
			break;
		}
		if (col < 0) return fail("no free slot in the bottom row to drop the app; free one first");
		const countBefore = folderCountOf(f.badge);
		await d.tap(f.x, f.y);
		await d.wait(1.3);
		let t = await read();
		if (!t.inFolder) return fail("folder did not open");
		if (t.edit) {
			await closeFolder();
			return fail("the folder opened in edit mode although the Home Screen was not editing");
		}
		t = await folderRewind();
		let app = pick(t, appName, false);
		let prev = "";
		for (let p = 0; !app && p < 8; p++) {
			const sig = sigOf(t);
			if (sig === prev) break;
			prev = sig;
			await d.swipe("left", FOLDER_SWIPE.left.x, FOLDER_SWIPE.left.y);
			await d.wait(0.7);
			t = await read();
			if (!t.inFolder) break;
			app = pick(t, appName, false);
		}
		if (!app) {
			await closeFolder();
			return fail("app not found in the folder: " + appName);
		}
		await d.longPress(300, 900, 1.8);
		await d.wait(1);
		t = await read();
		if (!t.edit || !t.inFolder) {
			await closeFolder();
			return fail("no edit mode inside the folder");
		}
		app = pick(t, appName, false);
		if (!app) {
			await closeFolder();
			return fail("app moved after entering edit mode: " + appName);
		}
		await d.drag({ x: app.x, y: app.y, toX: GRID.xs[col], toY: rowY(5) + 33, hold: 0.5, hover: 2.0 });
		await d.wait(2);
		s = await read();
		if (s.inFolder) return fail("still inside the folder view after the drop");
		if (s.page !== page || !pick(s, appName, false)) return fail(appName + " is not loose on page " + page + " after the drop", { layout: posMap(s) });
		const f2 = pick(s, folderName, true);
		const countAfter = f2 ? folderCountOf(f2.badge) : 0;
		const ok = countAfter === countBefore - 1;
		return { ok, stop: ok ? undefined : "folder count went from " + countBefore + " to " + countAfter, countBefore, countAfter };
	}

	/** Move an icon or folder to the last position of its page (moves nobody else). */
	async function moveToEnd(name: string, folder: boolean): Promise<Res> {
		const s = await ensureEdit();
		const it = pick(s, name, folder);
		if (!it) return fail("missing or ambiguous: " + name);
		const rest = usedSlots(s, it);
		const last = rest.size ? Math.max(...rest) : -1;
		if (it.slot > last) return { ok: true, already: true };
		const n = last + 1;
		if (n >= GRID.cap) return fail("page full");
		await d.drag({ x: it.x, y: it.y, toX: GRID.xs[n % GRID.cols], toY: rowY(Math.floor(n / GRID.cols)), hold: 0.5, hover: 0.5 });
		await d.wait(1.5);
		const s2 = await read();
		const it2 = pick(s2, name, folder);
		if (!it2) return fail("lost after the move");
		const rest2 = usedSlots(s2, it2);
		const last2 = rest2.size ? Math.max(...rest2) : -1;
		return it2.slot > last2 ? { ok: true } : fail("not last after the move");
	}

	/** Carry an icon or folder across ONE page boundary (cascade-checked). */
	async function hop(name: string, folder: boolean, from: number, to: number): Promise<Res> {
		if (Math.abs(to - from) !== 1) return fail("a hop crosses exactly one page per gesture");
		const g1 = await goPage(to);
		if (!g1.ok) return g1;
		const sD = await read();
		const n = endSlotOf(sD);
		if (n >= GRID.cap) return fail("destination page is full");
		const namesD = sD.icons.map(keyOf);
		const total = realTotal(sD) ?? 0;
		const nxt = to + (to > from ? 1 : -1);
		let nextBefore: number | null = null;
		if (nxt >= 1 && nxt <= total) {
			const g = await goPage(nxt);
			if (!g.ok) return g;
			nextBefore = (await read()).icons.length;
		}
		const g2 = await goPage(from);
		if (!g2.ok) return g2;
		let s = await ensureEdit();
		if (s.alert || !s.edit) return fail("no edit mode on the source page");
		let it = pick(s, name, folder);
		if (!it) return fail("item not found (or ambiguous) on page " + from + ": " + name);
		const edgeDir = to > from ? "right" : "left";
		if (pathBlocked(s, it, edgeDir)) {
			const te = await moveToEnd(name, folder);
			if (!te.ok) return fail("moving out of the widget's way failed: " + te.stop);
			s = await ensureEdit();
			it = pick(s, name, folder);
			if (!it) return fail("lost the item after moving it to the end");
			if (pathBlocked(s, it, edgeDir)) return fail("a widget is still between the item (" + it.col + "," + it.row + ") and the " + edgeDir + " edge; free a lower row first");
		}
		await d.drag({ x: it.x, y: it.y, toX: GRID.xs[n % GRID.cols], toY: rowY(Math.floor(n / GRID.cols)), hold: 0.5, hover: 0.5, edge: to > from ? "right" : "left", flips: 1, flipWait: 0.85 });
		await d.wait(1.8);
		s = await read();
		if (s.alert) return fail("alert on screen");
		const added = s.icons.map(keyOf).filter((k) => !namesD.includes(k));
		const want = (folder ? "F:" : "") + clean(name);
		if (!(s.page === to && added.length === 1 && added[0] === want)) return fail("landed on page " + s.page + ", added " + JSON.stringify(added), { page: s.page, added });
		if (nextBefore !== null) {
			const g = await goPage(nxt);
			if (!g.ok) return g;
			const c = (await read()).icons.length;
			if (c !== nextBefore) return fail("cascade: page " + nxt + " went from " + nextBefore + " to " + c + " icons", { page: nxt });
			await goPage(to);
		}
		return { ok: true, page: to };
	}

	/** Fold a loose app into a folder that lives on another page: one hop per page, then merge. */
	async function foldInto(name: string, from: number, into: string, to: number): Promise<Res> {
		if (from === to) {
			const g = await goPage(to);
			if (!g.ok) return g;
			return mergeInto(name, into);
		}
		const g0 = await goPage(to);
		if (!g0.ok) return g0;
		await ensureEdit();
		const te = await moveToEnd(into, true);
		if (!te.ok) return fail("could not move the folder to the end of the destination page: " + te.stop);
		const folderBefore = await readFolder(into);
		if (!folderBefore.ok) return fail("could not read folder " + into + ": " + folderBefore.stop);
		const hops: Res[] = [];
		let cur = from;
		while (cur !== to) {
			const nxt = cur + (to > cur ? 1 : -1);
			const h = await hop(name, false, cur, nxt);
			hops.push(h);
			if (!h.ok) {
				if (nxt === to) {
					// observed: the icon can fall straight into the folder when the folder is the last icon of the page
					await goPage(to);
					const s = await read();
					if (!pick(s, name, false)) {
						const after = await readFolder(into);
						const want = [...(folderBefore.names as string[]), clean(name)].sort();
						if (after.ok && JSON.stringify(after.names) === JSON.stringify(want)) return { ok: true, via: "direct drop", after: after.names, hops };
						return fail("the icon left the page but the folder does not contain it; audit the pages", { after: after.names, want, hops });
					}
				}
				return fail("hop " + cur + "->" + nxt + " failed: " + h.stop, { hops });
			}
			cur = nxt;
		}
		await goPage(to);
		const m = await mergeInto(name, into);
		return { ...m, hops };
	}

	/** Move the last icon into the first gap, repeatedly, until the page has no holes (widget slots count as used). */
	async function compact(page: number): Promise<Res> {
		const g = await goPage(page);
		if (!g.ok) return g;
		const moves: string[] = [];
		for (let k = 0; k < 30; k++) {
			const s = await ensureEdit();
			if (s.page !== page || s.alert || !s.edit) return fail("state: page " + s.page + " edit " + s.edit + " alert " + s.alert, { moves });
			if (!s.icons.length) return { ok: true, moves, count: 0 };
			const used = usedSlots(s);
			const last = s.icons.slice().sort((a, b) => b.slot - a.slot)[0];
			let gap = -1;
			for (let q = 0; q < last.slot; q++) if (!used.has(q)) {
				gap = q;
				break;
			}
			if (gap < 0) return { ok: true, moves, count: s.icons.length };
			const before = posMap(s);
			const key = keyOf(last);
			const c = gap % GRID.cols;
			const r = Math.floor(gap / GRID.cols);
			await d.drag({ x: last.x, y: last.y, toX: GRID.xs[c], toY: rowY(r), hold: 0.5, hover: 0.5 });
			await d.wait(1.5);
			const s2 = await read();
			moves.push(key + " -> " + c + "," + r);
			const after = posMap(s2);
			const changed = Object.keys({ ...before, ...after }).filter((q) => before[q] !== after[q]);
			if (s2.page !== page || changed.length !== 1 || changed[0] !== key || after[key] !== c + "," + r) return fail("unexpected change " + JSON.stringify(changed) + " expected only " + key + " -> " + c + "," + r, { moves, before, after });
		}
		return fail("loop limit", { moves });
	}

	/** Read-only: every page, loose icons and the contents of every folder. */
	async function audit(): Promise<Res> {
		const g = await goPage(1);
		if (!g.ok) return g;
		const total = (g.total as number | null) ?? 1;
		const pages: Record<string, unknown> = {};
		const problems: string[] = [];
		for (let p = 1; p <= total; p++) {
			const gp = await goPage(p);
			if (!gp.ok) {
				problems.push("page " + p + ": " + gp.stop);
				continue;
			}
			const s = await read();
			const loose = s.icons.filter((i) => !i.folder).map((i) => i.name);
			const folders: Record<string, string[] | string> = {};
			for (const f of s.icons.filter((i) => i.folder)) {
				const r = await readFolderAt(f);
				let key = f.name;
				for (let n = 2; key in folders; n++) key = f.name + "#" + n;
				folders[key] = r.ok ? (r.names as string[]) : "UNSTABLE READ: " + r.stop;
				if (!r.ok) problems.push("page " + p + " folder " + f.name + ": " + r.stop);
			}
			pages["p" + p] = { loose, folders, widgets: s.widgetSlots.length > 0 };
		}
		return { ok: problems.length === 0, total, pages, problems };
	}

	function summarize(s: State): Res {
		const used = usedSlots(s);
		const end = endSlotOf(s);
		const gaps: number[] = [];
		for (let q = 0; q < end; q++) if (!used.has(q)) gaps.push(q);
		return {
			ok: true,
			page: s.page,
			total: realTotal(s),
			rawTotal: s.total,
			edit: s.edit,
			alert: s.alert,
			inFolder: s.inFolder,
			widgetSlots: s.widgetSlots,
			gaps,
			count: s.icons.length,
			icons: s.icons.map((i) => (i.folder ? "[F " + i.badge + "] " : "") + i.name + "@" + i.col + "," + i.row),
		};
	}

	async function run(op: string, a: Record<string, any>): Promise<Res> {
		try {
			return await runOp(op, a);
		} catch (e) {
			return fail(String((e as Error)?.message ?? e));
		}
	}

	async function runOp(op: string, a: Record<string, any>): Promise<Res> {
		const miss = (...ks: string[]): Res | null => {
			for (const k of ks) if (a[k] == null || a[k] === "") return fail("missing parameter '" + k + "' for home op '" + op + "'");
			return null;
		};
		const str = (k: string): string => String(a[k]);
		const num = (k: string): number => Number(a[k]);
		let b: Res | null;
		switch (op) {
			case "read": {
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return summarize(await read());
			}
			case "edit": {
				const s = await ensureEdit();
				return s.edit && !s.alert ? { ok: true, edit: true, page: s.page } : fail(s.alert ? "alert on screen" : "could not enter edit mode");
			}
			case "exit_edit":
				return exitEdit();
			case "goto":
				return (b = miss("page")) ? b : goPage(num("page"));
			case "folder": {
				if ((b = miss("name"))) return b;
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return readFolder(str("name"));
			}
			case "merge": {
				if ((b = miss("name", "into"))) return b;
				if (a.from_page != null && a.to_page != null) return foldInto(str("name"), num("from_page"), str("into"), num("to_page"));
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return mergeInto(str("name"), str("into"));
			}
			case "create": {
				if ((b = miss("name", "name2", "new_name"))) return b;
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return createFolder(str("name"), str("name2"), str("new_name"));
			}
			case "extract": {
				if ((b = miss("name", "app"))) return b;
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return extract(str("name"), str("app"));
			}
			case "rename": {
				if ((b = miss("name", "new_name"))) return b;
				if (a.page != null) {
					const g = await goPage(num("page"));
					if (!g.ok) return g;
				}
				return renameFolder(str("name"), str("new_name"));
			}
			case "hop": {
				if ((b = miss("name", "from_page", "to_page"))) return b;
				return hop(str("name"), a.folder === true, num("from_page"), num("to_page"));
			}
			case "compact":
				return (b = miss("page")) ? b : compact(num("page"));
			case "audit":
				return audit();
			default:
				return fail("unknown home op '" + op + "'; ops: read, edit, exit_edit, goto, folder, merge, create, extract, rename, hop, compact, audit");
		}
	}

	return { read, ensureEdit, exitEdit, goPage, readFolder, mergeInto, createFolder, renameFolder, extract, moveToEnd, hop, foldInto, compact, audit, summarize, run };
}
