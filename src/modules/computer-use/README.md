# Computer-use

O módulo controla o computador via cua-driver. `createComputerUse(dependencies)` devolve `execute`, `diagnose`, `install` e `stop`. O núcleo mantém o alvo, a segurança e os resultados explícitos; timeouts e quedas de transporte de entradas nunca provocam reenvio.

`execute(action, context, signal?)` aceita um `AbortSignal` opcional. Antes do próximo envio ao driver, o cancelamento devolve `result.kind = "cancelled"` e impede a entrada. Uma entrada já enviada não é desfeita: o módulo espera a resposta ou o timeout configurado e preserva confirmação, ausência de verificação ou resultado desconhecido, sempre sem repetição automática da entrada. O cancelamento também impede uma nova tentativa de leitura.

Uma captura opcional cancelada depois da entrada não apaga o resultado: `captureFailure` registra a falha. `precedingEffects` preserva o resultado de uma seleção de foco anterior quando a entrada seguinte falha ou é cancelada. Inicialização, espera e chamada já iniciadas podem continuar até terminar; o sinal não promete interrupção imediata nem reversão de efeito.

## Política de execução

O módulo é estritamente somente em segundo plano. `delivery_mode='foreground'`, `bring_to_front` e `raise_window` são recusados antes de qualquer chamada ao driver. `focus_app` sem elevar apenas seleciona o alvo. Capturas com `window_id` isolado resolvem o processo proprietário por `list_windows`, sem exigir que o chamador já conheça o PID.

## Provisionamento gerenciado

O primeiro `execute` que precisa inicializar o driver resolve a última release estável publicada de `trycua/cua`, verifica a integridade publicada e instala ou reutiliza a versão selecionada. Uma nova inicialização de sessão do driver resolve novamente os metadados; a seleção permanece imutável durante a vida daquela sessão, sem atualização no meio de uma ação. Uma sessão em andamento não é derrubada pelo lançamento de uma release nova.

A resolução considera somente tags `cua-driver-rs-vMAJOR.MINOR.PATCH` estáveis do produto driver, compara os componentes numéricos e não aceita rascunhos, nightlies, pré-releases nem artefatos de outro produto do monorepo. A convenção oficial do repositório publica tags estáveis simples mesmo quando a API as marca como pré-release; essa exceção é específica desse produto e está documentada no adaptador.

A integridade é verificada antes da extração e da execução. O SHA-256 vem de fonte oficial da mesma release (`SHA256SUMS`, `checksums.txt` ou `release-manifest.json` validado pelo digest da API; na ausência delas, o digest SHA-256 do asset publicado pela API), com nome, tamanho e hash exatos. Hash ausente, duplicado, malformado ou divergente recusa a instalação. O download passa por staging, a versão é validada e publicada em pasta versionada com recibo de proveniência; o ponteiro só muda de forma atômica depois da validação. Versões já publicadas não são sobrescritas nem apagadas, e uma falha preserva a instalação anterior sem usá-la silenciosamente como se fosse a última.

Uma instalação já na última versão resolvida, com recibo coerente e arquivo executável íntegro, é reutilizada sem novo download ou extração. Arquivo ausente, corrompido ou sem proveniência não conta como instalação íntegra apenas por estar na pasta esperada. A consulta de release falha de forma explícita em erro de rede, limite de taxa ou limite de páginas; nesse caso uma instalação antiga não é apresentada como atual.

`diagnose` apenas verifica a instalação e a política configurada, sem baixar, extrair ou instalar. `install` executa o provisionamento gerenciado de forma explícita.

SHA-256 e TLS detectam corrupção e divergência entre metadados e bytes, mas não autenticam sozinhos a origem contra comprometimento simultâneo do repositório e da release. O projeto publica bundles Sigstore, porém este módulo não verifica a cadeia de certificados nem declara assinatura verificada; verificação adicional exige um verificador Sigstore/cosign mantido e uma política de identidade oficial previamente confirmada. Sem checksum oficial em nenhuma fonte confiável, o download é recusado.

## Política de versão

A ausência de `driverPolicy` nas dependências equivale a `{ "mode": "latest-stable" }`. Não há versão compilada como default.

A pinagem é opt-in e auditável: `{ "mode": "pinned", "version": "0.49.7", "reason": "..." }`. A versão deve ser exata e o motivo não pode ser vazio nem conter apenas espaços; faixas e pré-releases são recusadas antes de qualquer download. O motivo fica registrado no diagnóstico da exceção.

`driverPath`/`PI_CUA_DRIVER_CMD` e `driverLaunch` são overrides explícitos do binário, destinados a teste e desenvolvimento. Eles desativam o provisionamento gerenciado: o binário não é atualizado, substituído nem verificado pela política. `diagnose` informa essa condição. A política latest/pin vale para o caminho gerenciado, que volta a valer quando o override é removido.

A instalação usa `tar -xf` para `.tar.gz` e `.zip`. O `tar.exe` fornecido no Windows 10 ou posterior suporta ZIP. Se o executável `tar` não estiver disponível, a extração é recusada com mensagem explícita orientando extração manual.

## Bridge Unity

`unityBridge` é uma dependência opcional. Quando configurada, a infraestrutura envolve o processo do driver com a bridge in-process e as capturas de uma janela Unity mesclam os elementos UGUI aos elementos nativos, permitindo clique por elemento, texto, teclas e rolagem sem primeiro plano. A ausência da bridge não autoriza primeiro plano: a limitação é informada e a captura continua somente em segundo plano. O módulo não lê a configuração privada do host; a integração entrega `unityBridge`, `driverPolicy` e `driverLaunch` já validados.

A ponte nativa é específica para Windows x64 com Unity/Mono. O build dos artefatos C#/C++ é um passo separado e não é produzido por `npm run build`; instruções, protocolo, provas e limitações ficam em [native/README.md](adapters/unity-bridge/native/README.md).

## Testes

Os testes automatizados executam exclusivamente processos Node falsos. Não executam cua-driver real nem ações de mouse, teclado ou janela. As provas reais em Motorsport Manager são manuais, isoladas e registradas em [native/docs/EVIDENCE.md](adapters/unity-bridge/native/docs/EVIDENCE.md); a cobertura comprovada é Mono/UGUI no jogo citado, não uma garantia para qualquer aplicativo Unity.
