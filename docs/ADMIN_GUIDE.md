# Admin guide

Visit `/admin/login` and use the Supabase Auth account authorized in `admin_profiles`. Logout when working on a shared device.

- **Overview / Leads:** monitor genuine requests and status. `completed` automatically timestamps completion; changing away clears it.
- **Services:** maintain bilingual names/descriptions, active/featured state, order, and starting price. Zero means Custom Quote.
- **Pricing:** create non-overlapping square-foot ranges per service and frequency. Minimum must be nonnegative, maximum must not be below minimum, and price must be positive. Test boundaries after changes.
- **Service Areas:** publish only confirmed cities and genuinely distinct local content.
- **Gallery:** upload only authorized real work as JPEG, PNG, or WebP up to 5 MB; add meaningful alt text and bilingual captions before publishing.
- **Customers:** grouped by normalized email, falling back to phone; verify possible shared contacts manually.
- **QR Code:** verify `NEXT_PUBLIC_APP_URL`, then download the high-error-correction PNG for print.
- **Settings:** reserve unconfirmed facts (hours, history, credentials) until business review.

The initial dashboard provides secure database-backed operational views. Complex mutations should be made through Supabase Studio under an admin account until dedicated reviewed forms are enabled; RLS remains enforced. Confirm destructive actions and retain backups.
