update public.app_records
set data = data - 'smsOptIn' - 'whatsappOptIn' - 'messagingConsentAt'
where collection = 'students'
  and (data ? 'smsOptIn' or data ? 'whatsappOptIn' or data ? 'messagingConsentAt');
