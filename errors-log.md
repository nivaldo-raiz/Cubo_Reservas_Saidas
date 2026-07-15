# Errors log

## 2026-07-14 - Demo local deixou de acessar e sessao expirava apos reinicio

- **Sintoma:** o endereco `http://localhost:3000` funcionou inicialmente e depois passou a recusar conexao; uma sessao de responsavel iniciada antes de reiniciar o servidor tambem podia falhar na reserva.
- **Causa 1 (processo):** nao havia processo Node/Next escutando na porta 3000. O endereco local so existe enquanto `npm run dev` ou `npm run start` estiver em execucao.
- **Causa 2 (sessao demo):** o cookie continha um token opaco cuja sessao correspondente existia apenas em um `Map` na memoria do processo. Reiniciar o Next preservava o cookie no navegador, mas apagava o registro server-side, resultando em `401 Sessao expirada` na reserva.
- **Causa 3 (OTP demo):** reiniciar o processo entre solicitar e validar o codigo apagava o OTP ficticio da memoria, embora a interface ainda orientasse usar `123456`.
- **Correcao:** no ambiente estritamente local/demo, a sessao passou a usar cookie HttpOnly assinado com expiracao e validacao constante no servidor; o OTP fixo `123456` continua valido mesmo se o processo reiniciar entre as duas etapas. Preview e producao continuam usando tokens aleatorios persistidos e nunca adotam essa excecao.
- **Verificacao:** home `200`; validacao demo sem estado anterior `200`; cookie emitido; `/alunos` `200`; reserva autenticada `201`; reserva anonima `401`. Lint, typecheck e 6 testes aprovados.
- **Operacao:** para acessar o demo, manter `npm run dev` aberto. Fechar o terminal encerra o servidor local.

## 2026-07-14 - Hardening de autenticacao e autorizacao

- **Diagnostico:** admin sem gate, OTP sem persistencia/sessao e reserva confiando em identificadores do cliente.
- **Causa:** primeira entrega preparava integracao, mas mantinha fluxos demonstrativos na fronteira server-side.
- **Correcao:** dois modelos de auth, cookies HttpOnly, repositorio local/conectado, autorizacao explicita, admin_profiles/RLS e service role server-only.
- **Regressao no ciclo 1:** handler admin comparava objeto Zod com string. Corrigido para `parsed.data.email`.
- **Verificacao:** lint, typecheck, testes e build verdes; smoke HTTP validou 202/200/201/401 e gate admin 307.

## 2026-07-14 - Demo inacessivel apos copiar .env.example

- **Sintoma:** navegador retorna conexao recusada; ao iniciar manualmente, o build falha com `NEXT_PUBLIC_SUPABASE_URL Invalid URL`.
- **Causa 1:** o servidor usado na validacao anterior tinha timeout e foi encerrado; nenhum processo escutava a porta 3000.
- **Causa 2:** `.env.local` continha variaveis opcionais vazias. Zod tratava `""` como valor presente e rejeitava a URL, contrariando o requisito de modo local sem credenciais.
- **Tentativa intermediaria:** launcher Node inicialmente quebrou o caminho com espacos; corrigido com aspas explicitas. Em seguida revelou corretamente a ausencia de build.
- **Correcao:** preprocessar strings vazias opcionais para `undefined`, recompilar e iniciar launcher persistente com caminho escapado.
