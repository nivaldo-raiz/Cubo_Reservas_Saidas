# Cubo Seat Selection

MVP responsivo para escolha antecipada de assentos da viagem NR English & Action. Inclui jornada do responsável, painel administrativo, schema Supabase com RLS, reserva atômica, seed fictício e testes de regras críticas.

## Executar localmente

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Fluxo fictício: qualquer e-mail válido; OTP `123456`. O admin fechado usa `admin@example.cubo.global` em `/admin-acesso`. `APP_ENV=local` e `DEMO_MODE=true` mantêm a experiência sem dados ou serviços externos.

## Supabase

1. Crie um projeto Supabase e copie `.env.example` para `.env.local`.
2. Execute `supabase/migrations/0001_initial.sql` no SQL Editor ou via Supabase CLI.
3. Execute `supabase/seed.sql` somente em desenvolvimento.
4. Crie previamente o usuário admin no Supabase Auth e vincule seu `auth.users.id` em `admin_profiles`, com papel `super_admin`, `trip_admin` ou `viewer`.
5. Mantenha `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no servidor.

## E-mail

Em produção, defina `RESEND_API_KEY` e um remetente verificado. A resposta pública de solicitação de OTP é sempre neutra. O modo demo não envia e-mail.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Vercel preview

Importe o repositório na Vercel, conecte o projeto Supabase pelo Marketplace, configure as variáveis de `.env.example` e use `npm run build`. Cada pull request produzirá um preview. Antes de produção, desative `DEMO_MODE`, verifique domínio/remetente, aplique migrations, revise RLS e textos jurídicos.

## Limitações conscientes do MVP

- As telas funcionam integralmente em modo demonstrativo; a conexão real com Supabase/Resend depende das credenciais do ambiente.
- Upload binário e PDF nativo ficaram preparados no modelo, mas o MVP usa status administrativo e impressão do navegador.
- Admin demonstrativo não exige login; a proteção por magic link deve ser ativada com Supabase no ambiente publicado.
- Termos, privacidade, datas, contatos e configuração real dos ônibus exigem validação do Cubo.

Arquitetura e premissas: `docs/FASE-1-DIAGNOSTICO.md`. Ambientes, contas, Supabase, Resend, Vercel, segurança e rollback: `docs/OPERACAO-E-DEPLOY.md`.
