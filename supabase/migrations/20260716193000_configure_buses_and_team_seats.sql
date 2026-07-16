begin;

alter table public.assentos
  add column if not exists bloqueado boolean not null default false;

insert into public.onibus (id, nome, capacidade)
values
  ('30000000-0000-4000-8000-000000000001', 'Ônibus 1', 44),
  ('30000000-0000-4000-8000-000000000002', 'Ônibus 2', 44)
on conflict (id) do update
set nome = excluded.nome,
    capacidade = excluded.capacidade;

do $$
begin
  if exists (
    select 1
      from public.assentos
     where onibus_id in (
       '30000000-0000-4000-8000-000000000001'::uuid,
       '30000000-0000-4000-8000-000000000002'::uuid
     )
       and numero in (1, 2, 43, 44)
       and crianca_id is not null
  ) then
    raise exception 'Não é possível reservar os assentos da equipe: existe uma criança vinculada.';
  end if;
end;
$$;

insert into public.assentos (onibus_id, numero, bloqueado)
select bus.id, seat.numero, seat.numero in (1, 2, 43, 44)
from (
  values
    ('30000000-0000-4000-8000-000000000001'::uuid),
    ('30000000-0000-4000-8000-000000000002'::uuid)
) as bus(id)
cross join generate_series(1, 44) as seat(numero)
on conflict (onibus_id, numero) do update
set bloqueado = excluded.bloqueado;

alter table public.assentos
  add constraint assentos_bloqueado_sem_crianca
  check (not bloqueado or crianca_id is null);

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

  if v_assento.bloqueado then
    raise exception 'SEAT_BLOCKED' using errcode = 'P0001';
  end if;

  if v_assento.crianca_id is not null then
    raise exception 'SEAT_TAKEN' using errcode = 'P0001';
  end if;

  update public.assentos
     set crianca_id = p_crianca_id
   where id = p_assento_id
     and crianca_id is null
     and not bloqueado;

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

commit;
