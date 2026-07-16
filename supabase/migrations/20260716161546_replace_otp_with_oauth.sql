begin;

drop function if exists public.incrementar_tentativa_codigo(uuid);
drop table if exists public.codigos_acesso;

commit;
