import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { createIphone } from "../../modules/iphone/public/index.ts";
const ACTIONS = ["tree", "screenshot", "tap", "double_tap", "long_press", "type", "clear", "swipe", "drag", "homescreen", "scroll", "launch", "terminate", "install", "activate", "home", "press", "alert", "url", "info", "wait", "orientation", "close"] as const;

const DESCRIPTION = `Automate a real iPhone (or iOS Simulator) through Appium/XCUITest: read the accessibility tree, tap, type, swipe, launch apps, handle alerts.

Workflow: action="tree" (returns numbered elements + screenshot) → act using \`element\` (index from the LAST tree) or \`text\` (match label/name/value) or \`x\`,\`y\` (points) → tree again to verify. Indices are invalidated by any UI change; re-run tree after state-changing actions (or pass tree_after=true).

Actions:
- tree: accessibility tree as a numbered list (+ screenshot if the model supports images). Optional \`max\` (default 200).
- screenshot: image only.
- tap / double_tap / long_press: target by element | text | x,y. long_press takes \`seconds\` (default 1).
- type: \`text_input\` typed into the focused field, or into element/text target (tapped first). \`submit\`=true presses return.
- clear: clear target text field.
- swipe: \`direction\` up|down|left|right on element/screen (finger direction; swiping up scrolls content down).
- drag: press-and-hold on the source (element | text | x,y) for \`seconds\` (default 1), then a short slow LIFT (\`lift_px\` default 14pt over \`lift_ms\` default 0.25s, toward the destination) so iOS picks the icon up, then a jump to the destination (\`to_element\` | \`to_text\` | \`to_x\`+\`to_y\`) in \`move\` seconds (default 0.03 = milliseconds), hover \`hover\` seconds (default 0.8) and release. Re-run tree before and after. Notes: (1) Only works in edit mode (icons jiggling, Button OK in the tree); enter it with long_press 1.8s on an empty area. A drag outside edit mode just swipes pages. (2) To drag an icon OUT of an open folder, enter edit mode inside the folder and drop on an EMPTY slot just outside the folder box (not near the Dock) with hover>=2; dropping near the Dock puts it back. (3) To drop an icon INTO a folder or onto another icon (creating a folder) the final move must be in milliseconds (user instruction: a slow final move makes iOS reorder/swap instead). (3b) Verified on device (2026-11-05, Redes folder): with the lift on, a drag with seconds=0.5, hover=0.5 and the default 30ms jump first SWAPS a distant icon into a chosen slot (LinkedIn -> Keynote slot), and once the source sits in the slot right next to the destination folder (same row) the same drag drops it INTO the folder. Aim at the icon graphic center (box top + ~34pt), not the box center that includes the label. (3c) The Home Screen is a grid of slots that ALLOWS EMPTY slots (gaps). Dropping on an occupied slot reorders/shifts other icons unpredictably. Lifting an icon that has other icons AFTER it in reading order makes those icons slide back into its slot, so a destination slot computed before the gesture can be wrong (observed: moving folder IA on page 3, and Calendario on page 1 which ended inside a new folder). Moving the LAST icon into an earlier gap shifts nobody; re-read the tree after every gesture. Columns x=69,170,271,371; rows y~126,234,343,452,560,669 (icon graphic center). To fold A into folder D: first drag A (or D) to an empty slot in the same row right next to the other, then drop A on D. (3d) PAGE FLIP TIMING (measured 2026-11-05): holding at the screen edge flips pages CONTINUOUSLY (~0.65s per flip after the first), regardless of 'flips'. Use edge + flips=1 + flip_wait=0.85 AND a destination (to_x,to_y) at an empty slot in the middle of the target page: exactly 1 page was crossed twice in a row (p5->p4, p4->p5). flip_wait 2.6 crossed 4 pages. Cross ONE page per gesture: flip_wait 1.5 crossed only 1 page, so the time for 2 flips is not reliable. On a page with WIDGETS, start the edge drag from a row with no widget in the path to the edge: dragging a top-row icon over the widget to the right edge did not flip the page (observed twice, FaceTime p1->p2), while the same drag from the bottom row crossed fine; move the icon to the end of the page first. Never land on a full page (24 icons) or release at the edge (an occupied slot cascades icons into the next pages); if the path passes a full page, free a slot there first. Choose the destination slot from the tree of the target page (first slot after the last occupied one), not from an icon count. (4) Confirm in the tree that the source is no longer loose AND open the destination folder to check its contents; a vanished icon does not prove it went into the right folder. (5) type limitation: accented letters like a-tilde, u-acute, o-acute are silently dropped; use ASCII text when typing names.
- drag across pages: add \`edge\` (left|right) and \`flips\` (N); the finger is held at the screen edge for N page flips, then moves to the destination (if any) or releases at the edge. After flips the destination must be x,y (the element list is from the old page); cross one page per gesture and always release at an empty destination slot; never release at the edge.
- scroll: \`direction\` + optional \`element\`/\`text\` target; scrolls content in that direction.
- homescreen: verified Home Screen operations (Home Screen visible; grid calibrated for 440x956pt). Every op stops at the first deviation and returns {ok, stop, ...}; nothing is retried with other parameters. \`op\`: read (page summary: slots, gaps, widgets; optional \`page\`), edit / exit_edit, goto (\`page\`), folder (\`name\` [, \`page\`]: contents across inner pages), merge (\`name\` app into folder \`into\` on the current/given \`page\`; with \`from_page\`+\`to_page\` it hops one page at a time first), create (\`name\`+\`name2\` loose apps -> new folder \`new_name\`), extract (folder \`name\`, \`app\`), rename (\`name\` -> \`new_name\`, ASCII only), hop (\`name\`, \`from_page\`, \`to_page\`, \`folder\`:true for a folder; crosses exactly one page), compact (\`page\`), audit (every page and every folder, read-only). Facts and limits: homescreen.ts header and README.
- launch / terminate / activate / install: \`bundle_id\` (e.g. com.apple.Preferences); install takes \`path\` to .app/.ipa.
- home: go to Home Screen. press: hardware button via \`button\` (home|volumeup|volumedown).
- alert: \`accept\` or \`dismiss\` via \`button_label\` optional; use \`alert_action\`.
- url: open a URL / deep link (\`url\`).
- info: device info + active app. wait: \`seconds\`. orientation: portrait|landscape. close: end the session.`;

