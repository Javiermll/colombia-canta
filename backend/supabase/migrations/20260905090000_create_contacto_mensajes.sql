create table contacto_mensajes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  mensaje text not null,
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);

alter table contacto_mensajes enable row level security;

grant select, insert, update, delete on table contacto_mensajes to service_role;
