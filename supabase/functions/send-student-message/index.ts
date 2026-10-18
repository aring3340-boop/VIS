import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";
import { sendTwilioMessage } from "../_shared/twilio.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    if (await accountRole(caller.id) !== "teacher") return reply({ error: "Teacher access is required." }, 403);
    const body = await request.json();
    const requestedChannel = String(body.channel || "");
    const channel = requestedChannel === "sms" ? "sms" : requestedChannel === "whatsapp" ? "whatsapp" : null;
    const message = String(body.message || "").trim();
    const studentIds = Array.isArray(body.studentIds)
      ? [...new Set(body.studentIds.map(String))].slice(0, 100)
      : [];
    if (!channel || !message || message.length > 1000 || !studentIds.length) {
      return reply({ error: "Choose students, a delivery method, and a message of 1–1000 characters." }, 400);
    }
    const { data: rows, error } = await service.from("app_records")
      .select("id,data").eq("collection", "students").in("id", studentIds)
      .eq("data->>teacherId", caller.id);
    if (error) throw error;
    if (rows.length !== studentIds.length) return reply({ error: "One or more selected students are not assigned to you." }, 403);
    const consentField = channel === "sms" ? "smsOptIn" : "whatsappOptIn";
    const eligible = rows.filter((row) => row.data[consentField] === true
      && /^\+[1-9]\d{7,14}$/.test(String(row.data.phone || "")));
    const results = await Promise.allSettled(eligible.map((row) =>
      sendTwilioMessage(String(row.data.phone), message, channel)));
    const delivered = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.length - delivered;
    return reply({
      delivered,
      skipped: rows.length - eligible.length,
      failed,
      ...(failed ? { error: "Some messages could not be sent. Check Twilio logs and try again for the failed recipients." } : {}),
    });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Message delivery failed." }, 500);
  }
});
