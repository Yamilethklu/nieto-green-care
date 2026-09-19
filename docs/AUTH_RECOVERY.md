# Supabase password recovery

The password recovery flow must redirect to `/auth/callback?next=/admin/reset-password`, where the one-time Supabase code is exchanged for a session. The reset page then calls `auth.updateUser({ password })` and redirects to `/admin`.

Configure these Supabase Authentication URL values for production:

- Site URL: `https://nieto-green-care.vercel.app`
- Redirect URL: `https://nieto-green-care.vercel.app/auth/callback`
- Redirect URL: `https://nieto-green-care.vercel.app/admin/reset-password`

Also keep the local equivalents while developing:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/admin/reset-password`

The recovery email must be requested from `/admin/login`; do not use a generic dashboard reset link if it redirects to the site root.
