-- Create Leads Table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null unique
);

-- Create Interactions Table
create table public.interactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lead_id uuid references public.leads(id) not null,
  question text not null,
  answer text,
  intent text, -- 'HIGH', 'MEDIUM', 'LOW'
  status text, -- 'ANSWERED', 'UNANSWERED'
  timestamp text
);

-- Enable Row Level Security (RLS) is recommended but we will leave policies open for this demo
alter table public.leads enable row level security;
alter table public.interactions enable row level security;

-- Create policies to allow public access (WARNING: For demo/local use only. Lock down in production)
create policy "Allow public access to leads" on public.leads for all using (true) with check (true);
create policy "Allow public access to interactions" on public.interactions for all using (true) with check (true);
