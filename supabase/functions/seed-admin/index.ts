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

    const ADMIN_EMAIL = "admin@greentech-grip.com";
    const ADMIN_PASSWORD = "admin123";

    // Check if admin already exists by listing users
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminUser = existingUsers?.users?.find((u: any) => u.email === ADMIN_EMAIL);

    let userId: string;

    if (adminUser) {
      userId = adminUser.id;
    } else {
      // Create admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: "Admin" },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Check if admin role already assigned
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!existingRole) {
      // Remove default operator role if exists
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "operator");

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (roleError) throw roleError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account ready",
        credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
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
