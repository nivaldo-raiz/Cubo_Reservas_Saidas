begin;

create extension if not exists pgcrypto;

create table if not exists public.responsaveis (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 160),
  email text not null check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 254
  ),
  status_pagamento text not null default 'pendente'
    check (status_pagamento in ('pendente', 'pago')),
  created_at timestamptz not null default now()
);

create unique index if not exists responsaveis_email_unique
  on public.responsaveis (lower(email));

create table if not exists public.criancas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 160),
  responsavel_id uuid not null references public.responsaveis(id) on delete cascade
);

create index if not exists criancas_responsavel_id_idx
  on public.criancas (responsavel_id);

create unique index if not exists criancas_responsavel_nome_unique
  on public.criancas (responsavel_id, lower(nome));

create table if not exists public.onibus (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 1 and 100),
  capacidade integer not null check (capacidade > 0 and capacidade <= 100)
);

create table if not exists public.assentos (
  id uuid primary key default gen_random_uuid(),
  onibus_id uuid not null references public.onibus(id) on delete cascade,
  numero integer not null check (numero > 0),
  crianca_id uuid null references public.criancas(id) on delete set null,
  constraint assentos_onibus_numero_unique unique (onibus_id, numero),
  constraint assentos_crianca_unique unique (crianca_id)
);

create index if not exists assentos_onibus_id_idx on public.assentos (onibus_id);

create table if not exists public.confirmacoes (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references public.responsaveis(id) on delete cascade,
  etapa text not null check (
    etapa in ('antes_da_escolha', 'revisao_do_assento', 'confirmacao_final')
  ),
  confirmado_em timestamptz not null default now()
);

create index if not exists confirmacoes_responsavel_id_idx
  on public.confirmacoes (responsavel_id, confirmado_em desc);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 254
  ),
  senha_hash text not null check (char_length(senha_hash) >= 50),
  created_at timestamptz not null default now()
);

create unique index if not exists admins_email_unique on public.admins (lower(email));

-- Estado transitório necessário para OTP de uso único; não contém o código em texto puro.
create table if not exists public.codigos_acesso (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references public.responsaveis(id) on delete cascade,
  codigo_hash text not null,
  expira_em timestamptz not null,
  usado_em timestamptz null,
  tentativas integer not null default 0 check (tentativas between 0 and 5),
  ip_hash text null,
  created_at timestamptz not null default now()
);

create index if not exists codigos_acesso_responsavel_created_idx
  on public.codigos_acesso (responsavel_id, created_at desc);

create unique index if not exists codigos_acesso_um_ativo_por_responsavel
  on public.codigos_acesso (responsavel_id)
  where usado_em is null;

alter table public.responsaveis enable row level security;
alter table public.criancas enable row level security;
alter table public.onibus enable row level security;
alter table public.assentos enable row level security;
alter table public.confirmacoes enable row level security;
alter table public.admins enable row level security;
alter table public.codigos_acesso enable row level security;

-- Não há policies para anon/authenticated: todo acesso passa pelos handlers server-side.
revoke all on table public.responsaveis from anon, authenticated;
revoke all on table public.criancas from anon, authenticated;
revoke all on table public.onibus from anon, authenticated;
revoke all on table public.assentos from anon, authenticated;
revoke all on table public.confirmacoes from anon, authenticated;
revoke all on table public.admins from anon, authenticated;
revoke all on table public.codigos_acesso from anon, authenticated;

