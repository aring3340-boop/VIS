export async function sendTwilioMessage(
  phone: string,
  text: string,
  channel: "sms" | "whatsapp",
  template: "otp" | "message" = "message",
) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = channel === "sms" ? Deno.env.get("TWILIO_FROM_NUMBER") : Deno.env.get("TWILIO_WHATSAPP_FROM");
  if (!sid || !token || !from) throw new Error(`Twilio ${channel} settings are missing.`);

  const fields: Record<string, string> = {
    To: channel === "whatsapp" ? `whatsapp:${phone}` : phone,
    From: from,
  };
  if (channel === "whatsapp") {
    const templateSid = Deno.env.get(template === "otp"
      ? "TWILIO_WHATSAPP_OTP_TEMPLATE_SID"
      : "TWILIO_WHATSAPP_TEMPLATE_SID");
    if (!templateSid) throw new Error(`The approved Twilio WhatsApp ${template} template is not configured.`);
    fields.ContentSid = templateSid;
    fields.ContentVariables = JSON.stringify({ "1": text.slice(0, 1000) });
  } else {
    fields.Body = text.slice(0, 1500);
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(fields),
  });
  if (!response.ok) throw new Error(`Twilio ${channel} delivery failed with status ${response.status}.`);
}
