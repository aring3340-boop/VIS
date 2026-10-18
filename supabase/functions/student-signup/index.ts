import { preflight, reply, service } from "../_shared/http.ts";
import { sendTwilioMessage } from "../_shared/twilio.ts";

function normalizePhone(value: unknown) {
  return String(value || "").replace(/[ ()-]/g, "");
}

function otpDigest(phone: string, code: string, secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  ).then(async (key) => {
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${phone}:${code}`));
    return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  });
}

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const body = await request.json();
    const action = String(body.action || "");
    const phone = normalizePhone(body.phone);
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return reply({ error: "Enter a phone number in international format, such as +964…" }, 400);

    if (action === "send-code") {
      const username = String(body.username || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const dept = String(body.dept || "");
      const stage = Number(body.stage);
      const password = String(body.password || "");
      if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username) || name.length < 2 || name.length > 120
        || (email && !/^\S+@\S+\.\S+$/.test(email)) || !["it", "business", "health", "electrical"].includes(dept)
        || !Number.isInteger(stage) || stage < 1 || stage > 5 || password.length < 8
        || body.consent !== true) {
        return reply({ error: "Check the required details, password, and messaging consent." }, 400);
      }
      const { data: accountRows, error: accountError } = await service.from("app_records")
        .select("id,data").in("collection", ["students", "admins"]);
      if (accountError) throw accountError;
      if (accountRows.some((row) => String(row.data.username || "").toLowerCase() === username)
        || accountRows.some((row) => String(row.data.phone || "").replace(/[ ()-]/g, "") === phone)) {
        return reply({ error: "That username or phone number is already registered." }, 409);
      }
      const { data: existing, error: existingError } = await service.from("vis_student_signups")
        .select("status").eq("phone", phone).maybeSingle();
      if (existingError) throw existingError;
      if (existing?.status === "pending_approval" || existing?.status === "approved") {
        return reply({ error: "A registration for this phone is already awaiting approval or is approved." }, 409);
      }
      const expiredBefore = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { error: cleanupError } = await service.from("vis_student_signup_rate_limits")
        .delete().lt("window_started_at", expiredBefore);
      if (cleanupError) throw cleanupError;
      const { data: reserved, error: reserveError } = await service.rpc("vis_reserve_signup_send", {
        target_phone: phone,
      });
      if (reserveError) throw reserveError;
      if (!reserved) return reply({ error: "Wait one minute between codes; no more than five can be sent per hour." }, 429);

      const now = Date.now();
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
      const secret = Deno.env.get("SIGNUP_OTP_SECRET");
      if (!secret) throw new Error("Signup OTP secret is missing.");
      const candidate = { username, name, email: email || "", phone, dept, stage, consent: true, consentAt: new Date(now).toISOString() };
      const { error: saveError } = await service.from("vis_student_signups").upsert({
        phone,
        username,
        candidate,
        otp_hash: await otpDigest(phone, code, secret),
        otp_expires_at: new Date(now + 10 * 60 * 1000).toISOString(),
        otp_attempts: 0,
        status: "awaiting_verification",
        user_id: null,
      });
      if (saveError) throw saveError;
      await Promise.all([
        sendTwilioMessage(phone, `Your VIS verification code is ${code}. It expires in 10 minutes.`, "sms"),
        sendTwilioMessage(phone, code, "whatsapp", "otp"),
      ]);
      return reply({ sent: true });
    }

    if (action === "verify-code") {
      const code = String(body.code || "").trim();
      if (!/^\d{6}$/.test(code) || String(body.password || "").length < 8) {
        return reply({ error: "Enter the six-digit code and a password with at least 8 characters." }, 400);
      }
      const { data: signup, error } = await service.from("vis_student_signups")
        .select("*").eq("phone", phone).eq("status", "awaiting_verification").maybeSingle();
      if (error) throw error;
      if (!signup || !signup.otp_expires_at || Date.parse(signup.otp_expires_at) < Date.now()
        || signup.otp_attempts >= 5) return reply({ error: "The code is expired or no longer valid. Request a new one." }, 400);
      const secret = Deno.env.get("SIGNUP_OTP_SECRET");
      if (!secret) throw new Error("Signup OTP secret is missing.");
      if (await otpDigest(phone, code, secret) !== signup.otp_hash) {
        const { data: attempts, error: attemptError } = await service.rpc("vis_consume_signup_attempt", {
          target_phone: phone,
        });
        if (attemptError) throw attemptError;
        return reply({ error: attempts >= 5 ? "Too many incorrect codes. Request a new code." : "That code is not correct." }, 400);
      }

      const candidate = signup.candidate as Record<string, string | number | boolean>;
      const username = String(candidate.username);
      const { data: collisions, error: collisionError } = await service.from("app_records")
        .select("id,data").in("collection", ["students", "admins"]);
      if (collisionError) throw collisionError;
      if (collisions.some((row) => String(row.data.username || "").toLowerCase() === username)) {
        return reply({ error: "That username is already in use. Request a new code and choose another." }, 409);
      }
      const email = `${username.replace(/[^a-z0-9._-]/g, "")}@vis-student.edu.krd`;
      const { data: userData, error: createError } = await service.auth.admin.createUser({
        email,
        password: String(body.password || ""),
        email_confirm: true,
        phone,
        phone_confirm: true,
      });
      if (createError) return reply({ error: "Could not create the account. Check that the username and phone are not already registered." }, 409);
      const { error: updateError } = await service.from("vis_student_signups").update({
        status: "pending_approval",
        user_id: userData.user.id,
        otp_hash: null,
        otp_expires_at: null,
        otp_attempts: 0,
      }).eq("phone", phone).eq("status", "awaiting_verification");
      if (updateError) {
        await service.auth.admin.deleteUser(userData.user.id);
        throw updateError;
      }
      const { error: cleanupError } = await service.from("vis_student_signup_rate_limits").delete().eq("phone", phone);
      if (cleanupError) throw cleanupError;
      return reply({ pendingApproval: true });
    }

    return reply({ error: "Unknown signup action." }, 400);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Student signup failed." }, 500);
  }
});
