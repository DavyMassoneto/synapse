# Synapse Unity Bridge — PROTOCOL v2 (contrato canônico)

Status: **implementado e carregado no Motorsport Manager.** A v1 foi substituída e permanece
documentada em `PROTOCOL-v1.md` apenas para histórico. Consumidores devem exigir `protocol == 2`
para usar as capacidades novas.

Mudanças vs v1 são **aditivas** onde possível. Campos v1 permanecem; `items` mantém o shape atual.
Consumidores v1 continuam funcionando (sem as capacidades novas). `protocol` passa a ser **2**.

---

## 0. Diferenças vs v1 (resumo)

| Item | v1 | v2 |
|---|---|---|
| `protocol` | 1 | **2** |
| `tree.items[]` | path/type/label/rect/is_on | **+ `id`, `kind`, `selected`, `cx`, `cy`** (campos v1 intactos) |
| `tree.texts[]` | ausente | **novo**: textos visíveis (Text/TMP) com rect/id |
| `tree.generation` | ausente | **novo**: inteiro por geração de UI |
| `click` | x/y ou label | **+ `id` + `generation`** |
| `scroll` | recusado | **novo** |
| `drag` | recusado | **novo** |
| `text` | recusado | **novo** (InputField focado internamente) |
| `key` | recusado | **novo** (Return/Escape/Tab/setas) |
| `capabilities` | key/text false | todos true + `ids`,`texts`,`generation` |

Regras gerais inalteradas: loopback + token por instância; JSON plano por linha; toda API Unity na
thread principal; sem entrada global/foreground; ACK ≠ efeito visual; timeout após envio nunca
autoriza replay.

---

## 1. Descoberta e versão

`run/handshake.json` e `ping`/`hello` passam a informar:

```json
{
  "protocol": 2,
  "capabilities": {
    "tree": true, "hit": true, "click": true,
    "scroll": true, "drag": true, "text": true, "key": true,
    "ids": true, "texts": true, "generation": true
  }
}
```

- Consumidor deve exigir `protocol >= 2` para usar scroll/drag/text/key/ids/texts/generation.
- `protocol == 1` = bridge antiga (não suporta as ops novas; responderá `refused`).
- Validação de identidade (pid/start time/hwnd/classe/geometria/instance/token) é a mesma da v1.
- `generation` é um inteiro monotônico por instância: incrementa a cada ação que muta a UI
  (`click`, `scroll`, `drag`, `text`, `key`) e em troca de cena. `tree`/`state`/`ping` devolvem o
  valor atual.

---

## 2. `tree`

```json
{"op":"tree","token":"...","max":400,"include_offscreen":false,
 "include_texts":true,"max_texts":300}
```

Defaults: `max=400` (limitado por `max_tree_items`), `include_offscreen=false`,
`include_texts=true`, `max_texts=300` (teto rígido 500). Até 8192 bytes por request.

Resposta (campos v1 preservados + novos):

```json
{
  "status": "ok",
  "protocol": 2,
  "generation": 17,
  "count": 57,
  "returned": 57,
  "screen": { "width": 1794, "height": 971 },
  "geometry": { "window": {...}, "client": {...}, "caption_offset": 26, "hwnd": 4459650 },
  "event_system": true,
  "selected_id": "3f2a1b7c-0a1d",
  "items": [
    {
      "id": "3f2a1b7c-0a1d",
      "kind": "selectable",
      "path": "MailScreen/.../UIMailToggleEntry(Clone)/Toggle",
      "type": "Toggle",
      "label": "Fofocas",
      "interactable": true,
      "is_on": false,
      "selected": false,
      "screen_x": 72, "screen_y": 346, "screen_w": 134, "screen_h": 26,
      "client_x": 72, "client_y": 346, "client_w": 134, "client_h": 26,
      "cx": 139.0, "cy": 359.0,
      "depth": 7
    }
  ],
  "texts": [
    {
      "id": "9c01fe22-77b0",
      "kind": "text",
      "path": "MailScreen/.../UIMailToggleEntry(Clone)/Label",
      "text": "Fofocas",
      "selectable_id": "3f2a1b7c-0a1d",
      "screen_x": 76, "screen_y": 349, "screen_w": 80, "screen_h": 20,
      "client_x": 76, "client_y": 349, "client_w": 80, "client_h": 20,
      "depth": 8
    }
  ]
}
```

