-- 0015_storage_buckets.sql
-- Public read-only buckets referenced by lib/utilities/storage.ts. Writes are
-- restricted to admin/staff via storage.objects RLS policies (Storage's own
-- RLS system, separate from the public schema policies in 0014).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_bucket_staff_write" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "product_images_bucket_staff_update" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "product_images_bucket_staff_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );

create policy "gallery_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'gallery-images');
create policy "gallery_images_bucket_staff_write" on storage.objects
  for insert with check (
    bucket_id = 'gallery-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "gallery_images_bucket_staff_update" on storage.objects
  for update using (
    bucket_id = 'gallery-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );
create policy "gallery_images_bucket_staff_delete" on storage.objects
  for delete using (
    bucket_id = 'gallery-images' and public.has_any_role(array['admin','staff']::public.user_role[])
  );
