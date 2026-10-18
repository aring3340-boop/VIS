import { reply, service } from "../_shared/http.ts";
import { sendTwilioMessage } from "../_shared/twilio.ts";

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!apiKey || !from) throw new Error("Resend email settings are missing.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!response.ok) throw new Error(`Email delivery failed with status ${response.status}.`);
}

async function deliver(student: Record<string, unknown>, subject: string, message: string, eventId: string) {
  const email = String(student.email || "").trim();
  const phone = String(student.phone || "").replace(/[ ()-]/g, "");
  const deliveryKey = `${eventId}:${String(student.id || "")}`;
  const { data: claim, error: claimError } = await service.from("vis_notification_deliveries")
    .upsert({ delivery_id: deliveryKey }, { onConflict: "delivery_id", ignoreDuplicates: true })
    .select("delivery_id").maybeSingle();
  if (claimError) throw claimError;
  if (!claim) return;
  try {
    if (student.emailOptIn === true && /^\S+@\S+\.\S+$/.test(email)) {
      await sendEmail(email, subject, message);
    }
    if (student.smsOptIn === true && /^\+[1-9]\d{7,14}$/.test(phone)) {
      await sendTwilioMessage(phone, message, "sms");
    }
    if (student.whatsappOptIn === true && /^\+[1-9]\d{7,14}$/.test(phone)) {
      await sendTwilioMessage(phone, message, "whatsapp");
    }
  } catch (error) {
    const { error: cleanupError } = await service.from("vis_notification_deliveries")
      .delete().eq("delivery_id", deliveryKey);
    if (cleanupError) throw cleanupError;
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const expected = Deno.env.get("VIS_NOTIFICATION_WEBHOOK_SECRET");
  if (!expected || request.headers.get("x-vis-webhook-secret") !== expected) {
    return reply({ error: "Unauthorized webhook." }, 401);
  }
  try {
    const event = await request.json();
    const record = event.record;
    const previous = event.old_record;
    if (!record || record.collection !== "notifications" && record.collection !== "students") {
      return reply({ ignored: true });
    }
    const isAnnouncement = record.collection === "notifications" && event.type === "INSERT";
    const isGradeChange = record.collection === "students" && event.type === "UPDATE"
      && JSON.stringify(previous?.data?.grades || []) !== JSON.stringify(record.data?.grades || []);
    if (!isAnnouncement && !isGradeChange) return reply({ ignored: true });

    const { data: rows, error } = await service.from("app_records").select("id,data").eq("collection", "students");
    if (error) throw error;
    const students = isGradeChange ? rows.filter((student) => student.id === record.id) : rows;
    const title = String(record.data.title_en || record.data.title_ku || "Institute announcement").slice(0, 160);
    const grades = (record.data.grades || []).map((grade: { subject?: string; score?: number }) =>
      `${grade.subject || ""}: ${grade.score || 0}%`).join("\n");
    const message = isAnnouncement
      ? `${title}\n\n${String(record.data.body_en || record.data.body_ku || "").slice(0, 1200)}`
      : grades ? `Your grades have been updated\n\n${grades}` : "Your grades have been updated";
    await Promise.all(students.map((student) => deliver(
      { id: student.id, ...student.data },
      isAnnouncement ? title : "Your grades have been updated",
      message,
      `${record.id}:${record.updated_at || record.data.updatedAt || event.type}`,
    )));
    return reply({ sent: students.length });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Notification delivery failed." }, 500);
  }
});
