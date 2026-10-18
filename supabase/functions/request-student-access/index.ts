import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    if (await accountRole(caller.id) !== "teacher") return reply({ error: "Teacher access is required." }, 403);
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    if (!username || username.length > 80) return reply({ error: "Enter a student username." }, 400);

    const { data: students, error: studentError } = await service.from("app_records")
      .select("id,data").eq("collection", "students");
    if (studentError) throw studentError;
    const student = students.find((item) => String(item.data.username || "").toLowerCase() === username);
    if (!student) return reply({ error: "Student not found." }, 404);
    const ownerId = String(student.data.teacherId || "");
    if (!ownerId || ownerId === caller.id || (student.data.sharedWith || []).includes(caller.id)) {
      return reply({ error: "Access cannot be requested for this student." }, 409);
    }
    const { data: duplicate, error: duplicateError } = await service.from("app_records")
      .select("id").eq("collection", "accessRequests")
      .filter("data->>studentId", "eq", student.id)
      .filter("data->>requesterId", "eq", caller.id)
      .filter("data->>status", "eq", "pending").limit(1).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return reply({ error: "A request is already pending." }, 409);

    const { data: teacher, error: teacherError } = await service.from("app_records")
      .select("data").eq("collection", "admins").eq("id", caller.id).single();
    if (teacherError) throw teacherError;
    const id = crypto.randomUUID();
    const accessRequest = {
      studentId: student.id,
      studentName: student.data.name_en || username,
      ownerId,
      requesterId: caller.id,
      requesterName: teacher.data.name || "Teacher",
      status: "pending",
      date: new Date().toISOString(),
    };
    const { error } = await service.from("app_records").insert({ collection: "accessRequests", id, data: accessRequest });
    if (error) throw error;
    return reply({ id, request: accessRequest });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Access request failed." }, 500);
  }
});
