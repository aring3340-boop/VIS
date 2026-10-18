import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    const { submissionId } = await request.json();
    const { data: submission, error } = await service.from("app_records").select("data")
      .eq("collection", "submissions").eq("id", String(submissionId || "")).maybeSingle();
    if (error) throw error;
    if (!submission) return reply({ error: "Submission not found." }, 404);
    const record = submission.data;
    const role = await accountRole(caller.id);
    const allowed = ["owner", "admin"].includes(role)
      || (role === "teacher" && record.teacherId === caller.id)
      || (role === "student" && record.studentId === caller.id);
    const prefix = `submissions/${record.assignmentId}/${record.studentId}/`;
    if (!allowed || !record.filePath || !record.filePath.startsWith(prefix)) {
      return reply({ error: "You cannot access this submission file." }, 403);
    }
    const { data: signed, error: signedError } = await service.storage.from("vis-private")
      .createSignedUrl(record.filePath.slice("submissions/".length), 300, {
        download: String(record.fileName || "submission").replace(/["\\]/g, "_"),
      });
    if (signedError) throw signedError;
    return reply({ url: signed.signedUrl });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Could not create a download link." }, 500);
  }
});
