import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, sensorData, assetId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "failure_prediction") {
      systemPrompt = `You are a predictive maintenance AI for renewable energy assets. Analyze sensor data and predict failures using Random Forest Classifier logic. Return structured JSON with failure_type, probability, confidence, feature_importance (object with feature names as keys and importance 0-1 as values), and recommendations array.`;
      userPrompt = `Analyze this sensor data for asset ${assetId} and predict potential failures:\n${JSON.stringify(sensorData, null, 2)}\n\nReturn JSON with: failure_type (normal/inverter_failure/gearbox_failure/panel_hotspot/generator_failure), probability (0-1), confidence (0-1), feature_importance (object), risk_level (low/medium/high/critical), recommendations (array of strings).`;
    } else if (type === "rul_prediction") {
      systemPrompt = `You are a Remaining Useful Life (RUL) prediction AI using Random Forest Regressor logic. Estimate hours until maintenance is needed based on sensor data trends. Return structured JSON.`;
      userPrompt = `Estimate Remaining Useful Life for asset ${assetId} based on:\n${JSON.stringify(sensorData, null, 2)}\n\nReturn JSON with: rul_hours (number), confidence (0-1), degradation_rate (percentage per day), next_maintenance_date (ISO string), feature_importance (object), contributing_factors (array of strings).`;
    } else if (type === "anomaly_detection") {
      systemPrompt = `You are an anomaly detection AI for IoT sensor data. Identify unusual patterns that may indicate equipment issues. Return structured JSON.`;
      userPrompt = `Detect anomalies in this sensor data for asset ${assetId}:\n${JSON.stringify(sensorData, null, 2)}\n\nReturn JSON with: is_anomaly (boolean), anomaly_score (0-1), anomalies (array of {parameter, value, expected_range, severity}), root_cause (string), recommended_actions (array of strings).`;
    } else if (type === "maintenance_recommendation") {
      systemPrompt = `You are a maintenance planning AI. Generate actionable maintenance recommendations based on asset condition and predictions.`;
      userPrompt = `Generate maintenance recommendations for asset ${assetId}:\n${JSON.stringify(sensorData, null, 2)}\n\nReturn JSON with: urgency (low/medium/high/critical), tasks (array of {title, description, estimated_hours, required_parts, priority}), estimated_downtime_hours (number), cost_estimate (number), risk_if_delayed (string).`;
    } else {
      throw new Error(`Unknown prediction type: ${type}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch {
      parsedResult = { raw: content };
    }

    // Store prediction in database
    await supabase.from("ai_predictions").insert({
      asset_id: assetId,
      prediction_type: type.replace("_prediction", "").replace("_detection", "").replace("_recommendation", ""),
      result: parsedResult,
      confidence: parsedResult.confidence || null,
      model_used: "google/gemini-3-flash-preview",
    });

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
