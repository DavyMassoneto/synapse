# Unity Bridge nativo

Ponte in-process para a UI UGUI do Motorsport Manager (Unity 5.3.8, Mono 2.0, x64). Roda dentro do
processo do jogo e executa acoes na thread principal via `ExecuteEvents`, sem entrada global, sem
mover o cursor e sem trazer o jogo para o primeiro plano.

- Contrato: [docs/PROTOCOL.md](docs/PROTOCOL.md) (v2). Historico v1: [docs/PROTOCOL-v1.md](docs/PROTOCOL-v1.md).
- Plataforma: Windows x64. O payload compila contra `MM_Data/Managed` e so funciona no Mono do jogo.
- Consumidor: adaptador `unity-bridge` do modulo computer-use (T6). O adaptador valida handshake,
  descobre o alvo e traduz as operacoes; este diretorio entrega o processo e o protocolo.

## Garantias de seguranca

- Nenhuma API de entrada global: proibidos `SetCursorPos`, `mouse_event`, `SendInput`,
  `SetForegroundWindow`, `PostMessage` de entrada, UIA e `SendKeys`.
- A bridge apenas liga `Application.runInBackground` (e restaura o valor anterior no shutdown) para
  que o loop continue recebendo ticks com o jogo em segundo plano.
- Toda acao e um evento UGUI no objeto alvo, na thread principal. O cursor e o foco do desktop nao
  mudam; `action_desktop` no envelope comprova isso por operacao.
- ACK nao prova efeito visual. O consumidor confirma por `tree`/captura/OCR. Timeout depois do
  envio e `outcome-unknown`: nunca repetir a acao.

## Estrutura

| Caminho | Conteudo |
| --- | --- |
| `managed/` | Payload C# (`UnityBridge_*.dll`): listener TCP, fila na thread principal, comandos UGUI |
| `native/bridge_injector.cpp` | DLL x64 que chama `mono_thread_attach` e invoca `Bootstrap.Load` |
| `launcher/` | Utilitario .NET 8: `info`, `inject`, `stop`; carimba o nome do assembly a cada inject |
| `client/client.mjs` | CLI Node do protocolo (ping/state/tree/hit/click/scroll/drag/text/key/stop) |
| `scripts/build.ps1` | Build reproduzivel de todos os artefatos |
| `scripts/desktop-state.ps1` | Diagnostico somente leitura de foreground/cursor/geometria |
| `config/bridge.ini.example` | Configuracao canonica de runtime |
| `docs/` | Protocolo v2 e protocolo v1 |

## Build

Pre-requisitos: Windows x64, .NET SDK 8+, Visual Studio Build Tools com VC++ x64 e Motorsport
Manager instalado via Steam. O script descobre o SDK, o `vcvars64.bat` e `MM_Data/Managed`; qualquer
caminho pode ser passado explicitamente.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
# opcional: -ManagedDir <...\MM_Data\Managed> -CscPath <...\csc.dll> -VcVarsPath <...\vcvars64.bat>
```

Saidas:

- `bin/builds/<stamp>/`: artefatos imutaveis daquele build (`UnityBridge_<stamp>.dll`, `Probe_<stamp>.dll`, `bridge_injector.dll`).
- `bin/current/`: nomes estaveis `UnityBridge.dll`, `Probe.dll`, `bridge_injector.dll`, usados na configuracao.
- `launcher/bin/Release/net8.0/synapse-bridge-launcher.exe`.

`bin/`, `obj/`, `logs/`, `run/` e `launcher/bin|obj/` sao ignorados pelo git. A fonte e os scripts
sao versionados; binarios nao.

## Runtime

Crie `run/bridge.ini` a partir de `config/bridge.ini.example` (o diretorio `run/` e criado no
primeiro uso). O payload descobre a raiz deste diretorio pela localizacao do assembly carregado
(`managed/` como marcador); `SYNAPSE_BRIDGE_DIR` tem precedencia quando definido no processo do jogo.

```ini
enabled=1
port=47823
request_timeout_ms=3000
max_tree_items=400
max_texts=300
```

Handshake e logs ficam em `run/handshake.json` e `logs/bridge.log`. O token e gerado por instancia e
so aparece no handshake local. A configuracao do host (`~/.pi/agent/computer-use-unity-bridge.json`)
aponta `handshakeDirectory` para este diretorio e o comando de attach para o launcher/`bin/current`.

## Inject e stop

```powershell
$native = 'C:\caminho\para\...\unity-bridge\native'
$pid = (Get-Process MM).Id   # confira o nome real do processo
& "$native\launcher\bin\Release\net8.0\synapse-bridge-launcher.exe" inject `
  --pid $pid `
  --assembly "$native\bin\current\UnityBridge.dll" `
  --native "$native\bin\current\bridge_injector.dll" `
  --ns SynapseUnityBridge --type Bootstrap --method Load `
  --log "$native\logs\native.log"
```

