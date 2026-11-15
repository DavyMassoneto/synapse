# Shell supervisionada

O supervisor mantém o keeper e o grupo registrado de cada shell até o encerramento explícito do lease. O comando e os argumentos da shell não recebem prefixos de controle. A autorização ocorre antes de iniciar o código do usuário.

## Diferenças observáveis aceitas

O resultado da ferramenta é produzido quando o líder da shell sai e a saída foreground já aceita pelo leitor e as escritas em voo foram drenadas. Saída escrita por processos em segundo plano depois desse ponto não é capturada no resultado. O grupo e os pipes continuam sob propriedade do lease para que o supervisor possa encerrá-los. Não se reproduz o intervalo privado de tolerância a stdio do SDK.

A inicialização do keeper pode acrescentar aproximadamente 0,2 segundo ao `wall_time_seconds`; esse campo mede o tempo real e não é corrigido artificialmente.

A propriedade de um grupo registrado não contém descendentes que criem outro grupo ou sessão. Serviços preexistentes não pertencem ao supervisor. Encerrar processos não desfaz efeitos externos já enviados.

## Distribuição

O keeper é TypeScript e usa a API pública `jiti/register`, com Jiti como dependência runtime direta e fixada. Não exige build manual. O host fornece os peers do pi e TypeBox. No Windows, o launcher distribuído usa Windows PowerShell e Add-Type para compilar o C# tipado em runtime. Depende desses componentes do Windows e das políticas de execução existentes; não usa ExecutionPolicy Bypass nem taskkill. Cria a shell suspensa, associa o Job Object antes do resume e encerra pelo handle. A execução do adapter completo e sua equivalência exigem o CI Windows; a prova mínima da #79 e a prova Unix no macOS não as substituem.
