-- Dados exclusivamente fictícios para desenvolvimento.
insert into public.responsaveis (id, nome, email, status_pagamento)
values
  ('10000000-0000-4000-8000-000000000001', 'Mariana Oliveira', 'familia@example.com', 'pago'),
  ('10000000-0000-4000-8000-000000000002', 'Rafael Santos', 'pendente@example.com', 'pendente')
on conflict (id) do nothing;

insert into public.criancas (id, nome, responsavel_id)
values
  ('20000000-0000-4000-8000-000000000001', 'Ana Oliveira', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', 'Lucas Oliveira', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003', 'Beatriz Santos', '10000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

insert into public.onibus (id, nome, capacidade)
values
  ('30000000-0000-4000-8000-000000000001', 'Ônibus 1', 40),
  ('30000000-0000-4000-8000-000000000002', 'Ônibus 2', 40)
on conflict (id) do nothing;

insert into public.assentos (onibus_id, numero)
select bus.id, seat.numero
from (
  values
    ('30000000-0000-4000-8000-000000000001'::uuid),
    ('30000000-0000-4000-8000-000000000002'::uuid)
) as bus(id)
cross join generate_series(1, 40) as seat(numero)
on conflict (onibus_id, numero) do nothing;
