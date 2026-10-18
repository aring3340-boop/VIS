import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    const role = await accountRole(caller.id);
    const body = await request.json();
    const accountType = String(body.accountType || "student");
    const allowedTypes = ["student", "teacher", "admin", "content_editor"];
    if (!allowedTypes.includes(accountType)
      || (accountType === "student" && !["owner", "admin", "teacher"].includes(role))
      || (accountType === "teacher" && !["owner", "admin"].includes(role))
      || (["admin", "content_editor"].includes(accountType) && role !== "owner")) {
      return reply({ error: "You cannot create this account." }, 403);
    }
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      return reply({ error: "Enter a valid email and a password with at least 6 characters." }, 400);
    }
    const { data, error } = await service.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) return reply({ error: error.message }, 400);
    return reply({ uid: data.user.id });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Account creation failed." }, 500);
  }
});
