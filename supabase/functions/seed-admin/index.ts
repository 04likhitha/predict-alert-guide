import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    // --- STEP 1: Clean all user-related data ---
    // Delete in order to avoid FK issues
    await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('maintenance_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ai_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('alerts_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sensor_readings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('spare_parts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_roles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // --- STEP 2: Delete all existing auth users ---
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    if (existingUsers?.users) {
      for (const u of existingUsers.users) {
        await supabase.auth.admin.deleteUser(u.id);
      }
    }

    // --- STEP 3: Create fresh admin user ---
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "admin" },
    });

    if (createError) throw createError;
    const userId = newUser.user.id;

    // Assign admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "System reset complete. Admin account ready.",
        credentials: { email: ADMIN_EMAIL, username: "admin", password: ADMIN_PASSWORD },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("seed-admin error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to seed admin" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
