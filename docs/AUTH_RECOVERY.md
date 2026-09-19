# Recuperación de contraseña del panel

El formulario de `/admin/login` solicita el correo de recuperación y redirige mediante `/auth/callback` a `/admin/reset-password`. Después de guardar la contraseña, el usuario llega a `/admin`.

Configura en Supabase Authentication > URL Configuration:

- Site URL: `https://nieto-green-care.vercel.app`
- `https://nieto-green-care.vercel.app/auth/callback`
- `https://nieto-green-care.vercel.app/admin/reset-password`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/admin/reset-password`

La ruta `/admin` existe en `app/admin/(dashboard)/page.tsx` y está protegida por `requireAdmin`. El usuario debe existir en Auth y también en `public.admin_profiles`.
