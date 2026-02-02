create table results (
  id uuid default gen_random_uuid() primary key,
  handle text unique not null check (handle ~ '^[a-z0-9_-]{3,39}$'),
  probe_result jsonb not null,
  submission_token text not null,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_results_handle on results (handle);
