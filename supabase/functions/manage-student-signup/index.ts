import { accountRole, preflight, reply, service, signedInUser } from "../_shared/http.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  try {
    const caller = await signedInUser(request);
    if (!caller) return reply({ error: "Sign in first." }, 401);
    if (!["owner", "admin"].includes(await accountRole(caller.id))) {
      return reply({ error: "Administrator access is required." }, 403);
    }

    const body = await request.json();
    const action = String(body.action || "");
    if (action === "list") {
      const { data, error } = await service.from("vis_student_signups")
        .select("phone,username,candidate,created_at")
        .eq("status", "pending_approval").order("created_at", { ascending: true });
      if (error) throw error;
      return reply({ signups: data });
    }

    const phone = String(body.phone || "").replace(/[ ()-]/g, "");
    const { data: signup, error: signupError } = await service.from("vis_student_signups")
      .select("*").eq("phone", phone).eq("status", "pending_approval").maybeSingle();
    if (signupError) throw signupError;
    if (!signup?.user_id) return reply({ error: "That verified signup is no longer pending." }, 404);

    if (action === "approve") {
      const candidate = signup.candidate as Record<string, string | number | boolean>;
      const { error: recordError } = await service.from("app_records").upsert({
        collection: "students",
        id: signup.user_id,
        data: {
          username: signup.username,
          authEmail: `${signup.username.replace(/[^a-z0-9._-]/g, "")}@vis-student.edu.krd`,
          name_en: String(candidate.name),
          name_ku: "",
          dept: String(candidate.dept),
          stage: Number(candidate.stage),
          className: "",
          phone: signup.phone,
          email: String(candidate.email || ""),
          emailOptIn: false,
          smsOptIn: true,
          whatsappOptIn: true,
          messagingConsentAt: String(candidate.consentAt || ""),
          dob: "",
          grades: [],
          teacherId: "",
          sharedWith: [],
          attendance: 100,
          attMap: {},
          attendanceRecords: [],
        },
      }, { onConflict: "collection,id" });
      if (recordError) throw recordError;
      const { error } = await service.from("vis_student_signups")
        .update({ status: "approved" }).eq("phone", phone).eq("status", "pending_approval");
      if (error) throw error;
      return reply({ approved: true });
    }

    if (action === "reject") {
      const { error } = await service.from("vis_student_signups")
        .update({ status: "rejected" }).eq("phone", phone).eq("status", "pending_approval");
      if (error) throw error;
      const { error: deleteError } = await service.auth.admin.deleteUser(signup.user_id);
      if (deleteError) throw deleteError;
      return reply({ rejected: true });
    }

    return reply({ error: "Unknown signup action." }, 400);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Could not manage this signup." }, 500);
  }
});
