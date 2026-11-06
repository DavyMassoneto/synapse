/** Parse WebDriverAgent's XML page source into a flat, indexable element list (no XML dependency). */

export interface El {
	i: number;
	type: string;
	name: string;
	label: string;
	value: string;
	x: number;
	y: number;
	w: number;
	h: number;
	enabled: boolean;
	interactive: boolean;
}

const INTERACTIVE = new Set(["Button", "TextField", "SecureTextField", "TextView", "SearchField", "Switch", "Slider", "Link", "Cell", "Tab", "Toggle", "Picker", "PickerWheel", "SegmentedControl", "Stepper", "Key", "Keyboard", "MenuItem", "Alert", "Sheet", "Icon", "PageIndicator", "Checkbox", "RadioButton"]);
const SKIP_IF_UNLABELED = new Set(["Other", "Window", "ScrollView", "Table", "CollectionView", "Application", "StatusBar", "Group", "Image", "NavigationBar"]);

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#10;/g, " ").replace(/&amp;/g, "&");

function attrs(s: string): Record<string, string> {
	const o: Record<string, string> = {};
	for (const m of s.matchAll(/([\w:-]+)="([^"]*)"/g)) o[m[1]] = decode(m[2]);
	return o;
}

export function parseSource(xml: string, max = 200): { app: string; elements: El[]; truncated: boolean } {
	const elements: El[] = [];
	let app = "";
	let truncated = false;
	for (const m of xml.matchAll(/<(XCUIElementType(\w+))\s([^>]*?)\/?>/g)) {
		const type = m[2];
		const a = attrs(m[3]);
		if (type === "Application") app = a.name || a.label || app;
		if (a.visible === "false") continue;
		const name = a.name ?? "";
		const label = a.label ?? "";
		const value = a.value ?? "";
		const labeled = !!(name || label || value);
		const interactive = INTERACTIVE.has(type);
		if (!interactive && (!labeled || SKIP_IF_UNLABELED.has(type) && !labeled)) continue;
		const w = Number(a.width ?? 0);
		const h = Number(a.height ?? 0);
		if (w <= 0 || h <= 0) continue;
		if (elements.length >= max) {
			truncated = true;
			break;
		}
		elements.push({ i: elements.length + 1, type, name, label, value, x: Number(a.x ?? 0), y: Number(a.y ?? 0), w, h, enabled: a.enabled !== "false", interactive });
	}
	return { app, elements, truncated };
}

export const center = (e: El) => ({ x: Math.round(e.x + e.w / 2), y: Math.round(e.y + e.h / 2) });

export function formatElements(app: string, els: El[], truncated: boolean): string {
	const lines = els.map((e) => {
		const text = [e.label || e.name, e.value && e.value !== e.label ? `value=${JSON.stringify(e.value)}` : ""].filter(Boolean).join(" ");
		const id = e.name && e.name !== e.label ? ` id=${JSON.stringify(e.name)}` : "";
		return `[${e.i}] ${e.type}${text ? " " + (e.label || e.name ? JSON.stringify(e.label || e.name) + (e.value && e.value !== e.label ? ` value=${JSON.stringify(e.value)}` : "") : text) : ""}${id} @(${e.x},${e.y} ${e.w}x${e.h})${e.enabled ? "" : " [disabled]"}`;
	});
	return `app: ${app || "(springboard/unknown)"}\n${els.length} elements${truncated ? " (truncated)" : ""}:\n${lines.join("\n")}`;
}

export function findByText(els: El[], text: string): El | undefined {
	const t = text.toLowerCase();
	const hay = (e: El) => [e.label, e.name, e.value].map((s) => s.toLowerCase());
	return els.find((e) => hay(e).some((s) => s === t)) ?? els.find((e) => hay(e).some((s) => s.includes(t)));
}
