# Synapse Unity Bridge — protocolo (PoC, v1)

Bridge in-process carregada por injeção em um jogo Unity/Mono **já em execução** (sem reiniciar).
Executa apenas eventos UGUI na thread principal do jogo e responde por TCP loopback.
Nenhuma API de entrada global do Windows é usada (`SetCursorPos`, `mouse_event`, `SendInput`,
`SetForegroundWindow`, `PostMessage` de input, UIA) em nenhum ponto deste protocolo.

- Implementação: `managed/*.cs` (assembly injetado), `native/bridge_injector.cpp` (loader Mono in-process),
  `launcher/` (injetor externo), `client/client.mjs` (cliente de referência).
- Alvo validado: Motorsport Manager, Unity **5.3.8f2**, x64, Mono CLR 3.0.40818, PID 28096.

---

## 1. Descoberta (discovery)

A bridge escreve arquivos em `run/` (raiz configurável por `SYNAPSE_BRIDGE_DIR`, padrão
`C:\Users\Administrator\research\unity-bridge`).

### `run/handshake.json`

Escrito: (a) logo após abrir o listener, com `"state":"starting"`; (b) no primeiro `Update`
da thread principal e a cada 300 ticks, com `"state":"listening"`; (c) no shutdown, com
`"state":"stopped"`.

```json
{
  "protocol": 1,
  "state": "listening",
  "pid": 28096,
  "process_name": "MM.exe",
  "process_start_utc": "2026-11-14T19:49:34.6598944Z",
  "instance": "522d360369624746a86a9f83e4959989",
  "token": "dd57f08d19c641daba1e7c2c5923e40f",
  "port": 47823,
  "endpoint": "tcp://127.0.0.1:47823",
  "started_utc": "2026-11-14T22:54:04.8696667Z",
  "main_thread_ticks": 2100,
  "main_thread_captured": true,
  "gameobject_created": true,
  "create_error": "",
  "unity_version": "5.3.8f2",
  "scene": "TrackFrontEnd",
  "unity_screen": { "width": 1794, "height": 971 },
  "event_system": true,
  "run_in_background": true,
  "run_in_background_before_known": true,
  "run_in_background_before": true,
  "geometry": {
    "window": { "x": 2580, "y": 370, "w": 1800, "h": 1000 },
    "client": { "x": 2583, "y": 396, "w": 1794, "h": 971 },
    "caption_offset": 26,
    "window_class": "UnityWndClass",
    "hwnd": 4459650
  },
  "capabilities": { "tree": true, "hit": true, "click": true, "key": false, "text": false },
  "bridge_log": "C:\\Users\\Administrator\\research\\unity-bridge\\logs\\bridge.log",
  "desktop": {
    "foreground": 197664,
    "game_window": 4459650,
    "game_is_foreground": false,
    "cursor": { "x": 1326, "y": 628 },
    "watch": { "foreground_events": 4, "game_foreground_events": 0, "recent": [] }
  }
}
```

Regras de validação para o consumidor (T3):

1. `protocol == 1`; `state == "listening"`; `gameobject_created == true`.
2. `pid` e `process_start_utc` devem bater com o processo alvo selecionado (identidade de
   processo, não só PID — protege contra PID reciclado).
3. `geometry.hwnd`/`geometry.window_class` devem bater com a janela do alvo.
4. `unity_version`, `unity_screen` e `geometry.client` definem a conversão de coordenadas.
5. `instance` + `token` são por instância; token novo a cada `Load`. Não reutilizar token de
   handshake anterior. Handshake com `"state":"stopped"` não deve ser usado.
6. Arquivo pode estar sendo reescrito (gravação atômica via `handshake.tmp` + move); se o parse
   falhar, reler uma vez após ~200–400 ms. O cliente de referência faz exatamente isso para
   operações somente-leitura.

### `run/load-attempt.json`

