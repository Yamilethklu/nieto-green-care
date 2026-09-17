# Supabase setup

1. Create a Supabase project in the intended production region.
2. Copy Project URL and the current **publishable key** into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Older projects may label the public key `anon`; it is compatible with the installed SDK. Add the service-role key only to the server environment.
3. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor, then `supabase/seed.sql`. Prefer the Supabase CLI migration workflow for ongoing production changes.
4. In Authentication, enable email/password. Configure Site URL and allowed redirect URLs for local and production hosts.
5. Create `nietogreencare@gmail.com` manually in Auth with a strong password delivered securely. Insert its Auth UUID: `insert into public.admin_profiles(user_id) values ('AUTH-USER-UUID');`. Never put that password in source control.
6. The migration creates the public `gallery` bucket with a 5 MB limit and JPEG/PNG/WebP allowlist. Uploads require an authenticated admin; metadata should include truthful alt text and approved captions.
7. Verify RLS is enabled. Anonymous SQL clients should read active services/areas and published gallery items, but must not access leads, pricing, settings, or admin profiles. Public lead creation goes through the server service-role route—not a permissive insert policy.
8. Test a quote, verify lead and normalized identifiers, update status to `completed`, and confirm `completed_at`; move it back and confirm the timestamp clears. Inspect `customer_service_metrics` as an admin.
9. For production, rotate exposed credentials, enable MFA for administrators, review Auth audit logs, configure backups, apply migrations through CI, and confirm production redirect URLs.

Customer metrics group requests by normalized lowercase email when present, otherwise by the final ten phone digits. Shared contact details will therefore be treated as one customer and should be reviewed operationally.
