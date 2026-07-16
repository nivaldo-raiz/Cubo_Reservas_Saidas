begin;

update public.onibus
set nome = case id
  when '30000000-0000-4000-8000-000000000001'::uuid then 'Ônibus A'
  when '30000000-0000-4000-8000-000000000002'::uuid then 'Ônibus B'
end
where id in (
  '30000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000002'::uuid
);

alter table public.criancas
  add column onibus_id uuid references public.onibus(id) on delete restrict;

create temporary table vinculos_onibus_alunos (
  nome text primary key,
  onibus_id uuid not null
) on commit drop;

insert into vinculos_onibus_alunos (nome, onibus_id)
values
  ('Guilherme Baars Caon', '30000000-0000-4000-8000-000000000001'::uuid),
  ('João Pedro Cabral de Almeida Falcão', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Nicolas Damian Lima Cordero', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Amanda Cabral de Almeida Falcão', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Carolina Provenzano Nicolau de Souza', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Eduardo Carneiro da Silva Santos', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Helena Cristina Andrade Saraiva', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Joana Bordalo Osso', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Joana Henriques Moraes', '30000000-0000-4000-8000-000000000001'::uuid),
  ('José Pedro Torquato Carvalho da Silva', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Maitê Barbosa Ferreira', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Maria Fernanda Pereira Arjones', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Miguel Gioseffi Leal', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Pedro Giorelli de Carvalho', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Valentina de Oliveira Guimarães Moraes', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Alice Roscher Mattoso Maia Kronig', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Ariel Sales de Farias', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Bernardo Vianna Arruda', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Dora Carino Ciminelli', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Felipe Wanderley Buzar', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Gabriel Leitão Sindeaux', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Gabriel Lins Ramos Ribeiro', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Maria Luiza Cirilo Fadel', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Anita Monteiro Marques', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Caio Marques Martinez', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Isabel Shalders do Amaral Schettino', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Isabella dos Santos Soares Pereira', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Maria Clara de Moura Palha Mondêgo Amorim', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Pedro Braga Ferreira Frossard', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Pedro Henrique Magoulas Bezerra de Melo', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Vítor Vianna Arruda', '30000000-0000-4000-8000-000000000001'::uuid),
  ('Catarina Bade de Oliveira Sacchetto Martins', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Desirée Santos Queiroz Pereira', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Eduardo Lisboa Maggessi Pereira', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Flora Mueller Corrêa', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Guilherme Citera Ennes', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Luiza Caldas dos Santos', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Mariana Gomes Peregrino', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Miguel Pineiro Gavinho', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Nicolle Candido Andraos', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Sebastien Gonzalez', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Theo Cury Alvarenga', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Alice Valerio Stanislovaitis Veiga', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Amanda Santos Folego Ribeiro', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Cauã Marques Barata', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Eduardo Ahouagi de Barros Naves', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Igor Jund Oliveira Santana', '30000000-0000-4000-8000-000000000002'::uuid),
  ('João Miguel Motta da Rocha', '30000000-0000-4000-8000-000000000002'::uuid),
  ('João Pedro Basile do Lago', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Lucas Carino Seda', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Luiza Seixas de Aguilar', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Manuella Bispo dos Reis Nunes', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Marina Erbisti Barreto', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Nicollas Bispo dos Reis Nunes', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Beatriz Argüelles de Souza Sá Barros', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Isabela Simoes Bazzo', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Laura Lins Ribeiro Pereira', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Manuela Barbosa de Carvalho', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Maria Eduarda Machado de Azevedo', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Maria Fernanda Loureiro da Silveira', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Maria Vitória Pereira Macedo Lima', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Otto Chernicharo Costa', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Theo Ennes Arongaus', '30000000-0000-4000-8000-000000000002'::uuid),
  ('Valentina Gasparello Garcia Buch Sampaio', '30000000-0000-4000-8000-000000000002'::uuid);

do $$
declare
  v_criancas integer;
  v_atualizadas integer;
begin
  select count(*) into v_criancas from public.criancas;

  if v_criancas > 0 then
    if v_criancas <> 64 then
      raise exception 'BUS_ASSIGNMENT_UNEXPECTED_CHILD_COUNT' using errcode = 'P0001';
    end if;

    if (select count(*) from public.criancas c join vinculos_onibus_alunos v on v.nome = c.nome) <> 64
      or exists (
        select 1
          from public.criancas c
          left join vinculos_onibus_alunos v on v.nome = c.nome
         where v.nome is null
      ) then
      raise exception 'BUS_ASSIGNMENT_NAME_MISMATCH' using errcode = 'P0001';
    end if;

    update public.criancas c
       set onibus_id = v.onibus_id
      from vinculos_onibus_alunos v
     where c.nome = v.nome;
    get diagnostics v_atualizadas = row_count;

    if v_atualizadas <> 64 then
      raise exception 'BUS_ASSIGNMENT_INCOMPLETE' using errcode = 'P0001';
    end if;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
      from public.assentos a
      join public.criancas c on c.id = a.crianca_id
     where a.onibus_id <> c.onibus_id
  ) then
    raise exception 'BUS_ASSIGNMENT_CONFLICTS_WITH_EXISTING_SEAT' using errcode = 'P0001';
  end if;
end;
$$;

alter table public.criancas
  alter column onibus_id set not null,
  add constraint criancas_onibus_configurado check (
    onibus_id in (
      '30000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000002'::uuid
    )
  );

create or replace function public.validar_onibus_do_assento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.crianca_id is not null and not exists (
    select 1
      from public.criancas c
     where c.id = new.crianca_id
       and c.onibus_id = new.onibus_id
  ) then
    raise exception 'BUS_MISMATCH' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger assentos_validar_onibus
before insert or update of crianca_id, onibus_id on public.assentos
for each row execute function public.validar_onibus_do_assento();

create or replace function public.validar_onibus_da_crianca()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
      from public.assentos a
     where a.crianca_id = new.id
       and a.onibus_id <> new.onibus_id
  ) then
    raise exception 'BUS_MISMATCH' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger criancas_validar_onibus
before update of onibus_id on public.criancas
for each row execute function public.validar_onibus_da_crianca();

revoke all on function public.validar_onibus_do_assento() from public, anon, authenticated;
revoke all on function public.validar_onibus_da_crianca() from public, anon, authenticated;

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
  v_onibus_id uuid;
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

  select onibus_id
    into v_onibus_id
    from public.criancas
   where id = p_crianca_id
     and responsavel_id = p_responsavel_id
   for update;

  if not found then
    raise exception 'CHILD_NOT_FOUND' using errcode = 'P0001';
  end if;

  select *
    into v_assento
    from public.assentos
   where id = p_assento_id
   for update;

  if not found then
    raise exception 'SEAT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_assento.onibus_id <> v_onibus_id then
    raise exception 'BUS_MISMATCH' using errcode = 'P0001';
  end if;

  select id
    into v_assento_atual
    from public.assentos
   where crianca_id = p_crianca_id;

  if v_assento_atual = p_assento_id then
    return jsonb_build_object(
      'id', v_assento.id,
      'onibusId', v_assento.onibus_id,
      'numero', v_assento.numero
    );
  elsif v_assento_atual is not null then
    raise exception 'CHILD_ALREADY_SEATED' using errcode = 'P0001';
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
     and onibus_id = v_onibus_id
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

drop function if exists public.importar_responsaveis_criancas(jsonb);

commit;
