create policy "Users can upload their own verification selfies"
on storage.objects for insert
with check (
  bucket_id = 'verification-selfies'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own verification selfies"
on storage.objects for select
using (
  bucket_id = 'verification-selfies'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

create policy "Users can update their own verification selfies"
on storage.objects for update
using (
  bucket_id = 'verification-selfies'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'verification-selfies'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own verification documents"
on storage.objects for insert
with check (
  bucket_id = 'verification-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own verification documents"
on storage.objects for select
using (
  bucket_id = 'verification-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);

create policy "Users can update their own verification documents"
on storage.objects for update
using (
  bucket_id = 'verification-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'verification-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);
