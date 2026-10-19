
/* ===== translations ===== */
const I18N={
en:{
 home:'Home',about:'About',programs:'Programs',news:'News & Announcements',contact:'Contact',login:'Login',logout:'Logout',
 events:'Events',gallery:'Gallery',verify:'Verify Certificate',
 department_details:'Departments',
 open_department:'View department page',
 program_breadcrumb:'Programs',
 department_page_contact:'Ask Admissions about this program',
 program_not_found:'This department could not be found. Browse all programs to continue.',
 department_details_title:'Explore our departments',
 department_note:'Course outlines and career ideas are illustrative. Confirm the current curriculum, duration, certificates and professional requirements with Admissions.',
 courses:'Course topics',program_duration:'Program duration',certificate_outcome:'Certificate awarded',career_paths:'Potential career paths',
 duration_to_confirm:'Contact Admissions to confirm the current duration.',
 certificate_to_confirm:'Contact Admissions to confirm the certificate awarded.',
 career_note:'Career options depend on the current curriculum and local professional requirements.',
 faqs:'Admissions FAQs',faq_title:'Questions before you apply?',
 faq_q1:'How do I apply?',
 faq_a1:'Contact the institute using the details below to confirm current admissions requirements and available programs.',
 faq_q2:'What are the entry requirements?',
 faq_a2:'Requirements can vary by program and intake. Contact Admissions for the latest official requirements before applying.',
 faq_q3:'How long does a program take, and what certificate will I receive?',
 faq_a3:'Duration and certificate details are confirmed by the institute. See a department below and contact Admissions for the current details.',
 faq_q4:'How can I ask a question quickly?',
 faq_a4:'Use the contact form, call the institute, or message us on WhatsApp when the institute has configured its official WhatsApp link.',
 whatsapp_chat:'Chat with us on WhatsApp',
 instructor_subjects:'Teaching areas',
 resource_title:'Handbooks and downloads',
 resource_note:'Download official institute guides, forms and calendars.',
 resource_private_note:'These files are available only after you sign in as an institute student.',
 resource_empty:'No handbooks or downloads are available yet.',
 resource_open:'Download / open',
 resource_add:'Add handbook or download',
 resource_category:'Category',
 resource_title_en:'Title (English)',
 resource_title_ku:'Title (Kurdish)',
 resource_file:'PDF file',
 resource_file_large:'Choose a PDF up to 10 MB.',
 resource_file_large_demo:'Choose a PDF up to 200 KB in demo mode.',
 resource_pdf_only:'Handbooks must be PDF files.',
 resource_invalid:'Enter a category, at least one title, and a PDF file.',
 resource_saved:'Private student resource saved.',
 resource_cleanup_error:'The handbook was updated, but its previous file could not be removed. Contact an administrator.',
 resource_download_error:'Could not download the file. Sign in as a student and try again.',
 admissions:'Admissions',
 instructors_admin:'Instructors',
 instructor_add:'Add instructor',
 instructor_name_en:'Instructor name (English)',
 instructor_name_ku:'Instructor name (Kurdish)',
 instructor_role_en:'Role / department (English)',
 instructor_role_ku:'Role / department (Kurdish)',
 instructor_bio_en:'Short introduction (English)',
 instructor_bio_ku:'Short introduction (Kurdish)',
 instructor_photo:'Photo URL (optional; use an approved institute photo)',
 instructor_consent:'Confirm the instructor has approved this public introduction.',
 instructor_consent_required:'Confirm instructor permission before publishing.',
 instructor_saved:'Instructor introduction saved.',
 resources_admin:'Handbooks & downloads',
 resources_format:'Add a handbook and upload its PDF file.',
 resources_hint:'Handbooks and downloads are private: signed-in institute students and staff can access them. Teachers can add and manage their own PDFs. Supabase PDF limit: 10 MB; demo limit: 200 KB.',
 gallery_photo_note:'Upload institute-approved photographs only and obtain permission before publishing images of people.',
 no_instructors:'No instructors have been added yet.',
 student_projects:'Student projects',
 photo_url_invalid:'Photo URL must use HTTPS.',
 admin_save_error:'Could not save changes. Please check your connection and try again.',
 public_preview_notice:'The live content service is unavailable. This preview uses local sample content; contact messages and changes are currently disabled.',
 admission_ref:'Reference',
 brand_sub:'Vocational Institute of Sulaimanyah',
 hero_kicker:'Accredited Vocational Education · Sulaymaniyah',
 cta_student:'Student Portal',cta_staff:'Staff Login',
 stats_programs:'Vocational Programs',stats_students:'Enrolled Students',stats_trainers:'Expert Trainers',stats_since:'Serving Since',
 about_title:'About the Institute',
 news_title:'News & Announcements',news_empty:'No announcements yet. Please check back soon.',
 events_title:'Events Calendar',no_events:'No upcoming events.',
 gallery_title:'Gallery',no_gallery:'No photos yet.',
 contact_title:'Contact Us',contact_lead:'Have a question about admissions or programs? Reach out and our team will help you.',
 address:'Address',phone:'Phone',email:'Email',office_hours:'Office hours',office_hours_en:'Office hours (English)',office_hours_ku:'Office hours (Kurdish)',follow_us:'Follow Us',
 your_name:'Your Name',your_email:'Your Email',your_phone:'Your Phone (optional)',your_message:'Your Message',
 send:'Send Message',msg_sent:'Message sent. We will contact you soon.',msg_fill:'Please fill in name, email and message.',
 footer_links:'Quick Links',footer_contact:'Contact',
 why_title:'Why Choose VIS',
 why_1:'Hands-on training in modern labs',why_2:'Certified, experienced instructors',
 why_3:'Career & job placement support',why_4:'Recognized vocational certificates',
 login_title:'Sign in to VIS',login_sub:'Use the credentials provided by the institute.',
 student_signup:'Student sign up',signup_approval_note:'Verify your phone by SMS and WhatsApp. Your account remains inactive until an administrator approves your application.',
 whatsapp_alert_consent:'Receive alerts by WhatsApp',
 student_full_name:'Full name',phone_required:'Phone number (required, international format)',email_optional:'Email (optional)',
 signup_messaging_consent:'I agree to receive institute and teacher alerts by SMS and WhatsApp. Message and data rates may apply.',
 signup_code:'6-digit verification code',signup_send_code:'Send code by SMS + WhatsApp',signup_verify:'Verify number and submit application',signup_resend:'Resend verification code',
 signup_code_sent:'A verification code was sent to your phone by SMS and WhatsApp.',signup_pending:'Phone verified. Your application is waiting for administrator approval. You can sign in after it is approved.',
 signup_error:'Could not submit your registration. Please try again.',login_pending:'Your phone is verified, but your student application is still awaiting administrator approval.',
 signup_cloud_required:'Student registration is available when the site is connected to its Supabase service.',
 signup_pending_list:'Applications awaiting approval',
 signup_no_pending:'There are no applications awaiting approval.',signup_refresh:'Refresh applications',signup_approve:'Approve',signup_reject:'Reject',
 signup_approved:'Student account approved.',signup_rejected:'Application rejected.',signup_admin_error:'Could not update the student application.',
 teacher_message_title:'Message students',teacher_message_channel:'Send using',teacher_message_sms:'SMS',teacher_message_whatsapp:'WhatsApp',
 teacher_message_recipients:'Students',teacher_message_body:'Message',teacher_message_send:'Send message',
 teacher_message_no_eligible:'No assigned students have a valid phone number and opted in to this channel.',
 teacher_message_sent:'Message sent. Delivered: {delivered}; skipped: {skipped}.',
 teacher_message_partial:'Some messages failed. Delivered: {delivered}; failed: {failed}; skipped: {skipped}.',
 tab_student:'Student',tab_staff:'Staff',
 username:'Username',staff_login:'Teacher username or owner email',password:'Password',show_password:'Show',hide_password:'Hide',sign_in:'Sign In',back_home:'← Back to website',
 err_creds:'Invalid credentials. Please try again.',err_fill:'Please fill in all required fields.',
 owner_setup:'First-time setup: create the owner account',owner_setup_sub:'This Supabase project has no administrator yet. Create the owner account below — you will sign in with it afterwards.',
 create:'Create Account',
 dash:'Dashboard',students:'Students',posts:'Posts',programs_m:'Programs',content:'Site Content',socials:'Social Links',
 admin_menu:'Open navigation menu',admin_close:'Close navigation menu',
 teacher_students_count:'Assigned students',teacher_upcoming_count:'Upcoming classes & exams',
 attendance_paper:'Class attendance paper',attendance_admin:'Attendance records',attendance_history:'My attendance history',
 class_name:'Class name',number:'No.',student_name:'Student name',attendance_status:'Status',time_in:'Time in',time_out:'Time out',signature:'Signature',existing_stage:'Existing stage',
 submit_attendance:'Submit attendance',attendance_no_students:'No students are assigned for this stage.',attendance_saved:'Attendance was saved. Opening the admin attendance page…',
 attendance_present:'Present',attendance_absent:'Absent',attendance_none:'No attendance has been submitted yet.',attendance_save_error:'Could not save the attendance sheet. Please try again.',
 attendance_sheet:'Attendance sheet',attendance_teacher:'Teacher',attendance_students:'Students',attendance_submitted:'Submitted',
 teacher_portal:'Teacher dashboard',
 teacher_profile:'My profile',teacher_role:'Role',teacher_quick_links:'Teaching workspace',
 teacher_manage_learning:'Manage assignments & materials',teacher_students:'My students',
 teacher_manage_students:'Manage students',teacher_assigned:'Assigned to you',
 teacher_sharing_status:'Access',teacher_shared_readonly:'Shared with you · read only',teacher_no_students:'No students are assigned or shared with you yet.',
 teacher_upcoming:'Upcoming classes & exams',teacher_manage_schedule:'Manage timetable',
 teacher_assignments:'My assignments',teacher_resources:'Handbooks & downloads',
 teacher_manage_resources:'Manage handbooks',teacher_resource_note:'Handbooks are private institute files. Sign in to access them.',
 teacher_accounts:'Staff Accounts',teacher_accounts_hint:'Create teacher sign-in accounts and manage existing teachers.',
 teacher_accounts_empty:'No teacher accounts have been created yet.',
 teacher_account_setup_hint:'Teachers sign in with the username and password you set here.',
 certs:'Certificates',msgs:'Messages',notifs:'Notifications',ev_m:'Events',gal_m:'Gallery',
 admins:'Accounts',account:'My Account',teacher:'Teacher',add_teacher:'Add Teacher',ai_helper:'AI Helper',ai_ask:'Ask AI',ai_placeholder:'Ask a study or teaching question…',ai_error:'AI could not answer. Check Supabase Edge Functions setup and try again.',ai_requires_cloud:'AI is available after Supabase Edge Functions are configured.',owner_exists:'An owner account already exists, or Supabase setup is incomplete.',
 schedule:'Timetable',schedule_title:'Timetable & Exams',add_schedule:'Add class or exam',learning:'Assignments & Materials',assignments:'Assignments',add_assignment:'Add Assignment',materials:'Course Materials',add_material:'Add Material',url_invalid:'Use a link that starts with http:// or https://.',
 event_kind:'Type',class_session:'Class',exam:'Exam',course:'Course / Subject',room:'Room',start_time:'Start time',end_time:'End time',due_date:'Due date',instructions:'Instructions',
 submit_work:'Submit work',submission:'Submission',answer:'Your answer',attachment:'Attach a file',submitted:'Submitted',submitted_ok:'Work submitted.',overdue:'Closed',no_assignments:'No assignments yet.',no_schedule:'No upcoming classes or exams.',no_materials:'No course materials yet.',resource:'Resource link',learning_saved:'Learning item saved.',file_too_large:'Files must be 2 MB or smaller.',file_too_large_demo:'Demo files must be 200 KB or smaller.',file_read_error:'The file could not be read.',
 access_requests:'Student access requests',request_access:'Request access',student_username:'Student username',
 shared_read_only:'Shared · read only',approve:'Approve',request_pending:'Request is already pending.',student_not_found:'No student found with that username, or access cannot be requested.',assigned_teacher:'Assigned teacher',
 share_approved:'Access approved.',share_denied:'Request declined.',request_sent:'Request sent to the student’s teacher.',
 total_students:'Total Students',published_posts:'Published Posts',programs_offered:'Programs Offered',recent_students:'Recently Added Students',
 add_student:'Add Student',search_ph:'Search students…',name_en:'Full Name (English)',name_ku:'Full Name (Kurdish)',
 dept:'Department',stage:'Stage',phone_l:'Phone',dob:'Date of Birth',attendance:'Attendance',grades:'Grades',subject:'Subject',score:'Score',add_grade:'+ Add subject',
 save:'Save',cancel:'Cancel',edit:'Edit',del:'Delete',reset_pw:'Reset PW',actions:'Actions',
 username_taken:'This username / email is already taken.',saved_ok:'Saved successfully.',deleted_ok:'Deleted.',confirm_del:'Are you sure? This cannot be undone.',
 add_post:'New Post',title_en:'Title (English)',title_ku:'Title (Kurdish)',body_en:'Content (English)',body_ku:'Content (Kurdish)',pinned:'Pin to top',date:'Date',
 add_program:'Add Program',desc_en:'Description (English)',desc_ku:'Description (Kurdish)',icon:'Icon (emoji)',
 courses_en:'Course topics (English, one per line)',courses_ku:'Course topics (Kurdish, one per line)',
 duration_en:'Program duration (English)',duration_ku:'Program duration (Kurdish)',
 certificate_en:'Certificate awarded (English)',certificate_ku:'Certificate awarded (Kurdish)',
 careers_en:'Career options (English, one per line)',careers_ku:'Career options (Kurdish, one per line)',
 official_details_hint:'Confirm these details with the department before publishing; career outcomes are not guaranteed.',
 announcement_type:'News announcement',
 add_event:'Add Event',time:'Time',location:'Location',
 hero_title_l:'Hero Title',hero_sub_l:'Hero Subtitle',about_l:'About Text',site_name:'Institute name',address_l:'Address',
 soc_hint:'Paste full links starting with https:// — leave empty to hide a platform. For WhatsApp chat, use a wa.me link.',
 whatsapp_link_invalid:'Use a WhatsApp chat link such as https://wa.me/9647XXXXXXXX.',
 add_admin:'Add Administrator',admin_name:'Full Name',role:'Role',owner:'Owner',admin:'Admin',
 change_pw:'Change Password',current_pw:'Current Password',new_pw:'New Password',update:'Update',
 pw_changed:'Password updated.',password_updated:'Password updated. Sign in with your new password.',password_reset_sub:'Choose a new password for your account.',wrong_current:'Current password is incorrect.',pw_short:'Password must be at least 6 characters.',
 welcome:'Welcome',my_profile:'My Profile',my_grades:'My Grades',average:'Average',announcements:'Announcements',no_announce:'No announcements yet.',
 empty:'Nothing here yet.',view_site:'View Website',
 demo_hint:'Demo student account — username: ali.kareem · password: student123',
 att_m:'Attendance',present:'Present',absent:'Absent',mark_present:'Mark present',mark_absent:'Mark absent',
 legend_present:'Present',legend_absent:'Absent',legend_unmarked:'Unmarked',att_saved:'Attendance saved.',
 export_csv:'Export CSV',export_students:'Students (CSV)',export_grades:'Grades (CSV)',export_att:'Attendance (CSV)',export_msgs:'Messages (CSV)',
 cert_issued:'Certificate issued.',gen_cert:'Issue Certificate',code:'Code',issued:'Issued',copy:'Copy',copied:'Copied!',
 download_cert:'Download Certificate (PDF)',download_transcript:'Download Transcript (PDF)',
 verify_title:'Certificate Verification',verify_sub:'Enter the certificate code (e.g. VIS-ABC123) to verify its authenticity.',
 verify_btn:'Verify',verify_found:'This certificate is authentic.',verify_invalid:'No certificate found with this code.',
 holder:'Holder',program:'Program',issued_on:'Issued on',
 upload_img:'Upload Photo',caption_en:'Caption (English)',caption_ku:'Caption (Kurdish)',drop_hint:'Click to choose an image (max ~800 KB in demo mode)',
 notif:'Notification',send_notif:'Send Notification',notif_sent:'Notification sent.',audience:'Audience',all_students:'All students',
 msg_from:'From',msg_date:'Received',mark_read:'Mark read',unread:'Unread',read:'Read',
 mode_demo:'Demo mode (data saved in this browser only)',mode_supabase:'Connected to Supabase (shared data)',
 exam_results:'Exam results',backup_restore:'Backup / restore',
 exam_pdf:'Exam result PDF',exam_pdf_hint:'Upload a PDF up to 10 MB.',exam_pdf_hint_demo:'Demo mode supports PDFs up to 200 KB.',
 exam_pdf_too_large:'The PDF exceeds the 10 MB limit.',exam_pdf_too_large_demo:'Demo mode supports PDFs up to 200 KB.',
 exam_pdf_only:'Exam results must be PDF files.',exam_pdf_saved:'Exam result PDF uploaded.',exam_pdf_error:'Could not access the exam result PDF.',
 result_download:'Download PDF',
 email_alert_consent:'Student consented to receive grade and announcement emails',sms_alert_consent:'Student consented to receive SMS alerts',
 weekday_0:'Sunday',weekday_1:'Monday',weekday_2:'Tuesday',weekday_3:'Wednesday',weekday_4:'Thursday',weekday_5:'Friday',weekday_6:'Saturday',
 weekday:'Day of week',weekly_recurring:'Repeat weekly',weekly_timetable:'Weekly timetable',weekly_timetable_empty:'No weekly schedule has been published yet.',
 day:'Day',install_app:'Install app',instructor_qualifications:'Qualifications',
 analytics_id:'Google Analytics measurement ID',analytics_consent_note:'Google Analytics loads only after a visitor accepts analytics cookies.',
 accept:'Accept',reject:'Reject',
 exam_term:'Term / session (optional)',no_exam_results:'No exam results have been published.',
 backup_download:'Download JSON backup',backup_upload:'Restore from JSON backup',
 backup_warning:'Backups contain student and institute data. Store them securely. Supabase Storage files and Authentication accounts are not included.',
 restore_confirm:'Replace the application records in this site with the selected backup? This cannot be undone.',
 invalid_backup:'The selected file is not a valid VIS backup.',backup_restored:'Backup restored. Reloading the application.',
 student_label:'Student',no_students:'No students.',
 website_editor:'Website editor',website_editor_hint:'Manage public pages, programs, schedules, announcements and contact details here. Expand a section to edit it.',
 staff_accounts:'Staff accounts',staff_accounts_hint:'Create and manage institute staff accounts and their access roles.',
 staff_edit_hint:'Update this staff member’s display name and role. Their sign-in username and account stay unchanged.',
 add_staff:'Add staff account',content_editor_role:'Website editor',
 reset_hint:'Set a real email on the student profile and use "Reset PW" to send a password-reset link.',
 pdf_fail:'PDF library not loaded — check your internet connection.',
 theme:'Toggle dark mode'
},
ku:{
 home:'سەرەکی',about:'دەربارەی ئێمە',programs:'بەرنامەکان',news:'هەواڵ و ڕاگەیاندنەکان',contact:'پەیوەندی',login:'چوونەژوورەوە',logout:'دەرچوون',
 events:'ڕوودانەکان',gallery:'گەلەری',verify:'پشتڕاستکردنەوەی بڕوانامە',
 department_details:'بەشەکان',
 open_department:'پەڕەی بەش ببینە',
 program_breadcrumb:'بەرنامەکان',
 department_page_contact:'دەربارەی ئەم بەرنامەیە لە تۆمارکردن بپرسە',
 program_not_found:'ئەم بەشە نەدۆزرایەوە. بۆ بەردەوامبوون هەموو بەرنامەکان ببینە.',
 department_details_title:'بەشەکانمان بناسە',
 department_note:'بابەتەکانی خوێندن و ڕێگاکانی کار بۆ ڕوونکردنەوەن. بۆ زانیاریی فەرمی لەبارەی بەرنامە، ماوە، بڕوانامە و مەرجە پیشەییەکان پەیوەندی بە بەشی تۆمارکردنەوە بکە.',
 courses:'بابەتەکانی خوێندن',program_duration:'ماوەی بەرنامە',certificate_outcome:'بڕوانامە',career_paths:'ڕێگاکانی کاری گونجاو',
 duration_to_confirm:'بۆ پشتڕاستکردنەوەی ماوەی ئێستا پەیوەندی بە بەشی تۆمارکردنەوە بکە.',
 certificate_to_confirm:'بۆ پشتڕاستکردنەوەی بڕوانامەکە پەیوەندی بە بەشی تۆمارکردنەوە بکە.',
 career_note:'هەڵبژاردەکانی کار بە بەرنامە و مەرجە پیشەییە ناوخۆییەکان پەیوەستن.',
 faqs:'پرسیارە باوەکانی تۆمارکردن',faq_title:'پرسیارت هەیە پێش داواکردن؟',
 faq_q1:'چۆن داوا بکەم؟',
 faq_a1:'بۆ پشتڕاستکردنەوەی مەرجەکانی وەرگرتن و بەرنامە بەردەستەکان، بە زانیاریی پەیوەندیی خوارەوە پەیوەندی بە پەیمانگەوە بکە.',
 faq_q2:'مەرجەکانی وەرگرتن چین؟',
 faq_a2:'مەرجەکان لەوانەیە بەپێی بەرنامە و وەرز بگۆڕێن. پێش داواکردن بۆ نوێترین مەرجە فەرمییەکان پەیوەندی بە بەشی تۆمارکردنەوە بکە.',
 faq_q3:'بەرنامەکە چەند ماوەیە و چ بڕوانامەیەک وەردەگرم؟',
 faq_a3:'ماوە و زانیاریی بڕوانامە لەلایەن پەیمانگەوە پشتڕاست دەکرێتەوە. بەشی پەیوەندیدار ببینە و بۆ زانیاریی نوێ پەیوەندی بە تۆمارکردنەوە بکە.',
 faq_q4:'چۆن زوو پرسیارێک بپرسم؟',
 faq_a4:'فۆڕمی پەیوەندی بەکاربهێنە، پەیوەندی تەلەفۆنی بکە، یان ئەگەر لینکی فەرمیی واتساپی پەیمانگە دانراوە نامەمان بۆ بنێرە.',
 whatsapp_chat:'لە واتساپ پەیوەندیمان پێوە بکە',
 instructor_subjects:'بوارەکانی وانەوتنەوە',
 resource_title:'ڕێبەر و داگرتنی بەڵگەنامە',
 resource_note:'ڕێبەر، فۆڕم و ساڵنامە فەرمییەکانی پەیمانگە دابگرە.',
 resource_private_note:'ئەم فایلانە تەنها دوای چوونەژوورەوە وەک قوتابیی پەیمانگە بەردەستن.',
 resource_empty:'هێشتا هیچ ڕێبەر یان بەڵگەنامەیەک بەردەست نییە.',
 resource_open:'داگرتن / کردنەوە',
 resource_add:'زیادکردنی ڕێبەر یان بەڵگەنامە',
 resource_category:'جۆر',
 resource_title_en:'ناونیشان (ئینگلیزی)',
 resource_title_ku:'ناونیشان (کوردی)',
 resource_file:'فایلی PDF',
 resource_file_large:'فایلێکی PDF تا ١٠ مێگابایت هەڵبژێرە.',
 resource_file_large_demo:'لە مۆدی تاقیکردنەوەدا فایلێکی PDF تا ٢٠٠ کیلۆبایت هەڵبژێرە.',
 resource_pdf_only:'ڕێبەرەکان دەبێت فایلی PDF بن.',
 resource_invalid:'جۆر و لانیکەم یەک ناونیشان بنووسە و فایلی PDF هەڵبژێرە.',
 resource_saved:'سەرچاوەی تایبەتی قوتابی پاشەکەوت کرا.',
 resource_cleanup_error:'ڕێبەرەکە نوێکرایەوە، بەڵام فایلی کۆن سڕایەوە نەبوو. تکایە پەیوەندی بە بەڕێوەبەرەوە بکە.',
 resource_download_error:'داگرتنی فایل سەرکەوتوو نەبوو. وەک قوتابی بچۆ ژوورەوە و دووبارە هەوڵ بدە.',
 admissions:'وەرگرتن',
 instructors_admin:'مامۆستاکان',
 instructor_add:'زیادکردنی مامۆستا',
 instructor_name_en:'ناوی مامۆستا (ئینگلیزی)',
 instructor_name_ku:'ناوی مامۆستا (کوردی)',
 instructor_role_en:'ڕۆڵ / بەش (ئینگلیزی)',
 instructor_role_ku:'ڕۆڵ / بەش (کوردی)',
 instructor_bio_en:'ناساندنی کورت (ئینگلیزی)',
 instructor_bio_ku:'ناساندنی کورت (کوردی)',
 instructor_photo:'لینکی وێنە (ئارەزوومەندانە؛ وێنەی پەسەندکراوی پەیمانگە بەکاربهێنە)',
 instructor_consent:'پشتڕاست بکەرەوە مامۆستا ڕەزامەندیی ناساندنی گشتیی داوە.',
 instructor_consent_required:'پێش بڵاوکردنەوە ڕەزامەندیی مامۆستا پشتڕاست بکەرەوە.',
 instructor_saved:'ناساندنی مامۆستا پاشەکەوت کرا.',
 resources_admin:'ڕێبەر و داگرتنی بەڵگەنامە',
 resources_format:'ڕێبەر زیاد بکە و فایلی PDF باربکە.',
 resources_hint:'ڕێبەر و داگرتنەکان تایبەتن: قوتابی و کارمەندانی چوونەتەژوورەوە دەتوانن بیانبینن. مامۆستایان دەتوانن PDF زیاد بکەن و سەرچاوەکانی خۆیان بەڕێوەببەن. سنووری PDF لە Supabase: ١٠ مێگابایت؛ لە مۆدی تاقیکردنەوە: ٢٠٠ کیلۆبایت.',
 gallery_photo_note:'تەنها وێنەی پەسەندکراوی پەیمانگە باربکە و پێش بڵاوکردنەوەی وێنەی کەسان ڕەزامەندی وەربگرە.',
 no_instructors:'هێشتا هیچ مامۆستایەک زیادنەکراوە.',
 student_projects:'پڕۆژەکانی قوتابیان',
 photo_url_invalid:'لینکی وێنە دەبێت HTTPS بێت.',
 admin_save_error:'پاشەکەوتکردنی گۆڕانکاری سەرکەوتوو نەبوو. پەیوەندیی ئینتەرنێت بپشکنە و دووبارە هەوڵ بدە.',
 public_preview_notice:'خزمەتگوزاری ناوەڕۆکی ڕاستەوخۆ بەردەست نییە. ئەم پێشبینینە ناوەڕۆکی نموونەیی بەکاردەهێنێت؛ ناردنی پەیام و گۆڕانکارییەکان لە ئێستادا ناچالاکن.',
 admission_ref:'ئاماژە',
 brand_sub:'پەیمانگەی پیشەیی سلێمانی',
 hero_kicker:'پەروەردەی پیشەیی پەسەندکراو · سلێمانی',
 cta_student:'پۆرتاڵی قوتابی',cta_staff:'چوونەژوورەوەی فەرمانبەران',
 stats_programs:'بەرنامەی پیشەیی',stats_students:'قوتابیانی تۆمارکراو',stats_trainers:'ڕاهێنەری شارەزا',stats_since:'لە ساڵی',
 about_title:'دەربارەی پەیمانگە',
 news_title:'هەواڵ و ڕاگەیاندنەکان',news_empty:'هێشتا هیچ ڕاگەیاندنێک نییە. تکایە دواتر ببینەوە.',
 events_title:'ساڵنامەی ڕوودانەکان',no_events:'هیچ ڕوودانێکی داهاتوو نییە.',
 gallery_title:'گەلەری',no_gallery:'هێشتا وێنە نییە.',
 contact_title:'پەیوەندیمان پێوە بکە',contact_lead:'پرسیارت هەیە دەربارەی تۆمارکردن یان بەرنامەکان؟ پەیوەندی بکە و تیمی ئێمە یارمەتیت دەدات.',
 address:'ناونیشان',phone:'مۆبایل',email:'ئیمەیڵ',office_hours:'کاتەکانی کار',office_hours_en:'کاتەکانی کار (ئینگلیزی)',office_hours_ku:'کاتەکانی کار (کوردی)',follow_us:'فۆڵۆومان بکە',
 your_name:'ناوت',your_email:'ئیمەیڵەکەت',your_phone:'مۆبایلەکەت (ئارەزوومەندانە)',your_message:'پەیامەکەت',
 send:'ناردنی پەیام',msg_sent:'پەیامەکەت نێردرا. بەم زووانە پەیوەندیت پێوە دەکەین.',msg_fill:'تکایە ناو و ئیمەیڵ و پەیام پڕ بکە.',
 footer_links:'لینکە خێراکان',footer_contact:'پەیوەندی',
 why_title:'بۆچی VIS هەڵدەبژێریت',
 why_1:'ڕاهێنانی پراکتیکی لە تاقیگەی نوێدا',why_2:'مامۆستایانی شارەزا و بڕوانامەدار',
 why_3:'پشتیوانی دۆزینەوەی کار',why_4:'بڕوانامەی پیشەیی ناسراو',
 login_title:'چوونەژوورەوە بۆ VIS',login_sub:'زانیارییەکان کە پەیمانگە پێیدەدات بەکاربهێنە.',
 student_signup:'تۆمارکردنی قوتابی',signup_approval_note:'ژمارەی مۆبایلەکەت بە کۆدی SMS و WhatsApp پشتڕاست بکەرەوە. هەژمارەکەت تا پەسەندکردنی بەڕێوەبەر چالاک نابێت.',
 student_full_name:'ناوی تەواو',phone_required:'ژمارەی مۆبایل (پێویستە، بە فۆرماتی نێودەوڵەتی)',email_optional:'ئیمەیڵ (ئارەزوومەندانە)',
 signup_messaging_consent:'ڕازیم ئاگادارکردنەوەکانی پەیمانگە و مامۆستایان بە SMS و WhatsApp وەربگرم. لەوانەیە کرێی نامە و داتا هەبێت.',
 whatsapp_alert_consent:'ئاگادارکردنەوەکان بە WhatsApp وەربگرە',
 signup_code:'کۆدی پشتڕاستکردنەوەی ٦ ژمارەیی',signup_send_code:'ناردنی کۆد بە SMS و WhatsApp',
 signup_verify:'پشتڕاستکردنەوەی ژمارە و ناردنی داواکاری',signup_resend:'دووبارە ناردنەوەی کۆد',
 signup_code_sent:'کۆدی پشتڕاستکردنەوە بە SMS و WhatsApp بۆ مۆبایلەکەت نێردرا.',
 signup_pending:'ژمارەکەت پشتڕاست کرایەوە. داواکارییەکەت چاوەڕێی پەسەندکردنی بەڕێوەبەرە. دوای پەسەندکردن دەتوانیت بچیتە ژوورەوە.',
 signup_error:'ناردنی داواکاری سەرکەوتوو نەبوو. تکایە دووبارە هەوڵ بدەوە.',
 signup_cloud_required:'تۆمارکردنی قوتابی کاتێک بەردەستە کە ماڵپەڕەکە بە خزمەتگوزاری Supabase پەیوەست بێت.',
 login_pending:'ژمارەکەت پشتڕاست کرایەوە، بەڵام داواکاریی قوتابییەکەت هێشتا چاوەڕێی پەسەندکردنی بەڕێوەبەرە.',
 signup_pending_list:'داواکارییە چاوەڕوانەکان',signup_no_pending:'هیچ داواکارییەکی چاوەڕوان نییە.',
 signup_refresh:'نوێکردنەوەی داواکارییەکان',signup_approve:'پەسەندکردن',signup_reject:'ڕەتکردنەوە',
 signup_approved:'هەژماری قوتابی پەسەند کرا.',signup_rejected:'داواکارییەکە ڕەتکرایەوە.',
 signup_admin_error:'گۆڕینی داواکاریی قوتابی سەرکەوتوو نەبوو.',
 teacher_message_title:'ناردنی پەیام بۆ قوتابیان',teacher_message_channel:'شێوازی ناردن',
 teacher_message_sms:'SMS',teacher_message_whatsapp:'WhatsApp',teacher_message_recipients:'قوتابیان',
 teacher_message_body:'پەیام',teacher_message_send:'ناردنی پەیام',
 teacher_message_no_eligible:'هیچ قوتابییەکی دیاریکراو نییە کە ژمارەی مۆبایلی دروست و ڕەزامەندیی ئەم شێوازەی هەبێت.',
 teacher_message_sent:'پەیام نێردرا. گەیشتە: {delivered}؛ نەگەیشتە: {skipped}.',
 teacher_message_partial:'هەندێک پەیام نەگەیشت. گەیشتە: {delivered}؛ شکستی هێنا: {failed}؛ نەگەیشتە: {skipped}.',
 tab_student:'قوتابی',tab_staff:'ستاف',
 username:'ناوی بەکارهێنەر',staff_login:'ناوی مامۆستا یان ئیمەیڵی خاوەن',password:'وشەی نهێنی',show_password:'پیشاندان',hide_password:'شاردنەوە',sign_in:'چوونەژوورەوە',back_home:'← گەڕانەوە بۆ ماڵپەڕ',
 err_creds:'زانیارییەکان هەڵەن. تکایە دووبارە هەوڵ بدە.',err_fill:'تکایە هەموو خانە پێویستەکان پڕ بکە.',
 owner_setup:'ڕێکخستنی یەکەمجار: دروستکردنی هەژماری خاوەن',owner_setup_sub:'ئەم پڕۆژەیە Supabase هێشتا هیچ بەرێوەبەرێکی نییە. هەژماری خاوەنەکەی لە خوارەوە دروست بکە — دواتر بە هەمان زانیارییەکان دەچیتە ژوورەوە.',
 create:'دروستکردنی هەژماری',
 dash:'داشبۆرد',students:'قوتابیان',posts:'پۆستەکان',programs_m:'بەرنامەکان',content:'ناوەڕۆکی ماڵپەڕ',socials:'سۆشیال میدیا',
 admin_menu:'کردنەوەی پێڕستی گەشت',admin_close:'داخستنی پێڕستی گەشت',
 teacher_students_count:'قوتابییە دیاریکراوەکان',teacher_upcoming_count:'وانە و تاقیکردنەوەی داهاتوو',
 attendance_paper:'فۆڕمی ئامادەبوونی پۆل',attendance_admin:'تۆمارەکانی ئامادەبوون',attendance_history:'مێژووی ئامادەبوونی من',
 class_name:'ناوی پۆل',number:'ژمارە',student_name:'ناوی قوتابی',attendance_status:'دۆخ',time_in:'کاتی هاتن',time_out:'کاتی چوون',signature:'واژوو',existing_stage:'قۆناغی ئێستا',
 submit_attendance:'ناردنی ئامادەبوون',attendance_no_students:'هیچ قوتابییەک بۆ ئەم قۆناغە دیاری نەکراوە.',attendance_saved:'ئامادەبوون پاشەکەوت کرا. دەچێتە پەڕەی ئامادەبوونی بەڕێوەبەر…',
 attendance_present:'ئامادە',attendance_absent:'ئامادە نەبوو',attendance_none:'هێشتا هیچ ئامادەبوونێک نەنێردراوە.',attendance_save_error:'فۆڕمی ئامادەبوون پاشەکەوت نەکرا. تکایە دووبارە هەوڵ بدەوە.',
 attendance_sheet:'فۆڕمی ئامادەبوون',attendance_teacher:'مامۆستا',attendance_students:'قوتابیان',attendance_submitted:'نێردراوە',
 teacher_portal:'داشبۆردی مامۆستا',
 teacher_profile:'هەژماری من',teacher_role:'ڕۆڵ',teacher_quick_links:'ئامرازەکانی وانەوتنەوە',
 teacher_manage_learning:'بەڕێوەبردنی ئەرک و سەرچاوەکان',teacher_students:'قوتابییەکانم',
 teacher_manage_students:'بەڕێوەبردنی قوتابیان',teacher_assigned:'بۆ تۆ دیاریکراوە',
 teacher_sharing_status:'دەستگەیشتن',teacher_shared_readonly:'هاوبەشکراوە · تەنها خوێندنەوە',teacher_no_students:'هێشتا هیچ قوتابییەک بۆ تۆ دیاری یان هاوبەش نەکراوە.',
 teacher_upcoming:'وانە و تاقیکردنەوەی داهاتوو',teacher_manage_schedule:'بەڕێوەبردنی خشتەی وانە',
 teacher_assignments:'ئەرکەکانم',teacher_resources:'ڕێبەر و داگرتنی بەڵگەنامە',
 teacher_manage_resources:'بەڕێوەبردنی ڕێبەرەکان',teacher_resource_note:'ڕێبەرەکان فایلە تایبەتییەکانی پەیمانگەن و بە هەژماری چوونەتەژوورەوە دەبینرێن.',
 teacher_accounts:'هەژمارەکانی مامۆستایان',teacher_accounts_hint:'هەژماری چوونەژوورەوەی مامۆستایان دروست بکە و هەژمارەکان بەڕێوەببە.',
 teacher_accounts_empty:'هێشتا هیچ هەژمارێکی مامۆستا دروست نەکراوە.',
 teacher_account_setup_hint:'مامۆستاکان بە ناوی بەکارهێنەر و وشەی نهێنییەکەی لێرە دیاریدەکەیت دەچنە ژوورەوە.',
 certs:'بڕوانامەکان',msgs:'پەیامەکان',notifs:'ئاگادارکردنەوەکان',ev_m:'ڕوودانەکان',gal_m:'گەلەری',
 admins:'هەژمارەکان',account:'هەژماری من',teacher:'مامۆستا',add_teacher:'زیادکردنی مامۆستا',ai_helper:'یاریدەدەری زیرەکی دەستکرد',ai_ask:'پرسیار بکە',ai_placeholder:'پرسیاری خوێندن یان وانەوتنەوە بنووسە…',ai_error:'وەڵامی زیرەکی دەستکرد بەردەست نییە. Supabase Edge Functions بپشکنە.',ai_requires_cloud:'یاریدەدەری زیرەکی دەستکرد دوای ڕێکخستنی Supabase بەردەست دەبێت.',owner_exists:'هەژماری خاوەن هەیە یان Supabase تەواو ڕێکنەخراوە.',
 schedule:'خشتەی وانە',schedule_title:'خشتەی وانە و تاقیکردنەوە',add_schedule:'زیادکردنی وانە یان تاقیکردنەوە',learning:'ئەرک و سەرچاوەکان',assignments:'ئەرکەکان',add_assignment:'زیادکردنی ئەرک',materials:'سەرچاوەکانی وانە',add_material:'زیادکردنی سەرچاوە',url_invalid:'لینک دەبێت بە http:// یان https:// دەست پێ بکات.',
 event_kind:'جۆر',class_session:'وانە',exam:'تاقیکردنەوە',course:'وانە / بابەت',room:'ژوور',start_time:'کاتی دەستپێک',end_time:'کاتی کۆتایی',due_date:'کاتی کۆتایی',instructions:'ڕێنماییەکان',
 submit_work:'ناردنی ئەرک',submission:'ناردراو',answer:'وەڵامەکەت',attachment:'هاوپێچکردنی فایل',submitted:'نێردراوە',submitted_ok:'ئەرکەکە نێردرا.',overdue:'داخراوە',no_assignments:'هێشتا ئەرک نییە.',no_schedule:'وانە یان تاقیکردنەوەی داهاتوو نییە.',no_materials:'هێشتا سەرچاوەی وانە نییە.',resource:'لینکی سەرچاوە',learning_saved:'بە سەرکەوتوویی پاشەکەوت کرا.',file_too_large:'قەبارەی فایل نابێت لە ٢ مێگابایت زیاتر بێت.',file_too_large_demo:'قەبارەی فایل لە مۆدی تاقیکردنەوەدا نابێت لە ٢٠٠ کیلۆبایت زیاتر بێت.',file_read_error:'فایلەکە نەخوێندرایەوە.',
 access_requests:'داواکارییەکانی دەستگەیشتن بە قوتابی',request_access:'داوای دەستگەیشتن بکە',student_username:'ناوی قوتابی',
 shared_read_only:'هاوبەشکراو · تەنها خوێندنەوە',approve:'پەسەندکردن',request_pending:'داواکارییەکە چاوەڕوانە.',student_not_found:'بەم ناوی بەکارهێنەرە قوتابی نەدۆزرایەوە یان داوای دەستگەیشتن ناکرێت.',assigned_teacher:'مامۆستای دیاریکراو',
 share_approved:'دەستگەیشتن پەسەند کرا.',share_denied:'داواکاری ڕەتکرایەوە.',request_sent:'داواکارییەکە بۆ مامۆستای قوتابی نێردرا.',
 total_students:'کۆی قوتابیان',published_posts:'پۆستی بڵاوکراو',programs_offered:'بەرنامە بەردەستەکان',recent_students:'دوایین قوتابی زیادکراوەکان',
 add_student:'زیادکردنی قوتابی',search_ph:'گەڕان بەدوای قوتابی…',name_en:'ناوی تەواو (ئینگلیزی)',name_ku:'ناوی تەواو (کوردی)',
 dept:'بەش',stage:'قۆناغ',phone_l:'مۆبایل',dob:'بەرواری لەدایکبوون',attendance:'ئامادەبوون',grades:'نمرەکان',subject:'بابەت',score:'نمرە',add_grade:'+ زیادکردنی بابەت',
 save:'پاشەکەوت',cancel:'هەڵوەشاندنەوە',edit:'دەستکاری',del:'سڕینەوە',reset_pw:'ڕیسێتی وشەی نهێنی',actions:'کردارەکان',
 username_taken:'ئەم ناوە بەکارهێنەرە یان ئیمەیڵە هەیە.',saved_ok:'بە سەرکەوتوویی پاشەکەوت کرا.',deleted_ok:'سڕایەوە.',confirm_del:'دڵنیایت؟ ئەم کردارە ناگەڕێتەوە.',
 add_post:'پۆستی نوێ',title_en:'ناونیشان (ئینگلیزی)',title_ku:'ناونیشان (کوردی)',body_en:'ناوەڕۆک (ئینگلیزی)',body_ku:'ناوەڕۆک (کوردی)',pinned:'جێگیرکردن لە سەرەوە',date:'بەروار',
 add_program:'زیادکردنی بەرنامە',desc_en:'وەسف (ئینگلیزی)',desc_ku:'وەسف (کوردی)',icon:'ئایکۆن (ئیمۆجی)',
 courses_en:'بابەتەکان (ئینگلیزی، هەر یەک لە هێڵێک)',courses_ku:'بابەتەکان (کوردی، هەر یەک لە هێڵێک)',
 duration_en:'ماوەی بەرنامە (ئینگلیزی)',duration_ku:'ماوەی بەرنامە (کوردی)',
 certificate_en:'بڕوانامە (ئینگلیزی)',certificate_ku:'بڕوانامە (کوردی)',
 careers_en:'هەڵبژاردەکانی کار (ئینگلیزی، هەر یەک لە هێڵێک)',careers_ku:'هەڵبژاردەکانی کار (کوردی، هەر یەک لە هێڵێک)',
 official_details_hint:'پێش بڵاوکردنەوە زانیارییەکان لەگەڵ بەشەکە پشتڕاست بکەرەوە؛ دەرئەنجامی کار دڵنیاکراو نییە.',
 announcement_type:'هەواڵ و ڕاگەیاندن',
 add_event:'زیادکردنی ڕووداو',time:'کات',location:'شوێن',
 hero_title_l:'سەردێڕی سەرەکی',hero_sub_l:'دەقی ژێر سەردێڕ',about_l:'دەقی دەربارە',site_name:'ناوی پەیمانگە',address_l:'ناونیشان',
 soc_hint:'لینکی تەواو بە https:// دابنێ — بە بەتاڵی جێی بهێڵە بۆ شاردنەوەی. بۆ واتساپ، لینکی wa.me بەکاربهێنە.',
 whatsapp_link_invalid:'لینکی چاتی واتساپ بەکاربهێنە، وەک https://wa.me/9647XXXXXXXX.',
 add_admin:'زیادکردنی بەرێوەبەر',admin_name:'ناوی تەواو',role:'ڕۆڵ',owner:'خاوەن',admin:'بەرێوەبەر',
 change_pw:'گۆڕینی وشەی نهێنی',current_pw:'وشەی نهێنی ئێستا',new_pw:'وشەی نهێنی نوێ',update:'نوێکردنەوە',
 pw_changed:'وشەی نهێنی نوێ کرا.',password_updated:'وشەی نهێنی نوێ کرا. بە وشەی نهێنی نوێوە بچۆ ژوورەوە.',password_reset_sub:'وشەی نهێنی نوێ بۆ هەژمارەکەت هەڵبژێرە.',wrong_current:'وشەی نهێنی ئێستا هەڵەیە.',pw_short:'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.',
 welcome:'بەخێربێیت',my_profile:'پرۆفایلی من',my_grades:'نمرەکانم',average:'اۆرتالێ',announcements:'ڕاگەیاندنەکان',no_announce:'هیچ ڕاگەیاندنێک نییە.',
 empty:'هێشتا هیچ شتێک نییە.',view_site:'بینینی ماڵپەڕ',
 demo_hint:'هەژماری تاقیکردنەوەی قوتابی — ناوی بەکارهێنەر: ali.kareem · وشەی نهێنی: student123',
 att_m:'ئامادەبوون',present:'ئامادە',absent:'غایب',mark_present:'نیشانکردن وەک ئامادە',mark_absent:'نیشانکردن وەک غایب',
 legend_present:'ئامادە',legend_absent:'غایب',legend_unmarked:'نەسەلمێنراو',att_saved:'ئامادەبوون پاشەکەوت کرا.',
 export_csv:'هەناندنی CSV',export_students:'قوتابیان (CSV)',export_grades:'نمرەکان (CSV)',export_att:'ئامادەبوون (CSV)',export_msgs:'پەیامەکان (CSV)',
 cert_issued:'بڕوانامە درا.',gen_cert:'دەرکردنی بڕوانامە',code:'کۆد',issued:'بەرواری دەرکردن',copy:'کۆپی',copied:'کۆپی کرا!',
 download_cert:'داگرتنی بڕوانامە (PDF)',download_transcript:'داگرتنی کارتی نمرەکان (PDF)',
 verify_title:'پشتڕاستکردنەوەی بڕوانامە',verify_sub:'کۆدی بڕوانامەکە دابنێ (بۆ نموونە VIS-ABC123) بۆ پشتڕاستکردنەوەی ڕاستی.',
 verify_btn:'پشتڕاستکردنەوە',verify_found:'ئەم بڕوانامەیە ڕاستە و دەسەلمێنرێت.',verify_invalid:'هیچ بڕوانامەیەک نەدۆزرایەوە بەم کۆدە.',
 holder:'خاوەن',program:'بەرنامە',issued_on:'بەرواری دەرکردن',
 upload_img:'بارکردنی وێنە',caption_en:'سەردێڕ (ئینگلیزی)',caption_ku:'سەردێڕ (کوردی)',drop_hint:'کرتە بکە بۆ هەڵبژاردنی وێنە (زۆرترین ~800 KB لە مۆدی تاقیکردنەوەدا)',
 notif:'ئاگادارکردنەوە',send_notif:'ناردنی ئاگادارکردنەوە',notif_sent:'ئاگادارکردنەوەکە نێردرا.',audience:'ئامادە',all_students:'هەموو قوتابیان',
 msg_from:'لایەن',msg_date:'وەرگیراو',mark_read:'نیشانکردن وەک خوێنراوە',unread:'نەخوێنراوە',read:'خوێنراوە',
 mode_demo:'مۆدی تاقیکردنەوە (داتا تەنها لەم وێبگەڕەدا پاشەکەوت دەکرێت)',mode_supabase:'پەیوەستە بە Supabase (داتای هاوبەش)',
 exam_results:'ئەنجامی تاقیکردنەوە',backup_restore:'پاڵپشتی / گەڕاندنەوە',
 exam_pdf:'PDFی ئەنجامی تاقیکردنەوە',exam_pdf_hint:'فایلی PDF تا ١٠ مێگابایت باربکە.',exam_pdf_hint_demo:'لە مۆدی تاقیکردنەوەدا تەنها PDF تا ٢٠٠ کیلۆبایت پشتگیری دەکرێت.',
 exam_pdf_too_large:'قەبارەی PDF لە ١٠ مێگابایت زیاترە.',exam_pdf_too_large_demo:'لە مۆدی تاقیکردنەوەدا تەنها PDF تا ٢٠٠ کیلۆبایت پشتگیری دەکرێت.',
 exam_pdf_only:'ئەنجامی تاقیکردنەوە دەبێت PDF بێت.',exam_pdf_saved:'PDFی ئەنجامی تاقیکردنەوە بارکرا.',exam_pdf_error:'نەتوانرا PDFی ئەنجامی تاقیکردنەوە دەستپێبگات.',result_download:'داگرتنی PDF',
 email_alert_consent:'قوتابی ڕەزامەندی داوە بۆ وەرگرتنی ئاگادارکردنەوەی نمرە و ڕاگەیاندن بە ئیمەیڵ',sms_alert_consent:'قوتابی ڕەزامەندی داوە بۆ وەرگرتنی ئاگادارکردنەوە بە SMS',
 weekday_0:'یەکشەممە',weekday_1:'دووشەممە',weekday_2:'سێشەممە',weekday_3:'چوارشەممە',weekday_4:'پێنجشەممە',weekday_5:'هەینی',weekday_6:'شەممە',
 weekday:'ڕۆژی هەفتە',weekly_recurring:'هەفتانە دووبارە ببێتەوە',weekly_timetable:'خشتەی هەفتانەی وانە',weekly_timetable_empty:'هێشتا هیچ خشتەیەکی هەفتانە بڵاونەکراوەتەوە.',
 day:'ڕۆژ',install_app:'دامەزراندنی ئەپ',instructor_qualifications:'بڕوانامە و شارەزایی',
 analytics_id:'ناسێنەری پێوانەی Google Analytics',analytics_consent_note:'Google Analytics تەنها دوای ڕەزامەندی سەردانکەر کوکییەکانی پێوانە بار دەکات.',
 accept:'ڕازیم',reject:'ڕەتکردنەوە',
 exam_term:'وەرز / خول (ئارەزوومەندانە)',no_exam_results:'هیچ ئەنجامی تاقیکردنەوەیەک بڵاونەکراوەتەوە.',
 backup_download:'داگرتنی پاڵپشتی JSON',backup_upload:'گەڕاندنەوە لە پاڵپشتی JSON',
 backup_warning:'پاڵپشتییەکان زانیاریی قوتابی و پەیمانگایان تێدایە. بە پارێزراوی هەڵیبگرە. فایلەکانی Supabase Storage و هەژمارەکانی Supabase Authentication ناگرێتەوە.',
 restore_confirm:'تۆمارەکانی ئەم ماڵپەڕە بە پاڵپشتییە هەڵبژێردراوەکە بگۆڕدرێن؟ ئەم کارە ناگەڕێتەوە.',
 invalid_backup:'ئەم فایلە پاڵپشتییەکی دروستی VIS نییە.',backup_restored:'پاڵپشتی گەڕێندرایەوە. ماڵپەڕ دووبارە دەکرێتەوە.',
 student_label:'قوتابی',no_students:'هیچ قوتابییەک نییە.',
 website_editor:'دەستکاریکەری ماڵپەڕ',website_editor_hint:'پەڕە گشتییەکان، بەرنامەکان، خشتەی وانە، هەواڵ و زانیاریی پەیوەندی لێرە بەڕێوەببە. بۆ دەستکاری بەشێک، بکەرەوە.',
 staff_accounts:'هەژمارەکانی ستاف',staff_accounts_hint:'هەژماری ستاف دروست بکە و ڕۆڵ و دەسەڵاتەکانیان بەڕێوەببە.',
 staff_edit_hint:'ناوی پیشاندراو و ڕۆڵی ئەم ئەندامەی ستافە بگۆڕە. ناوی چوونەژوورەوە و هەژمارەکەی وەک خۆی دەمێنێتەوە.',
 add_staff:'زیادکردنی هەژماری ستاف',content_editor_role:'دەستکاریکەری ماڵپەڕ',
 reset_hint:'ئیمەیڵێکی ڕاستی بۆ پرۆفایلی قوتابیەکە دابنێ و دوگمەی "Reset PW" بەکاربهێنە بۆ ناردنی لینکی گۆڕینی وشەی نهێنی.',
 pdf_fail:'کتێبخانەی PDF بار نەبووە — ئینتەرنێت بپشکنە.',
 theme:'گۆڕینی ڕووکار بۆ تاریک'
}};