create or replace function public.reservar_assento(
  p_responsavel_id uuid,
  p_crianca_id uuid,
  p_assento_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_assento public.assentos%rowtype;
  v_assento_atual uuid;
begin
  select status_pagamento
    into v_status
    from public.responsaveis
   where id = p_responsavel_id
   for update;

  if not found or v_status <> 'pago' then
    raise exception 'PAYMENT_REQUIRED' using errcode = 'P0001';
  end if;

  perform 1
    from public.criancas
   where id = p_crianca_id
     and responsavel_id = p_responsavel_id
   for update;

  if not found then
    raise exception 'CHILD_NOT_FOUND' using errcode = 'P0001';
  end if;

  select id
    into v_assento_atual
    from public.assentos
   where crianca_id = p_crianca_id;

  if v_assento_atual = p_assento_id then
    select * into v_assento from public.assentos where id = p_assento_id;
    return jsonb_build_object(
      'id', v_assento.id,
      'onibusId', v_assento.onibus_id,
      'numero', v_assento.numero
    );
  elsif v_assento_atual is not null then
    raise exception 'CHILD_ALREADY_SEATED' using errcode = 'P0001';
  end if;

  select *
    into v_assento
    from public.assentos
   where id = p_assento_id
   for update;

  if not found then
    raise exception 'SEAT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_assento.crianca_id is not null then
    raise exception 'SEAT_TAKEN' using errcode = 'P0001';
  end if;

  update public.assentos
     set crianca_id = p_crianca_id
   where id = p_assento_id
     and crianca_id is null;

  if not found then
    raise exception 'SEAT_TAKEN' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'id', v_assento.id,
    'onibusId', v_assento.onibus_id,
    'numero', v_assento.numero
  );
exception
  when unique_violation then
    raise exception 'SEAT_TAKEN' using errcode = 'P0001';
end;
$$;

revoke all on function public.reservar_assento(uuid, uuid, uuid) from public;
revoke all on function public.reservar_assento(uuid, uuid, uuid) from anon, authenticated;
grant execute on function public.reservar_assento(uuid, uuid, uuid) to service_role;

create or replace function public.incrementar_tentativa_codigo(p_codigo_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.codigos_acesso
     set tentativas = least(tentativas + 1, 5)
   where id = p_codigo_id
     and usado_em is null
     and tentativas < 5;
$$;

revoke all on function public.incrementar_tentativa_codigo(uuid) from public;
revoke all on function public.incrementar_tentativa_codigo(uuid) from anon, authenticated;
grant execute on function public.incrementar_tentativa_codigo(uuid) to service_role;

create or replace function public.importar_responsaveis_criancas(p_registros jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registro jsonb;
  v_responsavel_id uuid;
  v_responsavel_nome text;
  v_responsavel_email text;
  v_crianca_nome text;
  v_linhas integer;
  v_responsaveis_criados integer := 0;
  v_criancas_criadas integer := 0;
  v_registros_existentes integer := 0;
begin
  if jsonb_typeof(p_registros) <> 'array' then
    raise exception 'INVALID_IMPORT_PAYLOAD' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_registros) > 2000 then
    raise exception 'IMPORT_LIMIT_EXCEEDED' using errcode = 'P0001';
  end if;

  for v_registro in select value from jsonb_array_elements(p_registros)
  loop
    v_responsavel_nome := btrim(v_registro ->> 'responsavel_nome');
    v_responsavel_email := lower(btrim(v_registro ->> 'responsavel_email'));
    v_crianca_nome := btrim(v_registro ->> 'crianca_nome');

    if coalesce(v_responsavel_nome, '') = ''
      or coalesce(v_responsavel_email, '') = ''
      or coalesce(v_crianca_nome, '') = '' then
      raise exception 'INVALID_IMPORT_ROW' using errcode = 'P0001';
    end if;

    insert into public.responsaveis (nome, email, status_pagamento)
    values (v_responsavel_nome, v_responsavel_email, 'pendente')
    on conflict do nothing;
    get diagnostics v_linhas = row_count;
    v_responsaveis_criados := v_responsaveis_criados + v_linhas;

    select id into v_responsavel_id
      from public.responsaveis
     where email = v_responsavel_email;

    if v_responsavel_id is null then
      raise exception 'INVALID_IMPORT_GUARDIAN' using errcode = 'P0001';
    end if;

    insert into public.criancas (nome, responsavel_id)
    values (v_crianca_nome, v_responsavel_id)
    on conflict do nothing;
    get diagnostics v_linhas = row_count;
    v_criancas_criadas := v_criancas_criadas + v_linhas;
    if v_linhas = 0 then
      v_registros_existentes := v_registros_existentes + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'responsaveis_criados', v_responsaveis_criados,
    'criancas_criadas', v_criancas_criadas,
    'registros_existentes', v_registros_existentes
  );
end;
$$;

revoke all on function public.importar_responsaveis_criancas(jsonb) from public;
revoke all on function public.importar_responsaveis_criancas(jsonb) from anon, authenticated;
grant execute on function public.importar_responsaveis_criancas(jsonb) to service_role;

commit;
