# Vocational Institute of Sulaimanyah — Website (v2)

Bilingual (English / Kurdish Sorani) website and portals with five sections:

1. **Public website** (`index.html`, `program.html`) — editable bilingual site content, programs with shareable department pages,
   events calendar, photo gallery, admissions FAQs, news, contact form, and WhatsApp chat when configured.
2. **Certificate verification** (`verify.html`) — anyone can verify a certificate code (public).
3. **Student portal** (`student.html`) — profile with stage and class, grades, PDF transcript download, personal attendance calendar and class attendance history,
  weekly and exam timetable, published exam-result PDFs, assignments and file submissions, course materials,
  **certificate PDF download**, **notifications**, announcements, AI study helper, **dark mode**.
4. **Teacher portal** (`teacher.html`) — teacher overview, assigned/shared student roster, class attendance sheets with student status, times and signatures that save to student records and return to the attendance review page,
  assignments, private handbook downloads, quick links to teaching tools, announcements, AI helper and dark mode.
5. **Admin panel** (`admin.html`) — staff accounts, students CRUD with **grade editor**, **attendance sheets and attendance marking calendar**,
   **certificate issuing**, posts, **events**, programs, **gallery uploads**, **notifications**,
  **contact-message inbox**, one **Website Editor** for public content, social links, **CSV exports** (students / grades / attendance / messages),
  approved student sharing, timetable management, targeted assignments, course materials, submission review,
  expanded program details, private student downloads, PDF exam-result publishing, JSON backup and restore,
  and analytics configuration.

Owners create and manage staff sign-in accounts in **Staff Accounts**. Available staff roles are **teacher**, **admin**, and **website editor** (the owner role is reserved for the first account). Teachers use the teaching tools; website editors can update public-facing content without access to student administration. Staff sign in through the staff login tab.

Student profiles include a class name and stages 1–5. Teachers prepare a class sheet from their assigned students; submitting it saves attendance to each student's profile and opens **Attendance records**. Students can see their own calendar and submitted class attendance history.

### Website editing and exam results

- Use **Website Editor** for bilingual site name, hero and about text, reasons to choose the institute, FAQs,
  programs, news, events, timetable, gallery, notifications, contact details and analytics settings.
- Add bilingual course topics, program duration, certificates and potential career paths under **Programs**.
  Confirm official durations, credentials and career requirements with the institute before publishing.
- Set **Social Links → WhatsApp** to an official `https://wa.me/<phone>` or
  `https://api.whatsapp.com/send?phone=<phone>` link to enable the direct chat button.
- Add confirmed English and Kurdish office hours in **Website Editor**.
- Admins upload student exam results as PDF files under **Exam results**. Supabase files are private and limited to 10 MB; demo mode stores them in the current browser and limits them to 200 KB. Students can download their published result PDFs from the student portal.
- Use **Handbooks & downloads** to upload private institute PDFs for signed-in students. Supabase files are limited to 10 MB; demo mode files are limited to 200 KB.
- Use **Backup / restore** as the owner to export/import application records. Backups contain student and institute data and must be stored securely. They do not include Supabase Auth accounts or files in Supabase Storage. Restore is owner-only and replaces the application records.

## Two modes

- **Demo mode** (default): works instantly when you open `index.html`, data stored in the browser only.
  A badge on the login/admin pages shows which mode is active.
- **Supabase mode**: real accounts and shared data on every device. Deploy the included database migration and Edge Functions before using real student data.

## Supabase Setup and GitHub Pages Deployment