/* ===== shared helpers ===== */
function t(k){const d=I18N[Vis.lang]||{};return d[k]||I18N.en[k]||k;}
function pick(o){if(!o)return '';return o[Vis.lang]??o.en??'';}
function applyI18n(){
  document.documentElement.lang=Vis.lang==='ku'?'ckb':'en';
  document.documentElement.dir=Vis.lang==='ku'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{el.placeholder=t(el.dataset.i18nPh);});
  if(typeof window.renderPage==='function')window.renderPage();
}
Vis.setLang=function(l){Vis.lang=l;localStorage.setItem('vis_lang',l);applyI18n();};

function getSession(){try{return JSON.parse(sessionStorage.getItem('vis_session'))}catch(e){return null}}
function setSession(s){sessionStorage.setItem('vis_session',JSON.stringify(s))}
function clearSession(){sessionStorage.removeItem('vis_session')}
function requireAuth(type){const s=getSession();if(!s||(type&&s.type!==type)){location.replace('login.html');return null}return s}
function isOwner(s){return s&&s.role==='owner'}

let _toastT;
function toast(msg,ok=true){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.className='show '+(ok?'ok':'bad');
  clearTimeout(_toastT);_toastT=setTimeout(()=>{el.className=''},2800);
}
async function askAI(prompt){
  if(Store.mode!=='supabase'||!Store.functions)throw new Error(t('ai_requires_cloud'));
  const result=await Store.functions.httpsCallable('ask-tutor')({prompt:String(prompt||'').trim().slice(0,2000)});
  return result.data.answer||'';
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function whatsappHref(value){
  try{
    const url=new URL(String(value||''));
    if(url.protocol!=='https:'||url.username||url.password)return null;
    if(url.hostname==='wa.me'&&/^\/\d{7,15}\/?$/.test(url.pathname))return url.href;
    const phone=url.searchParams.get('phone')||'';
    if(url.hostname==='api.whatsapp.com'&&url.pathname==='/send'&&/^\d{7,15}$/.test(phone))return url.href;
  }catch(e){}
  return null;
}
function fmtDate(d){try{return new Date(d).toLocaleDateString(Vis.lang==='ku'?'ckb-IQ':'en-GB',{year:'numeric',month:'long',day:'numeric'})}catch(e){try{return new Date(d).toLocaleDateString('en-GB')}catch(e2){return d}}}
function uid(p){return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function mountLangSwitch(id){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML=`<button type="button" class="lang-btn ${Vis.lang==='en'?'active':''}" data-l="en">EN</button><button type="button" class="lang-btn ${Vis.lang==='ku'?'active':''}" data-l="ku">کوردی</button>`;
  el.querySelectorAll('.lang-btn').forEach(b=>b.onclick=()=>Vis.setLang(b.dataset.l));
}
async function boot(render){
  try{
    await Store.init();
    applyTheme();window.renderPage=render;applyI18n();
  }catch(error){
    console.error('VIS initialization failed:',error);
    if(document.body.classList.contains('public-site')){
      try{
        Store.mode='local';
        Store.db=Store.auth=Store.storage=Store.functions=Store.supabase=null;
        await Store.localInit();
        applyTheme();window.renderPage=render;
        const notice=document.createElement('div');
        notice.className='public-preview-notice';
        notice.setAttribute('role','status');
        notice.dataset.i18n='public_preview_notice';
        document.querySelector('.navbar')?.before(notice);
        const contactForm=document.getElementById('contact-form');
        contactForm?.querySelectorAll('input,textarea,button').forEach(control=>{control.disabled=true;});
        applyI18n();
        return;
      }catch(fallbackError){
        console.error('VIS public preview initialization failed:',fallbackError);
      }
    }
    const alert=document.createElement('div');
    alert.className='panel';
    alert.setAttribute('role','alert');
    alert.textContent=`Could not connect to the configured Supabase project. ${error.message||'Check the project URL, public key, database migration, and network connection.'}`;
    document.body.prepend(alert);
  }
}

/* ===== dark mode ===== */
function applyTheme(){document.documentElement.dataset.theme=localStorage.getItem('vis_theme')||'light';}
function toggleTheme(){
  const cur=localStorage.getItem('vis_theme')||'light';
  localStorage.setItem('vis_theme',cur==='dark'?'light':'dark');
  applyTheme();
  document.querySelectorAll('.theme-toggle').forEach(b=>{
    const dark=(localStorage.getItem('vis_theme')||'light')==='dark';
    b.textContent=dark?'☀️':'🌙';b.setAttribute('aria-pressed',String(dark));
  });
}
function mountThemeToggle(cls){
  document.querySelectorAll(cls).forEach(b=>{
    const dark=(localStorage.getItem('vis_theme')||'light')==='dark';
    b.textContent=dark?'☀️':'🌙';b.setAttribute('aria-pressed',String(dark));
    b.title=t('theme');b.onclick=toggleTheme;
  });
}

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-password-target]');
  if(!button)return;
  const input=document.getElementById(button.dataset.passwordTarget);
  if(!input)return;
  const reveal=input.type==='password';
  input.type=reveal?'text':'password';
  button.textContent=t(reveal?'hide_password':'show_password');
  button.setAttribute('aria-label',t(reveal?'hide_password':'show_password'));
  button.setAttribute('aria-pressed',String(reveal));
});