const Params = Type.Object({
	action: Type.Unsafe<(typeof ACTIONS)[number]>({ type: "string", enum: [...ACTIONS], description: "What to do" }),
	element: Type.Optional(Type.Integer({ description: "Element index from the last tree" })),
	text: Type.Optional(Type.String({ description: "Match an element by label/name/value (exact first, then substring)" })),
	x: Type.Optional(Type.Number({ description: "X in points" })),
	y: Type.Optional(Type.Number({ description: "Y in points" })),
	text_input: Type.Optional(Type.String({ description: "Text to type" })),
	submit: Type.Optional(Type.Boolean({ description: "Press return after typing" })),
	direction: Type.Optional(Type.String({ description: "up|down|left|right" })),
	seconds: Type.Optional(Type.Number()),
	to_element: Type.Optional(Type.Integer({ description: "drag: destination element index from the last tree" })),
	to_text: Type.Optional(Type.String({ description: "drag: destination element matched by label/name/value" })),
	to_x: Type.Optional(Type.Number({ description: "drag: destination X in points" })),
	to_y: Type.Optional(Type.Number({ description: "drag: destination Y in points" })),
	edge: Type.Optional(Type.String({ description: "drag: left|right. Hold the dragged icon at that screen edge to flip home-screen pages (use with flips)" })),
	flips: Type.Optional(Type.Integer({ description: "drag: how many pages to flip at the edge before dropping/moving to the destination (default 0)" })),
	flip_wait: Type.Optional(Type.Number({ description: "drag: seconds to wait at the edge per flip (default 1.4)" })),
	move: Type.Optional(Type.Number({ description: "drag: seconds of the final jump to the destination (default 0.03)" })),
	op: Type.Optional(Type.String({ description: "homescreen: read|edit|exit_edit|goto|folder|merge|create|extract|rename|hop|compact|audit" })),
	name: Type.Optional(Type.String({ description: "homescreen: loose app (merge/create/hop) or folder (folder/extract/rename)" })),
	name2: Type.Optional(Type.String({ description: "homescreen create: second loose app" })),
	app: Type.Optional(Type.String({ description: "homescreen extract: app to take out of folder name" })),
	into: Type.Optional(Type.String({ description: "homescreen merge: destination folder" })),
	new_name: Type.Optional(Type.String({ description: "homescreen create/rename: folder name (ASCII or c-cedilla only)" })),
	page: Type.Optional(Type.Integer({ description: "homescreen: Home Screen page (1-based) to go to first / to compact" })),
	from_page: Type.Optional(Type.Integer({ description: "homescreen merge/hop: page where the app is now" })),
	to_page: Type.Optional(Type.Integer({ description: "homescreen merge/hop: page of the destination" })),
	folder: Type.Optional(Type.Boolean({ description: "homescreen hop: the item is a folder" })),
	lift_px: Type.Optional(Type.Number({ description: "drag: points of the slow lift right after the hold, toward the destination (default 14; 0 disables)" })),
	lift_ms: Type.Optional(Type.Number({ description: "drag: seconds the lift takes (default 0.25)" })),
	hover: Type.Optional(Type.Number({ description: "drag: seconds to hover over the destination before release (default 0.8)" })),
	bundle_id: Type.Optional(Type.String()),
	path: Type.Optional(Type.String({ description: "Path to .app/.ipa for install" })),
	url: Type.Optional(Type.String()),
	button: Type.Optional(Type.String({ description: "home|volumeup|volumedown" })),
	alert_action: Type.Optional(Type.String({ description: "accept|dismiss" })),
	button_label: Type.Optional(Type.String({ description: "Alert button label" })),
	orientation: Type.Optional(Type.String({ description: "portrait|landscape" })),
	max: Type.Optional(Type.Integer({ description: "Max elements in tree (default 200)" })),
	tree_after: Type.Optional(Type.Boolean({ description: "Return a fresh tree after the action" })),
});

export function registerIphone(pi: ExtensionAPI, phone: ReturnType<typeof createIphone>) {
pi.registerTool({name: "iphone", label: "iPhone", description: DESCRIPTION, parameters: Params, executionMode: "sequential", async execute(_id, params, signal, _update, ctx) { try { signal?.throwIfAborted(); return await phone.execute(params, Array.isArray(ctx.model?.input) ? ctx.model.input.includes("image") : true, signal); } catch (e) { return { content: [{ type: "text" as const, text: "iPhone operation failed; effects may be unknown: " + String((e as Error).message) }], details: {}, isError: true }; } }});
pi.registerCommand("iphone", {description: "iPhone: status | doctor | config | start | stop | reset | log", handler: async (args, ctx) => { try { const r = await phone.command(args); ctx.ui.notify(r.text, r.level); } catch (e) { ctx.ui.notify(String((e as Error).message), "error"); } }});
pi.on("session_shutdown", () => phone.shutdown());
}