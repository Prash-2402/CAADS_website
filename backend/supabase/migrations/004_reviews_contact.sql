-- ============================================================
-- CAADS Platform — Reviews and Contact Messages Schema
-- ============================================================

-- ============================================================
-- reviews
-- ============================================================
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null, -- nullable for anonymous reviews
  message     text not null,
  rating      int check (rating >= 1 and rating <= 5),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- contact_messages
-- ============================================================
create table contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_reviews_created_at on reviews(created_at desc);
create index idx_contact_messages_created_at on contact_messages(created_at desc);

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table reviews enable row level security;
alter table contact_messages enable row level security;

-- reviews: anyone can insert, only leaders/admins can view
create policy "Anyone can insert reviews"
  on reviews for insert
  with check (true);

create policy "Leaders and admins can view reviews"
  on reviews for select
  using (is_leader());

-- contact_messages: anyone can insert, only leaders/admins can view
create policy "Anyone can insert contact messages"
  on contact_messages for insert
  with check (true);

create policy "Leaders and admins can view contact messages"
  on contact_messages for select
  using (is_leader());