Regras:

- `items` = `Selectable` ativos e visíveis (mesmo filtro v1), ordenados topo→base e esquerda→direita
  (mesma ordenação v1: `screen_y` máximo decrescente, depois `client_x` crescente). `max` limita.
- `texts` = componentes `Text` e `TextMeshProUGUI` ativos, com texto não vazio, alpha > 0 e rect
  visível; deduplicados por `path`; mesma ordenação; limitado por `max_texts`. Se um texto for o
  rótulo de um item, `selectable_id` aponta para o item (permite T6 fundir sem duplicar; o item
  continua dono do clique).
- `id` = opaco, string hex `"hhhhhhhh-hhhh"` (`hash FNV-1a do path` + sufixo do `GetInstanceID`).
  **Estável por geração**: chamadas repetidas de `tree` sem ação no meio devolvem os mesmos ids.
  Pode mudar após ação/cena/reconstrução da UI. Não é ponteiro e não deve ser persistido.
- `kind`: `"selectable"` em `items`; `"text"` em `texts`.
- `depth` = profundidade na hierarquia (raiz = 0). v1 devolvia 0; v2 devolve o valor real.
- `selected_id`: id do `EventSystem.current.currentSelectedGameObject` quando ele aparece em
  `items`/`texts`; `null` caso contrário.
- `cx`/`cy` = centro do rect em coords de cliente (atalho para clique; use o ponto que preferir).
- `interactable` continua vindo de `Selectable.IsInteractable()`; itens não interagíveis aparecem
  (como na v1), mas `click`/`scroll` por id os recusam com `not-interactable` quando aplicável.

---

## 3. Coordenadas

Todas as entradas de `click`, `scroll`, `drag`, `text` usam **client area top-left**, pixels,
inteiros ou decimais. Saídas de rect trazem `screen_*` (Unity, bottom-left) e `client_*`
(top-left). `cx`/`cy` em client. Conversão pixel-da-captura → cliente continua sendo do consumidor
(metadado da captura; nunca offsets fixos).

---

## 4. Identidade de elemento e geração (para click/scroll)

Resolução por id é **opt-in** e exige geração:

```json
{"op":"click","token":"...","id":"3f2a1b7c-0a1d","generation":17}
```

- `id` presente sem `generation` → `refused / missing-generation`.
- `generation` diferente da atual → `refused / stale-id` com `current_generation` e
  `request_generation` na resposta (nada é executado).
- id inexistente/obsoleto → `refused / unknown-id`.
- elemento não interagível → `refused / not-interactable` (quando o alvo é um `Selectable`).
- Coordenadas x/y e `label` continuam aceitas (comportamento v1). Se mais de uma forma for enviada:
  `id` > `label` > `x/y`; formas conflitantes → `refused / invalid-args`.

---

## 5. `scroll`

```json
{"op":"scroll","token":"...","x":900,"y":500,"dx":0,"dy":-3}
```

- `dx`/`dy` em unidades de `PointerEventData.scrollDelta` (1.0 = um “notch”); `dy > 0` = rolar para
  cima, `dy < 0` = para baixo; `dx > 0` = para a direita do conteúdo. `|dx|,|dy| <= 10`.
- Alternativa: `{"direction":"up|down|left|right","amount":1}` (default `amount=1`, faixa 0.1–10).
  Mandar `dx/dy` **e** `direction` → `invalid-args`.
