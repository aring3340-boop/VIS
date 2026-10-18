import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    const role = await accountRole(caller.id);
    if (!["owner", "admin", "teacher"].includes(role)) return reply({ error: "Staff access is required." }, 403);

    const body = await request.json();
    const studentId = String(body.studentId || "");
    const redirectTo = String(body.redirectTo || "");
    const { data: student, error } = await service.from("app_records").select("data")
      .eq("collection", "students").eq("id", studentId).maybeSingle();
    if (error) throw error;
    if (!student) return reply({ error: "Student not found." }, 404);
    if (role === "teacher" && student.data.teacherId !== caller.id
      && !(student.data.sharedWith || []).includes(caller.id)) {
      return reply({ error: "You cannot reset this student's password." }, 403);
    }
    const email = String(student.data.email || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return reply({ error: "The student has no valid recovery email." }, 400);
    const username = String(student.data.username || "").toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const authEmail = `${username}@vis-student.edu.krd`;
    const { data: link, error: linkError } = await service.auth.admin.generateLink({
      type: "recovery", email: authEmail, options: { redirectTo },
    });
    if (linkError) throw linkError;
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("EMAIL_FROM");
    if (!apiKey || !from) return reply({ error: "Password-reset email delivery is not configured." }, 503);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Reset your institute portal password",
        text: `Use this secure link to reset your password: ${link.properties.action_link}`,
      }),
    });
    if (!response.ok) return reply({ error: `Email delivery failed with status ${response.status}.` }, 503);
    return reply({ sent: true });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Password reset failed." }, 500);
  }
});
