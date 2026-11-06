# iphone — iOS UI automation for pi (Appium + XCUITest)

Esta versão é um módulo do Synapse. Não carregue simultaneamente outra extensão `iphone`. A configuração legada continua em `~/.pi/agent/iphone.json`. Os checks automatizados deste PR não operaram um dispositivo físico nem iniciaram o Appium.

```
pi ──HTTP/W3C──► Appium (SSD) ──► XCUITest driver ──► WebDriverAgent on iPhone / Simulator
```

- Tool `iphone`: `tree`, `screenshot`, `tap`, `double_tap`, `long_press`, `type`, `clear`, `swipe`, `drag`, `homescreen` (see below), `scroll`,
  `launch`, `terminate`, `activate`, `install`, `home`, `press`, `alert`, `url`, `info`, `wait`, `orientation`, `close`.
- Command `/iphone status|doctor|config|start|stop|reset|log`.
- Config: `~/.pi/agent/iphone.json`. Appium log: `~/.pi/agent/iphone/appium.log`.

## Installed locations (external SSD)
- Appium home + xcuitest driver: `/Volumes/SSD Externo/Development/tooling/appium`
- Xcode: `/Volumes/SSD Externo/Development/tooling/Xcode/Xcode.app` (symlinked in /Applications)

## Real iPhone (one-time)
1. Plug in via USB, unlock, tap **Trust**.
2. Settings → Privacy & Security → **Developer Mode** ON (reboots the phone).
3. Settings → Developer → **Enable UI Automation**.
4. Xcode → Settings → Accounts → add your Apple ID (creates a free *Personal Team*). Note the 10-char Team ID.
5. `/iphone config xcodeOrgId=<TEAMID> updatedWDABundleId=com.<you>.WebDriverAgentRunner`
6. iOS 18+: Appium may need a tunnel: `sudo appium driver run xcuitest tunnel-creation` (keep it running).
7. Ask pi to use the `iphone` tool; the first session builds + installs WebDriverAgent (several minutes).
   Free-account signing expires every 7 days.

## Simulator
`/iphone config target=simulator`, boot one (`xcrun simctl boot "iPhone 17"`), then use the tool.

## Home screen (action `homescreen`, homescreen.ts)
Verified Home Screen operations, built from what was measured on a real iPhone (iPhone18,2, iOS 26.6, 440x956 pt).
Every op returns `{ok, stop?, ...}` and stops at the first deviation; none of them retries with other parameters.
Typecheck passes (strict) and the logic was run against an offline simulator; **none of it has been run on the device yet**.

| `op` | what it does |
|---|---|
| `read` (`page?`) | page, total, edit mode, widget slots, gaps and the icons with `col,row` |
| `edit` / `exit_edit` | enter (long-press an empty area) / leave (tap OK) edit mode, verified |
| `goto` `page` | swipe to a page; never swipes past the last page (that opens the App Library) |
| `folder` `name` | contents of a folder across its inner pages; closes it afterwards |
| `merge` `name` `into` [`page` \| `from_page`+`to_page`] | fold a loose app into a folder; verified as folder = before + app. With both pages it hops one page at a time first |
| `create` `name` `name2` `new_name` | make a folder out of two loose apps, identified by before/after folder counts, then rename |
| `extract` `name` `app` | take an app out of a folder into a free slot of the last row; checks the folder count dropped by one |
| `rename` `name` `new_name` | rename via the clear-text button; refuses names the keyboard cannot type |
| `hop` `name` `from_page` `to_page` [`folder`] | carry an icon/folder across ONE page, checking the next page did not cascade |
| `compact` `page` | move the last icon into the first gap until no holes remain (widget slots count as used) |
| `audit` | read-only: every page, loose icons and the contents of every folder |

Measured facts (also in the homescreen.ts header):
- Grid: 4 columns x 6 rows, icon-graphic centers x = 69,170,271,371, y = 126 + row*108.6 (icon element top + 34). A page has 24 slots and may have
  EMPTY slots; widgets cover several slots; Dock icons (y > 800) are outside the grid. Other viewports are refused until `GRID` is recalibrated.
- Drag only works in edit mode (Button OK on top; inside a folder: DeleteButton). The drag is hold 0.5 s, 14 pt lift, **30 ms** jump, 0.5 s hover.
  A slow final move reorders instead of folding (user instruction).
- Lifting an icon that has others after it makes them slide back; only moving the LAST icon into an earlier gap shifts nobody. Each move is checked
  against a before/after position map.
- Page flips: holding at the edge flips continuously (~0.65 s per flip after the first). `edge` + `flips:1` + `flip_wait:0.85` + a destination slot on the
  target page crossed exactly one page every time; 1.5 s and 2.6 s crossed 1 and 4 pages. Never release at the edge, never land on a full page, and on a
  page with widgets start from a slot with no widget between the icon and the edge (a top-row drag over a widget did not flip, a row below it did).
- Extracting from a folder: drop in a free slot of the last row (outside the folder box) with hover >= 2 s; dropping near the Dock puts the app back.
- Folder titles: the keyboard drops a-tilde, u-acute, o-acute (c-cedilla works), so names are ASCII (Saude, Escritorio, Video).
- A folder with one app survives until its last app leaves; an empty page disappears; a vanished icon does not prove it entered the right folder.
- Edit mode adds an EMPTY page at the end of the Home Screen and of every folder: the indicator reads real pages + 1 (a one-page folder shows
  "Página 1 de 2", home shows 3 instead of 2) and a swipe inside a folder never reaches it. Folder contents are read by app count (the "N apps" badge),
  and `read` returns `total` (real pages) and `rawTotal` (as shown).
- Inside a folder, in edit mode, swipes do not paginate and the folder reopens on the last page seen. Taps on the folder's page control to leave edit mode
  worked twice and failed twice (a first tap at x+w-12 failed with edit started on the home screen), so there is no reliable gesture. Folders are therefore
  opened with the Home Screen OUT of edit mode (the OK button worked every time) and paginated there (right swipe x300,y380 and left swipe x220,y480 worked;
  right swipes at y=250 or y=700 did not). Edit mode inside a folder is entered only with a long-press at (300,900) after the page was found; closing a folder
  also ends edit mode. Reading a folder therefore leaves the Home Screen out of edit mode, and every other op re-enters it before dragging.
- The Home Screen layout reflows after many moves: always re-read (`read`) before planning the next gesture.
