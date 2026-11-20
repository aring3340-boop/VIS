# Vocational Institute of Sulaimanyah

A bilingual English and Kurdish Sorani institute website with student, teacher, and admin portals. The application runs locally and stores its records in the current browser.

## Free online deployment

The static website is deployed with GitHub Pages at <https://aring3340-boop.github.io/VIS/>. The workflow in `.github/workflows/deploy-pages.yml` publishes the site when changes are pushed to `main`. In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The live website and its cloud services are separate:

1. Use the active Supabase project and its publishable/anon key in `js/supabase-config.js`. Do not use a service-role key in the browser.
2. Deploy the Edge Functions. For the GitHub Actions workflow, add `SUPABASE_ACCESS_TOKEN` (from Supabase account access tokens) as a repository secret under **Settings → Secrets and variables → Actions**, then run **Actions → Deploy Supabase backend → Run workflow**. The workflow skips database migrations by default because they have already been applied; select **apply_migrations** only when needed, and add `SUPABASE_DB_PASSWORD` as a repository secret first. Alternatively, install and authenticate the Supabase CLI and run:

   ```text
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase functions deploy
   ```

3. For automatic email grade and announcement alerts, configure `RESEND_API_KEY`, `EMAIL_FROM`, and `VIS_NOTIFICATION_WEBHOOK_SECRET` as Supabase Edge Function secrets.

   In the Supabase Dashboard, open **Project Settings → Edge Functions → Secrets** (wording may vary by dashboard version), add those secrets, and save. Create Supabase Database Webhooks for `app_records` inserts and updates, set the `x-vis-webhook-secret` header to the same webhook secret, and point them to `https://<project-ref>.supabase.co/functions/v1/notify-students`.
4. In Supabase Auth URL settings, add the GitHub Pages URL as an allowed site/redirect URL. Test sign-in and password recovery using accounts created by institute staff.

The GitHub Pages workflow publishes only the static website; it does not deploy database migrations or Edge Functions. Do not put a Supabase service-role key or provider credentials in `js/supabase-config.js`, GitHub Pages files, or any public commit. The website can be hosted free.

## Run locally

From this folder, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. Serving the folder lets the app cache its pages and assets for later offline use. The first visit must happen while the local server is running.

## Production data and security

- Records, settings, and uploaded files are stored in Supabase.
- Staff accounts and student accounts use Supabase Auth.
- On or after June 25 each year, admins can review grades, select students who passed, and approve those promotions together. Students without recorded grades require an admin decision, and promotion stops at stage 5.
- Managers can assign a student to multiple teacher accounts. Apply the latest Supabase migration with `supabase db push` (or the deployment workflow's **apply_migrations** option) before using this feature.
- Use **Backup / restore** to export or restore an authorized backup. Keep backups private because they contain student and institute data.
- PDF uploads use the limits configured by the Supabase Storage buckets and Edge Functions.
- Certificate and transcript documents use the browser's print dialog; choose its save-as-PDF option if you need a PDF file.
