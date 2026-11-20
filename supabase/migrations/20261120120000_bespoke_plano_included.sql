-- 20.11.2026: every Bespoke frame ships with clear Plano (demo) lenses - the
-- atelier aligns and bends the front with lenses in. Plano becomes free and the
-- default; "No lenses - frame only" is no longer sold (create-bespoke-checkout
-- rejects lens id "none"). Blue Light keeps its price.
update public.bespoke_pricing
   set amount_usd = 0,
       label = 'Plano - clear, no correction (included)',
       updated_at = now()
 where key = 'lens:plano';

delete from public.bespoke_pricing where key = 'lens:none';
