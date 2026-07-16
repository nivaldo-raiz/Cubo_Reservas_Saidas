# Cubo Seat Selection

Aplicação Next.js para liberar a escolha de assentos após confirmação de pagamento. O responsável entra por e-mail e OTP; o time de vendas usa uma autenticação administrativa separada.

## Execução local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Com `DEMO_MODE=true`, use:

- Responsável pago: `familia@example.com`, OTP `123456`.
- Responsável pendente: `pendente@example.com`, OTP `123456`.
- Admin: valores definidos em `DEMO_ADMIN_EMAIL` e `DEMO_ADMIN_PASSWORD`.

O modo demo usa somente dados fictícios em memória. Não deve ser ativado em preview ou produção.

## Banco Supabase

1. Crie um projeto Supabase.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no servidor.
3. Execute `supabase/migrations/0001_access_and_seats.sql` pelo Supabase CLI ou SQL Editor.
4. Opcionalmente, execute `supabase/seed.sql` apenas em desenvolvimento.
5. Defina `DEMO_MODE=false`, `OTP_PEPPER`, `GUARDIAN_SESSION_SECRET`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY` e `EMAIL_FROM`.

A service role nunca é enviada ao navegador. As tabelas têm RLS habilitado e não possuem policies para `anon` ou `authenticated`; todo acesso passa pelos Route Handlers no servidor.

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

## Importar alunos

No painel `/admin`, envie o arquivo HTML exportado da planilha de alunos. O importador utiliza somente `Aluno`, `Responsável` e `Email Responsável`; CPF, RG, telefones e nascimento não são armazenados. Novos responsáveis entram com pagamento `pendente` e reimportar o mesmo arquivo não duplica registros.

A planilha de professores não é importada neste MVP porque o modelo aprovado não possui entidade de professores nem assentos de equipe.

## Fluxo de acesso

1. A solicitação de OTP sempre retorna uma mensagem neutra, sem revelar se o e-mail existe.
2. O código é armazenado como HMAC, expira em 10 minutos e é invalidado após uso ou reenvio.
3. A sessão do responsável fica em cookie assinado `httpOnly` por 30 dias.
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

O formato HTML recebido está suportado. CSV pode ser acrescentado posteriormente, caso o processo operacional passe a exportá-lo nesse formato.