- Alvo: ponto `x/y`; ou `label` (centro do item); ou `id`+`generation` (centro do item).
- Encaminhamento: `RaycastAll` no ponto; para **todos** os hits, sobe a hierarquia procurando
  `IScrollHandler` (`ExecuteEvents.GetEventHandler`). O primeiro handler encontrado e o `ScrollRect`
  mais próximo são usados; se não houver handler, procura `ScrollRect` ancestral de qualquer hit e,
  por fim, o `ScrollRect` mais específico cujo rect contém o ponto. Se ainda não houver, procura
  `Scrollbar` no ponto/ancestral. Sem nenhum → `refused / no-scroll-handler`.
- Executa `ExecuteEvents.scrollHandler` na thread principal (sem pointerDown/click). Se o handler
  não alterar `ScrollRect.normalizedPosition`, aplica fallback manual proporcional ao delta
  (`0.08 * delta` por eixo, clamp 0..1) no `ScrollRect`; sem `ScrollRect`, ajusta `Scrollbar.value`
  (vertical: `value -= dy * 0.08`; horizontal: `value += dx * 0.08`). O fallback e reportado.

Resposta:

```json
{
  "status": "dispatched",
  "route": "raycast",
  "fallback": "manual-normalized",
  "manual_applied": true,
  "normalized_changed": true,
  "effect": "unverifiable",
  "point": { "client_x": 900.0, "client_y": 500.0, "screen_x": 900.0, "screen_y": 471.0 },
  "scroll_delta": { "x": 0.0, "y": -3.0 },
  "target": { "id": "aa11bb22-0c0d", "path": ".../Scroll View", "type": "ScrollRect" },
  "resolved_by": "label",
  "handler_path": ".../Scroll View",
  "scroll_rect": {
    "path": ".../Scroll View",
    "normalized_before": { "x": 0.5, "y": 1.0 },
    "normalized_after":  { "x": 0.5, "y": 0.76 }
  },
  "generation": 18,
  "hint": "scroll nao prova efeito visual; verifique tree/OCR."
}
```

`route`: `raycast` (handler), `geometry` (sem handler; `ScrollRect` por geometria) ou `scrollbar`
(sem `ScrollRect`; barra ajustada). `fallback`: `manual-normalized` ou `scrollbar` quando a bridge
ajustou o componente diretamente; ausente quando o handler produziu efeito. `normalized_changed`
compara `before/after` do `ScrollRect` (ou `Scrollbar.value`). `scroll_rect` aparece quando há
`ScrollRect`; `scrollbar` quando uma barra foi usada (`path/value_before/value_after/size`).

`resolved_by` aparece como `id` ou `label` quando o alvo foi resolvido pelo tree.

Recusas: `invalid-args`, `label-not-found`, `missing-generation`, `stale-id`, `unknown-id`,
`not-interactable`, `no-raycast-hit`, `no-scroll-handler`.

Recusas: `invalid-args`, `label-not-found`, `missing-generation`, `stale-id`, `unknown-id`,
`not-interactable`, `no-raycast-hit`, `no-scroll-handler`.

---

## 6. `drag`

```json
{"op":"drag","token":"...","from_x":100,"from_y":300,"to_x":100,"to_y":180,"steps":8}
```

- `steps` 1..32 (default 8). Interpolação linear `from`→`to` em `steps` eventos `drag`, todos
  executados na mesma passada da thread principal (não bloqueia frames do jogo).
- Alvo = handler de `IDragHandler` sob `from` (raycast; fallback geométrico pelo `Selectable` do
  ponto). Sem handler → `refused / no-drag-handler`.
- Sequência UGUI: `pointerDown` (press target) → `initializePotentialDrag` (press target) →
  `beginDrag` (drag handler, `dragging=true`) → N × `drag` (posição interpolada, `delta`) →
  `pointerUp` (press target) → `drop` (press target) → `endDrag` (drag handler).
