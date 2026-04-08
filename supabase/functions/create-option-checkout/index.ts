import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { reference, customerEmail, optionNames, totalAmountCHF } = await req.json();

    if (!reference || !customerEmail || !optionNames || !totalAmountCHF) {
      throw new Error("Missing required fields");
    }

    if (typeof totalAmountCHF !== "number" || totalAmountCHF <= 0) {
      throw new Error("Invalid amount");
    }

    const amountInCentimes = Math.round(totalAmountCHF * 100);

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: `Options supplémentaires — ${reference}`,
              description: optionNames.join(", "),
            },
            unit_amount: amountInCentimes,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        reference,
        type: "option_addition",
        options: optionNames.join(", "),
      },
      success_url: `${req.headers.get("origin")}/suivi?ref=${reference}&options_added=true`,
      cancel_url: `${req.headers.get("origin")}/suivi?ref=${reference}&options_canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-OPTION-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
