# Integração computer-use

`registerComputerUse(pi, computerUse)` registra a ferramenta `computer_use`, o comando `/computer-use` (`status`, `doctor`, `install`, `reset`) e encerra o módulo em `session_shutdown`. A entrada do pacote é `src/extensions/computer-use.ts`, que chama `composeComputerUse`; a composição cria o módulo com `createComputerUse(createComputerUseHostDependencies())`.

A integração não lê nem escreve estado privado do módulo. Ela lê apenas configuração confiável do usuário no diretório do agente e entrega os valores como dependências explícitas. Os arquivos são independentes e ausentes por padrão:

- `~/.pi/agent/computer-use-driver-policy.json`: política do provisionamento gerenciado do driver. Ausente equivale a `{ "mode": "latest-stable" }`.
- `~/.pi/agent/computer-use-driver.json`: lançamento explícito do driver, para desenvolvimento e testes. Substitui o binário gerenciado inteiro e desativa o provisionamento.
- `~/.pi/agent/computer-use-unity-bridge.json`: bridge in-process para aplicativos Unity. Não interfere na política nem no lançamento do driver.

`PI_CUA_DRIVER_CMD` é outro override explícito do binário, com o mesmo efeito do arquivo de lançamento. Os arquivos são lidos uma vez na montagem; arquivo ausente mantém o comportamento correspondente, arquivo inválido é recusado com erro explícito em vez de ser ignorado.

## Política do driver gerenciado

O modo padrão resolve a última release estável publicada a cada nova inicialização da sessão do driver, verifica a integridade publicada e instala ou reutiliza uma instalação íntegra. `diagnose` consulta sem baixar nem instalar. A política não muda no meio de uma sessão já iniciada; uma sessão em andamento não é derrubada por uma release nova.

Configuração explícita de pinagem, sempre com versão exata e motivo rastreável:

```json
{
  "mode": "pinned",
  "version": "0.49.7",
  "reason": "Baseline de regressão do Motorsport Manager; reavaliar quando a regressão for corrigida."
}
```

`reason` vazio ou só com espaços, faixa de versões e versão pré-release são recusados. A versão é comparada como número, não como texto. O motivo fica registrado no diagnóstico da exceção. Pinagem é opt-in auditável; o padrão nunca fica preso a uma versão por conveniência e não há número de versão compilado como default.

## Lançamento explícito do driver

`computer-use-driver.json` aceita apenas `command` (texto não vazio) e `arguments` (lista de textos):

```json
{ "command": "node", "arguments": ["driver-falso.mjs"] }
```

É configuração confiável do usuário, para dirigir um processo falso em testes ou um driver mantido pelo operador. Por selecionar o binário diretamente, esse override fica fora da política gerenciada: não exige pin, não é atualizado nem verificado pela política e desativa o provisionamento automático. `diagnose`/`status` informam essa condição; a política continua válida para quando o override for removido. O teste de distribuição usa esse arquivo no diretório isolado do agente para executar exclusivamente um processo Node falso.

## Bridge Unity

`computer-use-unity-bridge.json` habilita a rota de UI UGUI dentro de um processo Unity já em execução, sem primeiro plano e sem entrada global:

```json
{
  "handshakeDirectory": "C:\\exemplo\\synapse\\src\\modules\\computer-use\\adapters\\unity-bridge\\native",
  "attachCommand": { "command": "C:\\exemplo\\synapse\\src\\modules\\computer-use\\adapters\\unity-bridge\\native\\launcher\\bin\\Release\\net8.0\\synapse-bridge-launcher.exe", "arguments": ["inject", "--pid", "1234"] }
}
```

Os caminhos acima são exemplos reproduzíveis de uma instalação local; o build nativo x64 é requisito separado e não é produzido por `npm run build`. A montagem preserva a bridge mesmo quando há override de lançamento, e a bridge continua independente da política do driver. Detalhes de protocolo, build, injeção e limites em [native/README.md](../../../modules/computer-use/adapters/unity-bridge/native/README.md).

## Comportamento da ferramenta

A integração traduz argumentos snake_case e coordenadas `[x, y]` para os contratos do módulo; segurança, alvo e política de repetição permanecem no módulo. Cancelamento antes do início impede execução; cancelamento durante uma chamada não afirma ausência de efeito e exige nova observação.

A entrada opera somente em segundo plano. `delivery_mode='foreground'`, `bring_to_front` e `raise_window` são recusados pela política do módulo antes de qualquer chamada ao driver; `focus_app` sem elevar apenas seleciona o alvo. O veredito não encaminha recomendação de primeiro plano do driver: pede captura nova e, em aplicativo Unity, informa que a interface pode exigir uma bridge específica. A descrição, as guidelines e o esquema da ferramenta dizem isso ao modelo; os quatro controles do título da janela não são conteúdo do aplicativo.
