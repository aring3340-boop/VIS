import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const service = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight(request: Request) {
  return request.method === "OPTIONS" ? new Response("ok", { headers: corsHeaders }) : null;
}

export async function signedInUser(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { data, error } = await service.auth.getUser(authorization.slice(7));
  return error ? null : data.user;
}

export async function accountRole(userId: string) {
  const { data, error } = await service.from("app_records")
    .select("data").eq("collection", "admins").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (data) return String(data.data.role || "");
  const { data: student, error: studentError } = await service.from("app_records")
    .select("id").eq("collection", "students").eq("id", userId).maybeSingle();
  if (studentError) throw studentError;
  return student ? "student" : "";
}
