-- Dados exclusivamente fictícios para desenvolvimento.
insert into public.responsaveis (id, nome, email, status_pagamento)
values
  ('10000000-0000-4000-8000-000000000001', 'Mariana Oliveira', 'familia@example.com', 'pago'),
  ('10000000-0000-4000-8000-000000000002', 'Rafael Santos', 'pendente@example.com', 'pendente')
on conflict (id) do nothing;

insert into public.onibus (id, nome, capacidade)
values
  ('30000000-0000-4000-8000-000000000001', 'Ônibus A', 44),
  ('30000000-0000-4000-8000-000000000002', 'Ônibus B', 44)
on conflict (id) do update
set nome = excluded.nome,
    capacidade = excluded.capacidade;

insert into public.criancas (id, nome, responsavel_id, onibus_id)
values
  ('20000000-0000-4000-8000-000000000001', 'Ana Oliveira', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'Lucas Oliveira', '10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', 'Beatriz Santos', '10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001')
on conflict (id) do update
set nome = excluded.nome,
    responsavel_id = excluded.responsavel_id,
    onibus_id = excluded.onibus_id;

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
