-- Run once in Supabase SQL editor so CMS can show/hide reviews on the website.
alter table public.reviews
  add column if not exists is_visible boolean not null default true;

comment on column public.reviews.is_visible is 'When false, review is hidden from the public site.';

-- After adding the column, existing rows get default true. Example insert shape:
-- insert into public.reviews (customer_name, customer_subtitle, rating, review_text, is_featured, is_visible)
-- values ('Name', 'Role', 5, 'Text…', true, true);
