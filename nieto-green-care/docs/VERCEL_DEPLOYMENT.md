# Vercel deployment

1. Import the repository in Vercel and keep the Next.js defaults.
2. Add every `.env.example` variable to Preview/Production. Use the production URL (currently provisional `https://proyecjardin.vercel.app`, later the confirmed domain) for `NEXT_PUBLIC_APP_URL` with no trailing slash.
3. Keep the Supabase service role and Resend API key encrypted and server-only. Set `EMAIL_FROM` to `Nieto Green Care <onboarding@resend.dev>` for permitted development tests or a verified-domain sender in production.
4. Deploy and test public pages, quote save, authentication, gallery delivery, sitemap, and robots.
5. Add a custom domain in Vercel only after ownership is confirmed. Configure DNS at the registrar using Vercel's displayed records; no DNS is managed in this repository. Update Supabase Auth redirects and `NEXT_PUBLIC_APP_URL`, then redeploy.
6. Add analytics later through a consent-aware component and environment ID. No Google Analytics, Search Console, Meta Pixel, or fabricated ID is currently loaded.

Nominatim and Esri are external services with their own attribution, availability, and usage policies. For material volume, choose a contracted geocoder/tile provider and update the centralized adapter/configuration.
