create table comparisons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null check (code ~ '^[a-z0-9]{6}$'),
  handle_a text not null references results(handle),
  handle_b text references results(handle),
  created_at timestamptz default now(),
  joined_at timestamptz
);
create index idx_comparisons_code on comparisons (code);