- Botão sempre esquerdo; sem modificadores. `hover=false` por padrão (não dispara enter/exit).

Resposta:

```json
{
  "status": "dispatched",
  "route": "raycast",
  "effect": "unverifiable",
  "from": { "client_x": 100.0, "client_y": 300.0, "screen_x": 100.0, "screen_y": 671.0 },
  "to":   { "client_x": 100.0, "client_y": 180.0, "screen_x": 100.0, "screen_y": 791.0 },
  "steps": 8,
  "target": { "id": "bb22cc33-0e0f", "path": ".../Scroll View", "type": "ScrollRect" },
  "press_path": ".../Scroll View",
  "scroll_rect": { "path": ".../Scroll View",
                   "normalized_before": {"x":0.5,"y":1.0},
                   "normalized_after": {"x":0.5,"y":0.55} },
  "generation": 19,
  "hint": "drag nao prova efeito visual."
}
```

Recusas: `invalid-args`, `no-raycast-hit`, `no-drag-handler`.

Prova prevista: arrastar o thumb/lista de uma tela longa (Calendário/Pilotos) e conferir
`scroll_rect.normalized_*` + OCR antes/depois; depois voltar ao estado inicial.

---

## 7. `text` (InputField focado internamente)

```json
{"op":"text","token":"...","text":"Novo texto","submit":false,"replace":true,
 "x":400,"y":250}
```

- `x/y` opcional: se presente, executa um clique interno no ponto **antes** de digitar
  (foco/ativação do campo). Sem `x/y`, exige um campo já focado internamente.
- Campo aceito: `UnityEngine.UI.InputField` ou `TMPro.TMP_InputField` no objeto selecionado
  (`EventSystem.current.currentSelectedGameObject`) ou em até 3 ancestrais. TMP é tratado por
  reflexão (sem dependência de assembly no payload).
- `replace=true` (default) substitui o conteúdo; `false` anexa ao final. `text=""` limpa.
  Respeita `characterLimit`; se truncar, `truncated=true`. Tamanho máximo aceito: 2000 caracteres
  (após JSON decode); acima → `invalid-args`.
- Ativa o campo (`ActivateInputField`), move o caret para o fim (`MoveTextEnd(true)`) e dispara
  `onValueChanged` ao definir o valor.
- `submit=true` dispara `submitHandler` (equivalente a Enter) **depois** de definir o texto.
- Efeito visual não é provado pela bridge; `value_after` é evidência in-process (truncado a 160
  caracteres na resposta).

Resposta:

```json
{
  "status": "dispatched",
  "effect": "unverifiable",
  "input": { "id": "cc33dd44-1011", "path": ".../InputField", "type": "InputField" },
  "text_length": 10,
  "value_before": "",
  "value_after": "Novo texto",
  "truncated": false,
  "submitted": false
}
```

Recusas: `no-focused-input`, `no-input-at-point`, `input-not-editable`, `invalid-args`.
`generation` vem no envelope da resposta (valor após a operação), como nas demais operações.

> Campo inócuo: se não houver campo seguro no MM, a prova será feita em harness Unity fake e
> documentada como tal; **nunca** digitar em campo que altere save/contrato/compra.

---

## 8. `key`

```json
{"op":"key","token":"...","key":"Return"}
```

Teclas canônicas aceitas: **`Return`, `Escape`, `Tab`, `Up`, `Down`, `Left`, `Right`**.
Aliases aceitos: `Enter`→`Return`, `Esc`→`Escape`, `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`.
Qualquer outra (incluindo letras, F1..F12, combos, arrays, modificadores) →
`refused / unsupported-key`. Sem `keys[]`, sem `modifiers[]` na v2.

Exige seleção interna (`EventSystem.current.currentSelectedGameObject`); sem seleção →
`refused / no-selection`.