/* ===== attendance calendar ===== */
function dowLabels(){
  const out=[];const loc=Vis.lang==='ku'?'ckb-IQ':'en-GB';
  for(let i=0;i<7;i++){out.push(new Date(2024,0,i).toLocaleDateString(loc,{weekday:'short'}));}
  return out;
}
function calendarHtml(attMap,y,m,interactive){
  const first=new Date(y,m,1);const startDay=(first.getDay()+6)%7;
  const days=new Date(y,m+1,0).getDate();
  const monthKey=y+'-'+String(m+1).padStart(2,'0');
  const today=new Date().toISOString().slice(0,10);
  let cells=dowLabels().map(d=>`<div class="cal-dow">${esc(d)}</div>`).join('');
  for(let i=0;i<startDay;i++)cells+='<span class="cal-cell empty"></span>';
  for(let d=1;d<=days;d++){
    const key=monthKey+'-'+String(d).padStart(2,'0');
    const st=attMap?attMap[key]:null;
    cells+=`<button type="button" class="cal-cell ${st||''} ${key>today?'future':''}" data-day="${key}" ${interactive?'':'disabled'}>${d}</button>`;
  }
  const loc=Vis.lang==='ku'?'ckb-IQ':'en-GB';
  const title=new Date(y,m,1).toLocaleDateString(loc,{month:'long',year:'numeric'});
  return `<div class="cal-head">
    ${interactive?`<button type="button" class="cal-nav" data-calnav="-1">‹</button>`:''}
    <b style="flex:1">${esc(title)}</b>
    ${interactive?`<button type="button" class="cal-nav" data-calnav="1">›</button>`:''}
  </div><div class="cal-grid">${cells}</div>
  <div class="cal-legend">
    <span><span class="cal-dot" style="background:#dcf5ec;border:1.5px solid var(--green)"></span>${t('legend_present')}</span>
    <span><span class="cal-dot" style="background:#fdecea;border:1.5px solid var(--red)"></span>${t('legend_absent')}</span>
    <span><span class="cal-dot" style="background:var(--card);border:1.5px solid var(--line)"></span>${t('legend_unmarked')}</span>
  </div>`;
}
function recalcAttendance(stu){
  const vals=Object.values(stu.attMap||{});
  if(!vals.length){stu.attendance=100;return;}
  stu.attendance=Math.round(vals.filter(v=>v==='present').length/vals.length*100);
}

