-- Straight-on front renders for the Bespoke review step (step 6).
-- Front renders share bespoke_render_cache with the 3/4 renders; their
-- selection_key ends in "|front" and this column labels them for the admin.
alter table public.bespoke_render_cache
  add column if not exists view text not null default 'angle';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bespoke_render_cache_view_check'
  ) then
    alter table public.bespoke_render_cache
      add constraint bespoke_render_cache_view_check check (view in ('angle', 'front'));
  end if;
end $$;

comment on column public.bespoke_render_cache.view is
  'angle = 3/4 catalogue render (default); front = straight-on front view shown in the review step.';
