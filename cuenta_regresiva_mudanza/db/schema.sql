create extension if not exists pgcrypto;

create table if not exists app_users (
    id uuid primary key default gen_random_uuid()
    ,email text not null unique
    ,display_name text not null
    ,role text not null default 'admin' check (role in ('admin', 'member'))
    ,active boolean not null default true
    ,created_at timestamptz not null default now()
    ,updated_at timestamptz not null default now()
);

create table if not exists move_projects (
    id uuid primary key default gen_random_uuid()
    ,name text not null
    ,slug text not null unique
    ,starts_at timestamptz not null
    ,moves_at timestamptz not null
    ,created_by uuid references app_users(id) on delete set null
    ,created_at timestamptz not null default now()
    ,updated_at timestamptz not null default now()
);

create table if not exists task_categories (
    id uuid primary key default gen_random_uuid()
    ,project_id uuid not null references move_projects(id) on delete cascade
    ,code text not null
    ,name text not null
    ,sort_order integer not null default 0
    ,created_at timestamptz not null default now()
    ,unique (project_id, code)
);

create table if not exists move_tasks (
    id uuid primary key default gen_random_uuid()
    ,project_id uuid not null references move_projects(id) on delete cascade
    ,category_id uuid not null references task_categories(id) on delete restrict
    ,title text not null
    ,detail text not null default ''
    ,completed boolean not null default false
    ,sort_order integer not null default 0
    ,created_by uuid references app_users(id) on delete set null
    ,assignee_id uuid references app_users(id) on delete set null
    ,updated_by uuid references app_users(id) on delete set null
    ,completed_by uuid references app_users(id) on delete set null
    ,completed_at timestamptz
    ,created_at timestamptz not null default now()
    ,updated_at timestamptz not null default now()
);

create table if not exists move_recipients (
    id uuid primary key default gen_random_uuid()
    ,project_id uuid not null references move_projects(id) on delete cascade
    ,user_id uuid references app_users(id) on delete set null
    ,name text not null
    ,email text not null
    ,active boolean not null default true
    ,created_at timestamptz not null default now()
    ,unique (project_id, email)
);

create table if not exists email_delivery_logs (
    id uuid primary key default gen_random_uuid()
    ,project_id uuid not null references move_projects(id) on delete cascade
    ,recipient_id uuid references move_recipients(id) on delete set null
    ,subject text not null
    ,status text not null check (status in ('sent', 'skipped', 'failed'))
    ,error_message text
    ,created_at timestamptz not null default now()
);

create index if not exists idx_move_tasks_project_id on move_tasks(project_id);
create index if not exists idx_move_tasks_category_id on move_tasks(category_id);
create index if not exists idx_move_tasks_completed on move_tasks(completed);
create index if not exists idx_move_tasks_assignee_id on move_tasks(assignee_id);
create index if not exists idx_move_recipients_project_id on move_recipients(project_id);

insert into app_users (email, display_name, role)
values
    ('admin@mudanza.local', 'Admin Mudanza', 'admin')
on conflict (email) do nothing;

insert into move_projects (name, slug, starts_at, moves_at, created_by)
select
    'Mudanza nuevo apartamento'
    ,'mudanza-2026'
    ,'2026-06-14T00:00:00-06:00'
    ,'2026-06-27T08:00:00-06:00'
    ,app_users.id
from app_users
where app_users.email = 'admin@mudanza.local'
on conflict (slug) do nothing;

insert into task_categories (project_id, code, name, sort_order)
select
    move_projects.id
    ,category.code
    ,category.name
    ,category.sort_order
from move_projects
cross join (
    values
        ('currentApartment', 'Apartamento actual', 10)
        ,('newApartment', 'Nuevo apartamento', 20)
        ,('logistics', 'Logistica', 30)
) as category(code, name, sort_order)
where move_projects.slug = 'mudanza-2026'
on conflict (project_id, code) do nothing;
