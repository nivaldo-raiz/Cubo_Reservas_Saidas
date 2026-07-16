begin;

create table if not exists public.professores (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 160),
  cpf text null check (cpf ~ '^[0-9]{11}$'),
  sexo text null check (
    sexo is null or char_length(btrim(sexo)) between 1 and 40
  ),
  data_nascimento date null check (
    data_nascimento is null
    or (
      data_nascimento >= date '1900-01-01'
      and data_nascimento <= current_date
    )
  ),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professores_cpf_unique unique (cpf),
  constraint professores_nome_unique unique (nome)
);

alter table public.professores enable row level security;

-- Professores não são expostos diretamente ao navegador. O acesso fica restrito
-- aos processos server-side autenticados com a chave administrativa.
revoke all on table public.professores from anon, authenticated;
grant select, insert, update, delete on table public.professores to service_role;

commit;