| tecla | handler | rota |
|---|---|---|
| `Return` | `ExecuteEvents.submitHandler` no selecionado | `submit` |
| `Escape` | `ExecuteEvents.cancelHandler` no selecionado | `cancel` |
| `Up/Down/Left/Right` | `AxisEventData` (`moveDirection`/`moveVector`) + `ExecuteEvents.moveHandler` | `move` |
| `Tab` | navegação determinística para o próximo `Selectable` interagível na ordem do `tree` (wrap) | `navigation` |

`Tab` não é evento de teclado do jogo: é navegação de foco interna, documentada como tal.

Resposta:

```json
{
  "status": "dispatched",
  "key": "Return",
  "route": "submit",
  "effect": "unverifiable",
  "selected_before": { "id": "cc33dd44-1011", "path": ".../InputField", "type": "InputField" },
  "selected_after":  { "id": "cc33dd44-1011", "path": ".../InputField", "type": "InputField" },
  "moved": false,
  "generation": 21
}
```

Recusas: `no-selection`, `unsupported-key`, `invalid-args`.

---

## 9. `click` (v2)

Formas aceitas, em ordem de precedência: `id`+`generation` > `label` > `x/y`.

```json
{"op":"click","token":"...","id":"3f2a1b7c-0a1d","generation":17,"hover":true}
{"op":"click","token":"...","label":"Fofocas","hover":true}
{"op":"click","token":"...","x":139,"y":213}
```

- Ao clicar, a bridge seleciona internamente o `Selectable` alvo no `EventSystem`
  (`SetSelectedGameObject`), como o `StandaloneInputModule` faria — necessário para `text`/`key`.
- Resposta v1 preservada; adiciona `generation` e, em `target`, `id`.
- `disabled`/não interagível por id → `not-interactable`. `stale-id`, `missing-generation`,
  `unknown-id` como em §4.

---

## 10. Envelope e status

Toda resposta enfileirada continua com `seq`, `pid`, `instance`, `op`, `main_thread_ticks`,
`desktop`, `action_desktop`, `cursor_watch`; v2 adiciona `generation` (valor após a operação).

Status: `ok`, `dispatched`, `refused`, `error`, `stopping`, `outcome-unknown` (inalterado).
Novos `reason`: `missing-generation`, `stale-id`, `unknown-id`, `not-interactable`,
`invalid-args`, `label-not-found`, `no-raycast-hit`, `no-scroll-handler`, `no-drag-handler`,
`no-focused-input`, `no-input-at-point`, `input-not-editable`, `no-selection`, `unsupported-key`.

`dispatched` = eventos executados; efeito não provado. Timeout após envio → `outcome-unknown`,
**sem replay**. `refused` = nada executado.

---

## 11. Limites v2

- `text`: ≤ 2000 caracteres (request inteiro ≤ 8192 bytes); resposta trunca `value_*` em 160.
- `scroll`: `|dx|,|dy| ≤ 10`; `amount` 0.1–10.
- `drag`: `steps` 1–32.
- `tree`: `max` ≤ `max_tree_items` (default 400); `max_texts` ≤ 500.
- Fila/ordem/timeout iguais à v1 (64 itens, 16 ops/frame, 3000 ms de espera).

---

## 12. Compatibilidade e migração T6

- Ler `protocol` do handshake/ping: `2` habilita scroll/drag/text/key/ids/texts/generation.
- `tree.items` continua com os campos v1; use `id`/`generation` para clique estável e para
  desambiguar clones. Após qualquer ação, refaça `tree` (geração muda).
- `texts` é um array separado: funda na captura apenas textos com `selectable_id == null` (ou use
  o texto como descrição do item quando `selectable_id` existir) para não duplicar.
- Roteie `type`/`key`/`scroll`/`drag` para as ops correspondentes; sem suporte (protocol 1) ou
  recusa da bridge → limitação explícita, nunca foreground/fallback CUA após envio.
- `click` por elemento Unity: use `id`+`generation`; pixel continua válido.
