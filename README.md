# Vocational Institute of Sulaimanyah

A bilingual English and Kurdish Sorani institute website with student, teacher, and admin portals. The application runs locally and stores its records in the current browser.

## Free online deployment

The static website is deployed with GitHub Pages at <https://aring3340-boop.github.io/VIS/>. The workflow in `.github/workflows/deploy-pages.yml` publishes the site when changes are pushed to `main`. In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The live website and its cloud services are separate:

1. Use the active Supabase project and its publishable/anon key in `js/supabase-config.js`. Do not use a service-role key in the browser.
2. Deploy the database migrations and Edge Functions. For the GitHub Actions workflow, first add `SUPABASE_ACCESS_TOKEN` (from Supabase account access tokens) and `SUPABASE_DB_PASSWORD` as repository secrets under **Settings → Secrets and variables → Actions**. Then run **Actions → Deploy Supabase backend → Run workflow**. Alternatively, install and authenticate the Supabase CLI and run:

   ```text
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase functions deploy
   ```

3. Configure the Edge Function secrets in Supabase, not in browser JavaScript or the repository: `SIGNUP_OTP_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_WHATSAPP_FROM`, and the approved `TWILIO_WHATSAPP_OTP_TEMPLATE_SID` / `TWILIO_WHATSAPP_TEMPLATE_SID`. The SMS and WhatsApp channels require a configured Twilio account and may incur charges.
4. In Supabase Auth URL settings, add the GitHub Pages URL as an allowed site/redirect URL. Test signup using a real phone you control, confirm both verification messages arrive, and verify that the application remains pending until approved by an administrator.

The GitHub Pages workflow publishes only the static website; it does not deploy database migrations or Edge Functions. Do not put a Supabase service-role key or Twilio credentials in `js/supabase-config.js`, GitHub Pages files, or any public commit. The website can be hosted free, but real SMS and WhatsApp delivery is not guaranteed to be free.

## Run locally

From this folder, run:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. Serving the folder lets the app cache its pages and assets for later offline use. The first visit must happen while the local server is running.

## Demo accounts

| Role | Sign-in tab | Username or email | Password |
|---|---|---|---|
| Owner | Staff | `visinstitute@gmail.com` | `Visinstitutesuli1` |
| Student | Student | `ali.kareem` | `student123` |
| Student | Student | `sara.ahmed` | `student123` |

The owner can create local teacher and admin accounts from **Staff Accounts**. Students are managed locally in **Students**.

## Local data and offline behavior

- Records, settings, and uploaded files are stored in browser storage on this device. They are not shared or synchronized with other devices.
- Use **Backup / restore** to export or restore a JSON backup. Keep backups private because they contain student and institute data.
- Uploaded handbooks and exam PDFs are limited to 200 KB. Assignment attachments are also stored in the browser.
- Certificate and transcript documents use the browser's print dialog; choose its save-as-PDF option if you need a PDF file.
- The app does not send contact forms, notifications, or messages outside this browser. AI assistance, remote account signup, analytics, external fonts, and social/chat integrations are not available.
- Browser storage is not a secure production account system. Use this build for local demonstrations on a trusted device, and do not enter sensitive real-world records.