O launcher carimba o nome do assembly (sufixo unico) antes de injetar. O Mono deduplica assemblies
por identidade; sem o carimbo, reinjetar depois de `stop` falha porque a identidade antiga continua
carregada. Use `--no-stamp` apenas para diagnostico. Para parar:

```powershell
node client/client.mjs --handshake run/handshake.json stop
```

`stop` para o listener, remove o GameObject, restaura `runInBackground` e grava `run/stopped.json`.
O processo do jogo continua rodando; a bridge pode ser reinjetada com um novo carimbo.

## Operacoes v2

`ping`, `state`, `tree`, `hit`, `click` (x/y, label ou id+generation), `scroll`, `drag`, `text` e
`key`; detalhes de payload, resposta e recusas em [docs/PROTOCOL.md](docs/PROTOCOL.md). Destaques:

- `tree` devolve `items` (Selectables, campos v1 + `id/kind/selected/cx/cy/depth`) e `texts`
  (Text/TMP visiveis, com `selectable_id` quando rotulo de um item), mais `generation` no envelope.
- `click --id <id> --generation <n>` usa o centro do rect e atualiza a selecao do `EventSystem`
  (necessario para `key`/`text`). Geracao velha e recusada sem executar nada.
- `scroll` varre todos os hits do raycast e usa handler, `ScrollRect`/`Scrollbar` ancestral ou
  geometria; se o handler nao mover, ajusta `normalizedPosition`/`value` proporcionalmente ao delta
  e reporta `route`, `manual_applied`, `fallback` e `normalized_changed`. `drag` opera no handler sob
  o ponto; ambos devolvem `scroll_rect.normalized_before/after` como evidencia in-process.
- `text` exige `InputField`/`TMP_InputField` ja focado ou `x/y` de um campo; recusa antes de
  executar se o ponto nao for um campo editavel.
- `key` aceita `Return`, `Escape`, `Tab` e setas; outras teclas sao `unsupported-key`. `Tab` e
  navegacao deterministica entre Selectables (nao simula a tecla do sistema).

## Testes e provas

Ha dois diagnosticos internos, fora do contrato do adaptador:

- `{"op":"selftest"}` cria um `InputField` UGUI fora da tela, exercita `text`/`key` e destroi o
  harness; serve para provar os handlers quando nao existe campo inofensivo no jogo.
- `{"op":"harness"}` cria uma lista UGUI visivel e temporaria (20 linhas, `ScrollRect`) com ponto
  central na resposta; `{"op":"harness-clear"}` remove. Sem limpeza explicita, some em 30 s. Use
  apenas com o jogo em segundo plano e capture OCR antes/depois para provar scroll/drag.

O CLI permite provar cada operacao sem ferramenta externa:

```powershell
node client/client.mjs ping
node client/client.mjs tree --max 300 --max-texts 300 > tree.json
node client/client.mjs click --id <id> --generation <n>
node client/client.mjs scroll 900 500 --dy -3
node client/client.mjs drag 900 700 900 300 --steps 8
node client/client.mjs raw '{"op":"selftest"}'
node client/client.mjs raw '{"op":"harness"}'
node client/client.mjs raw '{"op":"harness-clear"}'
```

Provas de aceitacao (OCR antes/depois, `action_desktop` sem mudanca de foreground/cursor, dez ciclos
de clique, recusas e unload) estao registradas em `docs/EVIDENCE.md`; os arquivos brutos ficam fora
do git, no diretorio de pesquisa. Limitacao conhecida: `text` em campo do jogo depende de existir um
campo inofensivo; quando nao existe, a prova e feita em harness/fake e registrada como tal.

## Notas de implementacao

- O payload usa `-nostdlib+ -langversion:4` e referencias do proprio jogo; nao redistribui Mono.
- `FlatJson` e um parser/emissor minimo, sem dependencia externa, porque o runtime e .NET 3.5.
- `Probe.cs` e um payload separado so para diagnostico de injecao (nao abre porta).
- `bridge-v2.ini` ativa o sufixo `-v2` em handshake/log/config, permitindo carregar um build novo
  ao lado do antigo durante validacao. Em producao use o perfil canonico sem sufixo.
