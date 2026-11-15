# Evidencias — Unity Bridge

Ambiente das provas: Motorsport Manager x64 (Unity 5.3.8f2, Mono 2.0), janela cliente 1794x971,
bridge v2 carregada no processo do jogo. Arquivos brutos (PNGs, OCR, respostas JSON) ficam no
diretorio de pesquisa, fora deste repositorio; esta pagina registra os resultados verificaveis.

Estas provas sao da bridge nativa e do adaptador no jogo. Elas nao substituem a verificacao do
fluxo Pi depois do rebase da integracao TypeScript, que tem registro proprio e nao altera o
payload nativo.

## v1 — clique em segundo plano

- Clique por `ExecuteEvents` abriu Fofocas/Caixa de entrada sem trazer o jogo para o primeiro plano.
- Dez ciclos de clique/estado consecutivos sem mudanca de foreground ou cursor.
- Recusas e unload (`stop`) verificados; `Application.runInBackground` restaurado.
- Protocolo e resultados completos: `PROTOCOL-v1.md` e o historico de pesquisa.

## v2 — operacoes novas

Build final `20261114-223224` (payload `UnityBridge_20261114223224.dll`), protocolo 2, perfil
canonico em `run/handshake.json`, porta 47823, todas as capabilities habilitadas. As provas de
desenvolvimento usaram o perfil side-by-side (`run/handshake-v2.json`, porta 47824); o corte final
parou a v1 de pesquisa (47823) e o perfil side-by-side, e reinjetou o build final no perfil
canonico. O host `~/.pi/agent/computer-use-unity-bridge.json` aponta para este diretorio e para
`bin/current`. Instance final: `384a8f67eaf54e35a31000258d1917e5`.

### Clique por id + generation

- `click --id 41aaa047-f08c` (Mensagens): `false -> true`, generation 1 -> 2; tree seguinte com
  56 itens e textos "Caixa de entrada"/"Fofocas".
- `click --id d5bea708-f324` (Calendario): generation 2 -> 3; tree com 37 itens e 72 textos.
- `click --id 179c8245-d1b6` (Detailed Standings): generation 4 -> 5.
- Todas as respostas com `action_desktop.game_foreground_before/after = false` e
  `cursor_moved = false`.

### Scroll e drag

As primeiras telas reais testadas (mail, calendario e HUD) nao expuseram scroll funcional no ponto:
mail ficou `(1,0) -> (1,0)`, calendario/HUD recusaram `no-scroll-handler`. A implementacao foi
endurecida para varrer **todos** os `RaycastAll`, cair para `ScrollRect`/`Scrollbar` por hierarquia
ou geometria e ajustar `normalizedPosition`/`value` quando o handler nao mover.

Prova em lista real longa (tela **Historico dos Pneus** ja aberta, somente scroll, sem clique nem
navegacao): alvo `TyreHistoryScreen/AnimationContainer/Table/List`, `scroll_rect` 0.09 -> 0.18
(`route=raycast`, `normalized_changed=true`), OCR antes/depois muda as linhas da tabela (por exemplo
`W. Evans` sai e `B. Tang` entra); scroll inverso restaura 0.18 -> 0.09. `action_desktop`:
foreground falso nas acoes.

Tambem foi provado em harness UGUI visivel e temporario (`{"op":"harness"}`), limpo em 30 s:

| Acao | normalized antes -> depois | OCR antes -> depois |
| --- | --- | --- |
| wheel `--dy -3` em (897,503) | 1.00 -> 0.87 | ROW 01..07 -> ROW 03..09 |
| drag 80 px para cima | 0.87 -> 0.52 | ROW 07..13 |
| wheel `--dy 3` (restauracao) | 0.52 -> 1.00 | ROW 01.. |
| clear | harness ausente no tree final | tela do jogo intacta |

`action_desktop`: foreground falso em todas as acoes; o jogo nao recebeu clique. Em uma execucao o
cursor externo se moveu (usuario ativo em outro programa); a bridge nao chama API de cursor, e o
`cursor_watch` registra o movimento externo.

### Text e key

`{"op":"selftest"}` cria um `InputField` UGUI fora da tela, exercita os handlers e destroi o harness:

- `text` replace: valor `synapse-harness`; append: `synapse-harness-ok` (`text_replace_ok` e
  `text_append_ok` verdadeiros).
- `key`: Return (`submit`), Escape (`cancel`), Tab (`navigation`, `moved=true`) e Down (`move`).
- Foreground falso e cursor inalterado durante o teste.

### Reinjecao e unload

- `stop` para o listener, remove o GameObject, restaura `runInBackground` e grava `run/stopped.json`.
- Reinjecao apos stop usa nome de assembly unico por build (carimbo do launcher); o novo build
  respondeu `ping` com protocolo 2 e generation reiniciada.

## Limitacoes registradas

- `dispatched` significa eventos UGUI executados; o efeito precisa ser confirmado por `tree`/OCR.
- Timeout apos envio e `outcome-unknown`; o consumidor nao deve repetir a acao.
- O harness e diagnostico interno, nao faz parte do contrato v2 nem do adaptador.
- Estado final do corte: bridge v2 canonica `listening` em 47823 (instance
  `384a8f67eaf54e35a31000258d1917e5`), tree final com 40 itens da tela de Historico dos Pneus,
  harness ausente, captura/OCR `canonical-final3.png` com o jogo em segundo plano.
- Hook de foreground passou a contar eventos do proprio processo MM (`game_foreground_events`
  incrementa quando o jogo volta ao foreground); ainda assim, o sampler externo
  `desktop-state.ps1`/fg2 e a prova recomendada para independencia do processo.
- Scroll em listas do jogo depende de a tela concreta ter `ScrollRect`/handler no ponto; as recusas
  acima sao a resposta correta, nao falha da bridge.
