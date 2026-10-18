import { preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    const { data: account, error: accountError } = await service.from("app_records").select("data")
      .eq("collection", "admins").eq("id", caller.id).maybeSingle();
    if (accountError) throw accountError;
    if (account?.data.role !== "owner") return reply({ error: "Only the institute owner can restore a backup." }, 403);

    const { backup } = await request.json();
    const collections = [
      "programs", "posts", "events", "gallery", "students", "messages", "certificates",
      "notifications", "admins", "accessRequests", "schedule", "assignments", "materials",
      "submissions", "instructors", "resources", "examResults", "publicTimetable",
    ];
    if (!backup || backup.format !== "VIS_APPLICATION_BACKUP" || backup.schemaVersion !== 1
      || !backup.data || typeof backup.data !== "object" || !backup.data.settings
      || !collections.every((name) => Array.isArray(backup.data[name]))) {
      return reply({ error: "The supplied VIS backup is invalid." }, 400);
    }
    if (!backup.data.admins.some((admin: Record<string, unknown>) =>
      admin.id === caller.id && admin.role === "owner")) {
      return reply({ error: "The backup must include the currently signed-in owner account." }, 412);
    }
    const { error } = await service.rpc("vis_restore_backup", { backup_data: backup });
    if (error) throw error;
    return reply({ restored: true });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Backup restore failed." }, 500);
  }
});