/* ===== CSV export ===== */
function downloadCSV(filename,rows){
  const csv=rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;
  document.body.appendChild(a);a.click();a.remove();
}

/* ===== PDF generators (jsPDF via CDN) ===== */
function pdfReady(){return !!(window.jspdf&&window.jspdf.jsPDF);}
function transcriptPDF(stu){
  if(!pdfReady()){toast(t('pdf_fail'),false);return;}
  const {jsPDF}=window.jspdf;const doc=new jsPDF();
  const s=Store.data.settings;
  doc.setFillColor(10,25,49);doc.rect(0,0,210,34,'F');
  doc.setTextColor(201,162,39);doc.setFontSize(15);doc.setFont('helvetica','bold');
  doc.text(s.siteName_en||'Vocational Institute of Sulaimanyah',105,14,{align:'center'});
  doc.setTextColor(255,255,255);doc.setFontSize(11);doc.setFont('helvetica','normal');
  doc.text('OFFICIAL TRANSCRIPT · کارتی نمرەی فەرمی',105,24,{align:'center'});
  doc.setTextColor(30,39,51);doc.setFontSize(10);
  let y=48;
  doc.setFont('helvetica','bold');doc.text('Student / قوتابی:',14,y);
  doc.setFont('helvetica','normal');doc.text(stu.name_en||'',52,y);
  y+=7;doc.setFont('helvetica','bold');doc.text('Department / بەش:',14,y);
  doc.setFont('helvetica','normal');doc.text((DEPTS[stu.dept]&&DEPTS[stu.dept].en)||stu.dept||'',52,y);
  y+=7;doc.setFont('helvetica','bold');doc.text('Stage / قۆناغ:',14,y);
  doc.setFont('helvetica','normal');doc.text(String(stu.stage||''),52,y);
  y+=10;
  doc.setFillColor(232,238,247);doc.rect(14,y-5,182,8,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(9);
  doc.text('SUBJECT',18,y);doc.text('SCORE',170,y);
  doc.setDrawColor(201,162,39);doc.line(14,y+2,196,y+2);
  y+=9;doc.setFont('helvetica','normal');doc.setFontSize(10);
  (stu.grades||[]).forEach(g=>{
    doc.text(String(g.subject).slice(0,60),18,y);
    doc.text(String(g.score)+'%',170,y);
    doc.setDrawColor(220);doc.line(14,y+1.5,196,y+1.5);
    y+=8;
  });
  const avg=(stu.grades&&stu.grades.length)?Math.round(stu.grades.reduce((a,g)=>a+Number(g.score||0),0)/stu.grades.length):0;
  y+=6;doc.setFont('helvetica','bold');doc.setFontSize(11);
  doc.text(`AVERAGE / اۆرتالێ: ${avg}%`,14,y);
  y+=10;doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(120);
  doc.text('Issued on '+new Date().toLocaleDateString('en-GB')+' · '+synEmail(stu.username||''),14,y);
  doc.text('Registrar signature: ______________________',120,y+10);
  doc.save(`transcript_${(stu.username||'student')}.pdf`);
}
function certificatePDF(stu,cert){
  if(!pdfReady()){toast(t('pdf_fail'),false);return;}
  const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  doc.setFillColor(10,25,49);doc.rect(0,0,297,24,'F');
  doc.setTextColor(201,162,39);doc.setFontSize(16);doc.setFont('helvetica','bold');
  doc.text('VOCATIONAL INSTITUTE OF SULAIMANYAH',148.5,10,{align:'center'});
  doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text('CERTIFICATE OF COMPLETION · بڕوانامەی تەواوکردن',148.5,18,{align:'center'});
  doc.setDrawColor(201,162,39);doc.setLineWidth(1.2);doc.rect(8,8,281,192);
  doc.setLineWidth(.4);doc.rect(11,11,275,186);
  doc.setTextColor(30,39,51);doc.setFontSize(13);doc.setFont('helvetica','italic');
  doc.text('This is to certify that',148.5,55,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(26);
  doc.text(stu.name_en||'',148.5,72,{align:'center'});
  doc.setDrawColor(201,162,39);doc.setLineWidth(.8);doc.line(90,78,207,78);
  doc.setFont('helvetica','italic');doc.setFontSize(13);
  doc.text('has successfully completed the vocational program in',148.5,94,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(17);
  doc.text((DEPTS[cert.program]&&DEPTS[cert.program].en)||cert.program||'',148.5,108,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(11);
  doc.text(`Issued on ${fmtDate(cert.date)}   ·   Certificate Code: ${cert.code}`,148.5,126,{align:'center'});
  doc.setFontSize(9);doc.setTextColor(130);
  doc.text('Verify this certificate at our website — Certificate Verification page',148.5,136,{align:'center'});
  doc.setTextColor(30,39,51);doc.setFontSize(12);
  doc.text('________________________',55,168);
  doc.text('Director',55,176);
  doc.text('________________________',242,168);
  doc.text('Registrar',242,176);
  doc.save(`certificate_${cert.code}.pdf`);
}