Diagnóstico da última tentativa de carga (`state`: `starting`, `injected`, `disabled`,
`listen-failed`, `gameobject-failed`, `load-failed`), com `pid`, `instance`, `port`,
`enabled`, `geometry` e `detail`/`exception` quando houver falha.

### `run/bridge.ini` (config lida no `Load`)

```ini
port=47823
enabled=1
request_timeout_ms=3000
#max_queue=64
#max_tree_items=400
```

`enabled=0` carrega o assembly, escreve diagnóstico e **não** abre listener nem cria GameObject.

---

## 2. Transporte e autenticação

- TCP em `127.0.0.1:<port>` (padrão `47823`). Nunca escuta em interface externa.
- UTF-8, uma requisição **JSON plano** por linha (`\n`). Uma resposta JSON por linha.
- JSON plano: apenas objeto raiz com valores `string`, `number`, `bool` ou `null`; sem objetos/arrays
  aninhados no request. Linha > 8192 bytes é recusada.
- Toda operação exige `"token"` igual ao do handshake, exceto `hello`.
- Token ausente/errado → `{"status":"error","reason":"bad-token"}` **sem tocar no jogo**.
- Fila limitada (`max_queue`, padrão 64). Fila cheia → `{"status":"error","reason":"queue-full"}`
  e nada é enfileirado.
- Até 16 operações consumidas por frame; a ordem é FIFO global.
- Timeout de espera na fila (`request_timeout_ms`, padrão 3000 ms). Estouro →
  `{"status":"outcome-unknown","reason":"main-thread-timeout","executed":false}`; a requisição é
  cancelada antes de executar se ainda não começou. **Nunca reenviar automaticamente.**

---

## 3. Envelope de resposta

Toda resposta de operação enfileirada é decorada com:

```json
{
  "seq": 12,
  "pid": 28096,
  "instance": "522d...",
  "op": "click",
  "main_thread_ticks": 3606,
  "desktop": { "foreground": 197664, "game_window": 4459650, "game_is_foreground": false,
               "cursor": { "x": 1219, "y": 720 },
               "watch": { "foreground_events": 3, "game_foreground_events": 0, "recent": [] } },
  "action_desktop": {
    "cursor_before": { "x": 1219, "y": 720 },
    "cursor_after":  { "x": 1219, "y": 720 },
    "cursor_moved": false,
    "foreground_before": 197664,
    "foreground_after": 197664,
    "foreground_changed": false,
    "game_foreground_before": false,
    "game_foreground_after": false
  },
  "cursor_watch": { "samples": 3627, "x": 1219, "y": 720,
                    "min_x": 1029, "max_x": 1496, "min_y": 684, "max_y": 1439,
                    "range_x": 467, "range_y": 755 },
  "...": "campos da operação"
}
```

- `main_thread_ticks`: contador de `Update` desde a carga do assembly. Prova que a thread principal
  está bombeando. Congelado após `stop` = unload lógico efetivo.
- `desktop.watch.foreground_events`: eventos `EVENT_SYSTEM_FOREGROUND` observados via
  `SetWinEventHook` (hook out-of-context, `WINEVENT_SKIPOWNPROCESS`) desde a carga.
- `desktop.watch.game_foreground_events`: quantas vezes a janela do jogo virou foreground.
  **Deve permanecer 0** durante automação background-only.
- `action_desktop`: leituras de `GetForegroundWindow`/`GetCursorPos` imediatamente antes e depois
  da operação, na thread principal. `cursor_moved=true` pode ser atividade do usuário; não é
  atribuível à bridge porque a bridge não chama API de entrada (auditável no código).
- `recent`: últimos eventos de foreground (`HH:mm:ss.fff:HWND`), limitado a 16.

---

## 4. Operações

### `hello` (sem token)

```json
{"op":"hello"}
```
→ `{"status":"ok","protocol":1,"pid":28096,"instance":"...","running":true}`

### `ping`

