# Cubo Seat Selection

Aplicação Next.js para liberar a escolha de assentos após confirmação de pagamento. O responsável confirma sua identidade com Google ou Microsoft; o backend libera somente e-mails previamente cadastrados. O time de vendas usa uma autenticação administrativa separada.

## Execução local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Com `DEMO_MODE=true`, use o botão **Entrar na demonstração**. O admin utiliza os valores definidos em `DEMO_ADMIN_EMAIL` e `DEMO_ADMIN_PASSWORD`.

O modo demo usa somente dados fictícios em memória. Não deve ser ativado em produção.

## Banco Supabase

1. Crie um projeto Supabase.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY` no servidor. Os nomes legados `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` também são aceitos.
3. Aplique as migrations de `supabase/migrations` pela integração do GitHub ou pelo Supabase CLI.
4. Opcionalmente, execute `supabase/seed.sql` apenas em desenvolvimento.
5. Defina `DEMO_MODE=false`, `NEXT_PUBLIC_APP_URL`, `GUARDIAN_SESSION_SECRET` e `ADMIN_SESSION_SECRET`.

A service role nunca é enviada ao navegador. As tabelas têm RLS habilitado e não possuem policies para `anon` ou `authenticated`; todo acesso passa pelos Route Handlers no servidor.

## OAuth Google e Microsoft

1. Em **Supabase → Authentication → URL Configuration**, configure a URL pública do sistema como Site URL e adicione `<URL_DO_SISTEMA>/auth/callback` à lista de redirects.
2. No Google Cloud, crie um cliente OAuth Web e use `https://<PROJECT_REF>.supabase.co/auth/v1/callback` como redirect autorizado. Cadastre o Client ID e o Client Secret em **Supabase → Authentication → Providers → Google**.
3. No Microsoft Entra ID, registre uma aplicação Web com o mesmo callback do Supabase. Cadastre Client ID e Client Secret em **Providers → Azure (Microsoft)**.
4. No manifesto do Entra ID, inclua as claims opcionais `email` e `xms_edov`, conforme a recomendação de segurança do Supabase para confirmar o domínio do e-mail.

O login do provedor apenas confirma a identidade. O callback consulta `responsaveis` no servidor e cria a sessão interna somente quando o e-mail confirmado existe nessa tabela.

## Primeiro admin

Depois da migration, defina as variáveis somente no terminal e execute:

```powershell
$env:ADMIN_BOOTSTRAP_EMAIL="admin@cubo.global"
$env:ADMIN_BOOTSTRAP_PASSWORD="uma-senha-forte-com-12-caracteres"
npm run admin:create
Remove-Item Env:ADMIN_BOOTSTRAP_EMAIL
Remove-Item Env:ADMIN_BOOTSTRAP_PASSWORD
```

A senha é armazenada apenas como hash bcrypt. O login administrativo fica em `/admin-acesso`.

## Dados iniciais

Alunos, responsáveis e professores são carregados diretamente no Supabase durante a preparação do ambiente. A aplicação entregue ao cliente não expõe importação de planilhas. Para o fluxo de acesso dos responsáveis, são armazenados somente o nome do aluno, o nome do responsável e o e-mail do responsável.

## Fluxo de acesso

1. O Supabase executa OAuth com PKCE e troca o código somente no callback do servidor.
2. O servidor valida o usuário com `getUser()` e consulta a lista de responsáveis por e-mail.
3. A sessão do responsável fica em cookie assinado `httpOnly` por 30 dias; a sessão social do Supabase é encerrada após a validação.
4. O status de pagamento é consultado novamente em toda página ou ação protegida. Desmarcar o pagamento no admin bloqueia o fluxo imediatamente.
5. A reserva é concluída pela função PostgreSQL `reservar_assento`, com locks e restrições únicas.
6. Cada checkpoint de documentação insere uma linha própria em `confirmacoes`.

## Verificação

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```
