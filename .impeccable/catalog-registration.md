# Catalog registration

The public catalog supports cumulative AND filters grouped by movement, glass, style, materials, water resistance and features. Explicit tags on new entries override legacy inference. Custom tags also become filters.

Registration is available only when the signed-in user's trusted `app_metadata.catalog_admin` is true. Set this through the Supabase admin API or dashboard for a verified owner account; never use editable user_metadata. The user must sign in again after the role changes.

Migration `20260913010000_catalog_registration.sql` adds tags/specifications, a transactional registration RPC, and admin-only row/storage policies. The migration is applied to the linked project. Anonymous RPC execution was verified to fail with 42501.

Photos accept JPEG/PNG/WebP up to 5 MB each, eight total, or HTTP(S) image URLs. Files upload into the administrator's UUID folder. Failed RPC calls attempt to clean up uploaded objects. Watch and image rows commit in one database transaction. The first image is the cover. No private key is shipped to the browser.

Validation: production build; 18 Playwright tests including cumulative filters and admin form retry. Form submission tests mock remote writes and do not create production catalog entries. The owner's administrator email is still required before enabling their account.