1. Create a project at https://supabase.com/dashboard and enable **Authentication → Providers → Email**.
2. In **Project Settings → API**, copy the project URL and the **anon/public** key into `js/supabase-config.js`. Never put the service-role key in the website or repository; row-level security protects the public key.
3. Install Node.js 20 or newer and use the Supabase CLI. From this folder run `npx supabase login`, `npx supabase link --project-ref YOUR_PROJECT_REF`, and `npx supabase db push`. **Before pushing the redesign migration to an existing project, export a backup:** it permanently removes legacy payment and branch records, graduate-story posts, fee/branch fields and old exam results that do not reference an uploaded PDF.
4. Deploy the Edge Functions: `setup-owner`, `create-account`, `request-student-access`, `get-submission-download`, `restore-application-backup`, `send-student-password-reset`, `ask-tutor`, `notify-students`, `student-signup`, `manage-student-signup`, and `send-student-message`. Run `npx supabase functions deploy FUNCTION_NAME` for each.
5. In **Project Settings → Edge Functions → Secrets**, set `GEMINI_API_KEY` for the AI helper. For SMS/WhatsApp, set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (E.164 format), `TWILIO_WHATSAPP_FROM` (for example `whatsapp:+15551234567`), `TWILIO_WHATSAPP_OTP_TEMPLATE_SID`, `TWILIO_WHATSAPP_TEMPLATE_SID`, and a strong random `SIGNUP_OTP_SECRET`. `TWILIO_WHATSAPP_OTP_TEMPLATE_SID` must be an approved template containing a single `{{1}}` variable for the code; `TWILIO_WHATSAPP_TEMPLATE_SID` must be an approved message template with a single `{{1}}` variable for the message. Keep credentials in Supabase secrets, never in this repository.
6. For email notifications or password-reset email, also set `RESEND_API_KEY` and `EMAIL_FROM`. Set a separate strong random `VIS_NOTIFICATION_WEBHOOK_SECRET`, then in **Database → Webhooks** create POST webhooks for `public.app_records` INSERT and UPDATE events to the `notify-students` Edge Function URL, with the `x-vis-webhook-secret` header set to that same value.
7. In Supabase **Authentication → URL Configuration**, allow your GitHub Pages URL (for example `https://OWNER.github.io/REPOSITORY/**`) and any custom domain.
8. Create the first owner account from the app’s staff login tab. Students can then register with a required phone number and optional email; the phone code is sent by SMS and WhatsApp. Review and approve verified applications in **Admin → Students** before students can sign in.
9. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Configure `js/supabase-config.js` with your Supabase project URL and anon/public key before publishing; the workflow refuses to deploy while its placeholder values remain. Push to the `main` branch (or run the workflow manually) to publish the static site. The workflow deploys only the website files, not the Supabase functions, migrations, or this README; deploy the Supabase backend separately.
10. Student signup requires explicit consent for SMS and WhatsApp alerts. Teachers can message their assigned, opted-in students from the teacher portal; institute announcements and grade alerts use the configured notification webhook. Email remains optional.
11. In **Website Editor**, enter the Google Analytics measurement ID (`G-…`). Analytics stays disabled until visitors accept the consent prompt. GitHub Pages supports custom domains in repository **Settings → Pages**.
12. The public site can be installed as a PWA after HTTPS hosting. Private student/admin pages and student data are not cached for offline use. Website HTML, CSS, and JavaScript must be delivered to visitors and can be inspected; never put passwords, service-role keys, or other secrets in those files. The Supabase anon/public key is intended to be public and must be protected by correctly configured database policies.

Supabase Edge Functions and Gemini may incur usage costs. The AI helper sends the typed prompt plus relevant course-material notes to Gemini, not student profile data, and allows up to 30 requests per account per day. Never commit provider keys. Existing Firebase Auth accounts, records, and files are not migrated automatically. Firebase JSON backups cannot be restored directly because account IDs differ; plan and verify an identity/data migration before switching a live institute.

### Notes for Supabase mode
- Exam results and handbooks are stored as private PDFs in Supabase Storage (maximum 10 MB); demo mode stores files in the current browser and limits them to 200 KB. Teachers can add, edit, and remove the resources they created.
- Students log in with their **username**; the system maps it to a synthetic email for Supabase Auth.
- Signup phone numbers must be entered in E.164 international format (for example `+964…`). Phone verification creates a pending account; an owner or admin must approve it before the student record is activated.
- Signup codes expire after 10 minutes; requests are limited to one per minute and five per phone per hour, with five code attempts per code.
- Activate Twilio by adding a paid SMS-capable sender and an approved WhatsApp Business sender/content templates in Twilio, then copying their account details and template SIDs into Supabase Edge Function secrets. WhatsApp Sandbox senders are only for testing and require each test recipient to join the sandbox. Twilio and WhatsApp messaging can incur charges.
- Teachers log in with the **username + password** created by the owner; the owner logs in with their **email + separate password**.
- Teachers see their assigned students. Other teachers' student records are read-only and appear only after the owning teacher approves a request.
- The AI helper is available to signed-in students and staff after deploying Edge Functions and configuring the Gemini secret.
- AI answers use the text in matching course materials as context; add notes or lab instructions in **Assignments & Materials**.
- Students can submit text or files up to 2 MB in Supabase mode (200 KB in local demo mode). Teachers review submissions in the assignment list.
- Assignment submissions are checked against the assignment's department, stage, and due time by database policies; private files are served with short-lived signed download links.
- Manage existing student profiles from **Students → Edit** without removing the account. Owners can edit staff display names and roles from **Staff Accounts → Edit**; sign-in usernames stay unchanged.
- Password resets: use **Reset PW** on a student (sends a recovery link if the student has a real
  email address and Resend is configured), or manage the account in Supabase **Authentication → Users**.

## Running locally

Open `index.html` directly, or serve the folder for best results:
`python -m http.server` then visit http://localhost:8000

## Default demo logins (demo mode)

| Role         | Tab             | Credentials                                                   |
|--------------|-----------------|---------------------------------------------------------------|
| Owner        | Staff           | `visinstitute@gmail.com` / `Visinstitutesuli1`                |
| Demo student | Student         | `ali.kareem` / `student123` (delete after testing)            |
