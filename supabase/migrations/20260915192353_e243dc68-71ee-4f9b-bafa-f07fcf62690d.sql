create or replace function public.assign_bespoke_case(p_order_id uuid)
returns table (case_no text, case_seq int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq int;
  v_no text;
begin
  select o.case_seq, o.case_no into v_seq, v_no
    from public.bespoke_orders o
   where o.id = p_order_id
     for update;

  if not found then
    return;
  end if;

  if v_no is null or v_seq is null then
    v_seq := coalesce(v_seq, nextval('public.bsp_seq')::int);
    v_no := coalesce(v_no, 'WLT-BSP-' || to_char(now(), 'YYYY') || '-' || lpad(v_seq::text, 4, '0'));
    update public.bespoke_orders
       set case_seq = v_seq, case_no = v_no
     where id = p_order_id;
  end if;

  case_no := v_no;
  case_seq := v_seq;
  return next;
end;
$$;

revoke all on function public.assign_bespoke_case(uuid) from public, anon, authenticated;
grant execute on function public.assign_bespoke_case(uuid) to service_role;