```json
{"op":"ping","token":"<token>"}
```
→ `status`, `protocol`, `pid`, `instance`, `seq`, `main_thread_ticks`, `main_thread_captured`,
`gameobject_created`, `create_error`, `state`, `unity_version`, `scene`, `event_system`,
`run_in_background`, `screen{width,height}`, `queue{pending,max}`, `geometry{...}`, `desktop`,
`cursor_watch`, `capabilities`, `log`, `uptime_ms`.

Respondido direto na thread de socket (somente dados em cache) para permitir diagnóstico mesmo se
a thread principal estiver parada (`main_thread_ticks` congelado).

### `state`

```json
{"op":"state","token":"<token>"}
```
Executa na thread principal. Retorna `screen`, `geometry`, `event_system`, `run_in_background`,
`time_scale`, `realtime_since_startup`, `unity_version`, `product`, `scene`, `selected` (path do
`currentSelectedGameObject`, quando houver) e `cursor_watch`.

### `tree`

```json
{"op":"tree","token":"<token>","max":400,"include_offscreen":false}
```
Lista `Selectable` ativos/interagíveis com rótulo e retângulo:

```json
{
  "status": "ok",
  "count": 57,
  "returned": 57,
  "screen": { "width": 1794, "height": 971 },
  "geometry": { "...": "..." },
  "event_system": true,
  "items": [
    { "path": "MailScreen/AnimationContainer/Group/2.Inbox/ToggleList/SubMenu/UIMailToggleEntry(Clone)/Toggle",
      "type": "Toggle", "label": "Fofocas", "interactable": true, "is_on": false,
      "screen_x": 72, "screen_y": 346, "screen_w": 134, "screen_h": 26,
      "client_x": 72, "client_y": 346, "client_w": 134, "client_h": 26, "depth": 0 }
  ]
}
```

- Até `max` itens (limitado por `max_tree_items`), ordenados y decrescente e x crescente (leitura
  de cima para baixo, esquerda para direita) — determinístico.
- `label` procura `Text`/`TextMeshProUGUI` no próprio nó, filhos (profundidade ≤ 3) e **irmãos**
  (prefabs UGUI como `UIMailToggleEntry` mantêm o rótulo fora do nó do `Selectable`).
- `is_on` reflete `Toggle.isOn`.
- Itens fora da tela são omitidos, salvo `include_offscreen=true`.

### `hit` (somente leitura)

```json
{"op":"hit","token":"<token>","x":117,"y":360}
```
→ `status`, `point{client_x,client_y,screen_x,screen_y}`, `hits`, `hit_list[]` com
`{path,type,has_click_handler,depth}` (máx. 8), `event_system`. Usa `EventSystem.RaycastAll`.

### `click`

Por coordenada de cliente (topo-esquerda, pixels):

```json
{"op":"click","token":"<token>","x":117,"y":360,"hover":true}
```

Por rótulo (atalho de PoC; resolve o centro do `Selectable` cujo label casa exata ou parcialmente,
case-insensitive):

```json
{"op":"click","token":"<token>","label":"Fofocas","hover":true}
```

Resposta de entrega:

```json
{
  "status": "dispatched",
  "route": "raycast",
  "effect": "unverifiable",
  "point": { "client_x": 139.49, "client_y": 359.83, "screen_x": 139.49, "screen_y": 611.17 },
  "raycast_hits": 6,
  "handler_depth": 30,
  "label_path": "MailScreen/.../UIMailToggleEntry(Clone)/Toggle",
  "target": {
    "path": "MailScreen/.../UIMailToggleEntry(Clone)/Toggle",
    "type": "GameObject", "label": "Fofocas",
    "is_toggle": true, "is_on_before": false, "is_on_after": true
  },
  "hint": "A entrega nao prova efeito visual. Leia o estado (tree/OCR) antes de repetir o clique."
}
```

