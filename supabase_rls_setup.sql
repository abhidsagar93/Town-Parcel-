-- ============================================================
-- Town Parcel — Supabase RLS Setup
-- Run this once in Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- This enables Row Level Security on all 4 tables and adds
-- policies that allow the PUBLIC (anon key) to INSERT ONLY.
-- No public SELECT, UPDATE, or DELETE is created, so the
-- anon key used on the website cannot read, edit, or delete
-- any submitted data.
-- ============================================================

-- 1. customer_bookings
alter table public.customer_bookings enable row level security;

drop policy if exists "Allow public insert on customer_bookings" on public.customer_bookings;
create policy "Allow public insert on customer_bookings"
  on public.customer_bookings
  for insert
  to anon
  with check (true);

-- 2. partner_registrations
alter table public.partner_registrations enable row level security;

drop policy if exists "Allow public insert on partner_registrations" on public.partner_registrations;
create policy "Allow public insert on partner_registrations"
  on public.partner_registrations
  for insert
  to anon
  with check (true);

-- 3. rider_registrations
alter table public.rider_registrations enable row level security;

drop policy if exists "Allow public insert on rider_registrations" on public.rider_registrations;
create policy "Allow public insert on rider_registrations"
  on public.rider_registrations
  for insert
  to anon
  with check (true);

-- 4. contact_messages
alter table public.contact_messages enable row level security;

drop policy if exists "Allow public insert on contact_messages" on public.contact_messages;
create policy "Allow public insert on contact_messages"
  on public.contact_messages
  for insert
  to anon
  with check (true);

-- ============================================================
-- ADMIN DASHBOARD ACCESS
-- ============================================================
-- The admin panel (in /admin) signs in with Supabase Auth and
-- needs to SELECT, UPDATE, and DELETE rows — but only when
-- logged in. These policies grant that access to the
-- "authenticated" role only. The public "anon" role used by
-- the website still cannot read, edit, or delete anything.
-- ============================================================

-- customer_bookings
drop policy if exists "Allow authenticated select on customer_bookings" on public.customer_bookings;
create policy "Allow authenticated select on customer_bookings"
  on public.customer_bookings for select to authenticated using (true);

drop policy if exists "Allow authenticated update on customer_bookings" on public.customer_bookings;
create policy "Allow authenticated update on customer_bookings"
  on public.customer_bookings for update to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated delete on customer_bookings" on public.customer_bookings;
create policy "Allow authenticated delete on customer_bookings"
  on public.customer_bookings for delete to authenticated using (true);

-- partner_registrations
drop policy if exists "Allow authenticated select on partner_registrations" on public.partner_registrations;
create policy "Allow authenticated select on partner_registrations"
  on public.partner_registrations for select to authenticated using (true);

drop policy if exists "Allow authenticated update on partner_registrations" on public.partner_registrations;
create policy "Allow authenticated update on partner_registrations"
  on public.partner_registrations for update to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated delete on partner_registrations" on public.partner_registrations;
create policy "Allow authenticated delete on partner_registrations"
  on public.partner_registrations for delete to authenticated using (true);

-- rider_registrations
drop policy if exists "Allow authenticated select on rider_registrations" on public.rider_registrations;
create policy "Allow authenticated select on rider_registrations"
  on public.rider_registrations for select to authenticated using (true);

drop policy if exists "Allow authenticated update on rider_registrations" on public.rider_registrations;
create policy "Allow authenticated update on rider_registrations"
  on public.rider_registrations for update to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated delete on rider_registrations" on public.rider_registrations;
create policy "Allow authenticated delete on rider_registrations"
  on public.rider_registrations for delete to authenticated using (true);

-- contact_messages
drop policy if exists "Allow authenticated select on contact_messages" on public.contact_messages;
create policy "Allow authenticated select on contact_messages"
  on public.contact_messages for select to authenticated using (true);

drop policy if exists "Allow authenticated update on contact_messages" on public.contact_messages;
create policy "Allow authenticated update on contact_messages"
  on public.contact_messages for update to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated delete on contact_messages" on public.contact_messages;
create policy "Allow authenticated delete on contact_messages"
  on public.contact_messages for delete to authenticated using (true);

-- ============================================================
-- Column mapping used by the website's JavaScript (confirmed
-- against your actual table schemas)
-- ============================================================
-- customer_bookings:
--   booking_id, shop_name, shop_address, shop_phone,
--   customer_name, customer_phone, delivery_address,
--   pickup_item, item_quantity, item_value (numeric),
--   payment_status, payment_method, notes, booking_status
--
-- partner_registrations:
--   partner_id, business_name, owner_name, mobile, whatsapp,
--   email, business_type, business_address, area, city,
--   pincode, remarks, status
--   (daily orders / working hours are folded into "remarks"
--   since your table doesn't have dedicated columns for them)
--
-- rider_registrations:
--   rider_id, full_name, mobile, whatsapp, email,
--   date_of_birth, gender, address, city, pincode,
--   service_area, vehicle_type, vehicle_number,
--   driving_license_number, aadhar_number,
--   emergency_conntact_number, remarks, status
--   (availability, prior experience, emergency contact name,
--   and reason for joining are folded into "remarks")
--
-- contact_messages:
--   message_id, full_name, mobile, email, message, status
-- ============================================================
