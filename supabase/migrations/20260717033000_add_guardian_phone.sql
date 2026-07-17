begin;

alter table public.responsaveis
  add column if not exists telefone text null;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'responsaveis_telefone_tamanho'
       and conrelid = 'public.responsaveis'::regclass
  ) then
    alter table public.responsaveis
      add constraint responsaveis_telefone_tamanho
      check (
        telefone is null
        or char_length(btrim(telefone)) between 7 and 40
      );
  end if;
end;
$$;

comment on column public.responsaveis.telefone is
  'Telefone de contato do responsável, quando informado pela escola.';

commit;