- `route:"raycast"`: escolheu o primeiro resultado de `RaycastAll` cuja hierarquia tem
  `IPointerClickHandler`.
- `route:"geometry"`: fallback determinístico por retângulo do `Selectable` interagível mais
  específico (menor área) que contém o ponto; só é usado quando nenhum hit tem click handler.
- Sequência UGUI executada na thread principal: `pointerEnter` (se `hover`), `pointerDown`,
  `pointerUp`, `pointerClick` no handler, `pointerExit` (se `hover`). `PointerEventData` sintético
  (`button=Left`, `clickCount=1`, `eligibleForClick`, `pointerPress/rawPointerPress` via reflexão
  por compatibilidade com UGUI 5.3).
- `status:"dispatched"` significa **eventos executados**, não efeito comprovado. `effect` é sempre
  `"unverifiable"`. Para `Toggle`, `is_on_before/is_on_after` são evidência in-process, mas a
  confirmação de produto continua sendo `tree`/captura+OCR.
- Recusas: `{"status":"refused","reason":"no-raycast-hit"|"no-click-handler"|"label-not-found", ...}`
  sem nenhuma alteração de estado.

### `key` / `text`

Recusadas nesta versão:

```json
{"status":"refused","reason":"capability-not-implemented",
 "detail":"key/text exigem foco interno do EventSystem; nao implementado nesta bridge PoC."}
```

Não há suporte a foco Win32 nem a `UnityEngine.Input`; a recusa é explícita em vez de sucesso falso.

### `stop`

```json
{"op":"stop","token":"<token>"}
```
→ `{"status":"stopping","reason":"client-request"}` e, na sequência, a thread principal:

1. fecha o `TcpListener` (porta deixa de aceitar conexões);
2. remove o hook de foreground;
3. `Destroy` do único `GameObject` (`SynapseUnityBridge`);
4. restaura `Application.runInBackground` se a bridge o alterou;
5. escreve `run/stopped.json` e `handshake.json` com `"state":"stopped"`.

Depois disso o contador `main_thread_ticks` para de avançar. O assembly gerenciado permanece
carregado no processo (Mono não descarrega assemblies; ver §8).

---

## 5. Status e semântica de repetição

| status | significado | repetir? |
|---|---|---|
| `ok` | operação de leitura concluída | sim (leitura) |
| `dispatched` | eventos UGUI executados na thread principal; efeito não provado | **não** sem verificar estado; repetir pode alternar toggle |
| `refused` | nada foi executado (sem hit, sem handler, label inexistente, capacidade ausente) | sim, após corrigir a causa |
| `error` | requisição inválida/autenticação/fila cheia | sim, após corrigir |
| `stopping` | shutdown aceito e em andamento | não |
| `outcome-unknown` | timeout na fila; execução não confirmada | **não** (ação pode ter ocorrido) |

Regra: ACK não é confirmação visual. Timeout após envio nunca autoriza replay nem fallback
automático para outra rota de entrada.

---

## 6. Coordenadas e geometria

- **Coordenadas de cliente**: pixels medidos a partir do canto superior-esquerdo da *client area*
  da janela do jogo; escala = `geometry.client.w` × `geometry.client.h`.
- **Coordenadas Unity/Screen**: origem inferior-esquerda, `unity_screen.width` × `unity_screen.height`.
- Conversões usadas pelo servidor (com proporção, tolera DPI/escala):

```
screenX = clientX / clientW * Screen.width
screenY = Screen.height - clientY / clientH * Screen.height
```

- Retângulos em `tree` são devolvidos nas duas convenções (`screen_*` e `client_*`).
- **Pixel de captura → cliente** é responsabilidade do chamador (T3), porque depende do metadado da
  captura. Na captura CUA usada neste PoC: `TitleBar.frame.y=373`, `screenshot_frame.y=2` →
  origem física da imagem `y=371`; cliente em `y=396`; logo `clientY = pixelY - 25`.
  `geometry.caption_offset` (=26, topo da janela → topo do cliente) **não** é esse número; não
  subtrair 25/26 fixos em produção. Use a geometria real da captura + handshake.
