create policy "Users can upload their own profile avatar"
on storage.objects for insert
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own profile avatar"
on storage.objects for update
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own profile avatar"
on storage.objects for delete
using (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
