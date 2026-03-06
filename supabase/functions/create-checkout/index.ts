import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const {
      reference,
      customerEmail,
      customerName,
      description,
      amountCHF,
    } = await req.json();

    if (!amountCHF || !customerEmail || !reference) {
      throw new Error("Missing required fields: amountCHF, customerEmail, reference");
    }

    // Amount in centimes (CHF minor unit)
    const amountInCentimes = Math.round(amountCHF * 100);

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: `Réservation ${reference}`,
              description: description || "Location de véhicule utilitaire",
            },
            unit_amount: amountInCentimes,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        reference,
        customer_name: customerName || "",
      },
      success_url: `${req.headers.get("origin")}/reservation?success=true&ref=${reference}`,
      cancel_url: `${req.headers.get("origin")}/reservation?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