- Validação empírica: pixel `(117,385)` → cliente `(117,360)` → hit em
  `.../UIMailToggleEntry(Clone)/Toggle` (Fofocas), OCR confirma `Sem mensagens`.

---

## 7. Segurança

- Escuta apenas loopback; token aleatório por instância; sem endpoint de `eval`/reflexão arbitrária.
- Nenhuma API de entrada do Windows é importada no assembly gerenciado. As únicas chamadas
  `user32` são leitura: `GetForegroundWindow`, `GetCursorPos`, `GetWindowRect`, `GetClientRect`,
  `ClientToScreen`, `GetClassName`, `EnumWindows`, `IsWindowVisible`, `SetWinEventHook`
  (observação) e `UnhookWinEvent`.
- Toda API Unity roda em `Update` (thread principal). A thread da injeção só cria o listener, o
  `GameObject` e o hook.
- `Application.runInBackground` só é alterado se estiver `false`, é registrado no handshake
  (`run_in_background_before`) e restaurado no `stop`. No MM ele já estava `true`.
- Um único `GameObject` `DontDestroyOnLoad` é criado; nenhuma cena/save/configuração persistente é
  alterada; nenhum plugin/módulo do jogo é tocado.
- `keys/text` recusados para não prometer cobertura de `UnityEngine.Input`.
- Limite de fila/tamanho/timeout evita travar a thread principal do jogo.

---

## 8. Ciclo de vida e compatibilidade

- Payload gerenciado compilado para .NET 3.5 contra `MM_Data/Managed/{mscorlib,System,System.Core,UnityEngine,UnityEngine.UI}.dll`.
- Injeção: `LoadLibraryA` de `bridge_injector.dll` + `CreateRemoteThread` no export `SynapseInvoke`,
  que usa a API de embedding do Mono dentro do processo (`mono_thread_attach`,
  `mono_image_open_from_data_with_name`, `mono_assembly_load_from_full`, `mono_class_from_name`,
  `mono_class_get_method_from_name`, `mono_runtime_invoke`).
- O loader lê o assembly de bytes com nome de imagem único (`<Classe>.inj<timestamp>.dll`).
- **Achado**: Mono deduplica assemblies pela identidade (nome simples + versão). Para carregar um
  build novo sem reiniciar, o nome do assembly precisa mudar. O `scripts/build.ps1` gera
  `UnityBridge_<yyyyMMddHHmmss>.dll` exatamente por isso.
- Unload é lógico: listener fechado, hook removido, GameObject destruído, `runInBackground`
  restaurado, contador congelado e `stopped.json` escrito. O assembly permanece na memória do
  processo até o jogo encerrar (comportamento do Mono); um novo build com nome novo pode ser
  injetado por cima.
- Reentrância: `Bootstrap.Load` é idempotente enquanto `Running`; após `stop`, um novo `Load` na
  mesma assembly reinicia listener/GameObject com token novo.

---

## 9. Limitações conhecidas

- `key`/`text` não implementados (recusa explícita).
- Sem drag/scroll/tooltip dedicados; `hover` só dispara enter/exit no handler clicado.
- Sem cancelamento de operação já em execução (só de itens ainda na fila).
- Efeito visual não é verificado pela bridge (`effect:unverifiable` por contrato).
- O handshake é atualizado no primeiro tick e a cada ~5 s; durante reinício pode haver uma janela
  de até 2–3 s com o arquivo anterior. Consumidores devem validar `state`/`started_utc` e reler.
- Se a janela estiver minimizada, a thread principal continua (com `runInBackground=true`), mas a
  captura de imagem depende do CUA.
- A bridge não instala nem se auto-injeta: a instalação é sempre explícita por um launcher confiável.
