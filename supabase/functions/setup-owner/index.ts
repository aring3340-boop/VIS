import { preflight, reply, service } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return reply({ error: "Enter a name, valid email, and password with at least 8 characters." }, 400);
    }
    const { data, error } = await service.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name },
    });
    if (error) return reply({ error: error.message }, 400);

    const { error: bootstrapError } = await service.rpc("vis_bootstrap_owner", {
      owner_id: data.user.id, owner_email: email, owner_name: name,
    });
    if (bootstrapError) {
      await service.auth.admin.deleteUser(data.user.id);
      return reply({ error: bootstrapError.message }, 409);
    }
    return reply({ uid: data.user.id });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Owner setup failed." }, 500);
  }
});
