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

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    let event: Stripe.Event;

    if (webhookSecret) {
      const body = await req.text();
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
      }
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      // Fallback: parse body directly (dev mode)
      const body = await req.json();
      event = body as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      // Handle option addition
      if (metadata.type === "option_addition" && metadata.reference) {
        const reference = metadata.reference;
        const newOptions = metadata.options || "";
        const amountPaid = (session.amount_total || 0) / 100;

        console.log(`[WEBHOOK] Option payment for ${reference}: ${newOptions} (${amountPaid} CHF)`);

        // Fetch current reservation
        const { data: reservation, error: fetchError } = await supabase
          .from("reservations")
          .select("options, total_chf, contact_name, contact_email, vehicle_name, start_date, end_date")
          .eq("reference", reference)
          .maybeSingle();

        if (fetchError || !reservation) {
          console.error("[WEBHOOK] Reservation not found:", reference);
          return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
        }

        // Merge options
        const existingOptions = reservation.options ? reservation.options : "";
        const mergedOptions = existingOptions
          ? `${existingOptions}, ${newOptions}`
          : newOptions;

        // Update total
        const newTotal = Number(reservation.total_chf) + amountPaid;

        const { error: updateError } = await supabase
          .from("reservations")
          .update({
            options: mergedOptions,
            total_chf: newTotal,
          })
          .eq("reference", reference);

        if (updateError) {
          console.error("[WEBHOOK] Update error:", updateError);
          return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
        }

        console.log(`[WEBHOOK] Updated ${reference}: options="${mergedOptions}", total=${newTotal}`);

        // Send confirmation email via EmailJS REST API
        try {
          const trackingUrl = `https://logiq-transport.ch/suivi?ref=${reference}`;
          const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_id: "service_g37dgi8",
              template_id: "template_51gqxra",
              user_id: "txxckOr0_mZu2OaXQ",
              template_params: {
                from_name: reservation.contact_name,
                from_email: reservation.contact_email,
                message: `[CONFIRMATION D'AJOUT D'OPTIONS - ${reference}]\n\nBonjour ${reservation.contact_name},\n\nVos options ont été ajoutées avec succès à votre réservation !\n\n📋 Référence : ${reference}\n🚛 Véhicule : ${reservation.vehicle_name}\n📅 Dates : ${reservation.start_date} → ${reservation.end_date}\n\n✅ Options ajoutées : ${newOptions}\n💰 Montant payé : ${amountPaid.toFixed(2)} CHF\n📦 Total options : ${mergedOptions}\n💵 Nouveau total : ${newTotal.toFixed(2)} CHF\n\n🔗 Suivez votre réservation : ${trackingUrl}\n\nMerci pour votre confiance !\nL'équipe LOGiQ Transport`,
              },
            }),
          });
          console.log(`[WEBHOOK] Email sent for ${reference}: status=${emailRes.status}`);
        } catch (emailErr) {
          console.error("[WEBHOOK] Email error (non-blocking):", emailErr);
        }
      }

      // Handle initial reservation payment
      if (!metadata.type && metadata.reference) {
        const { error: updateError } = await supabase
          .from("reservations")
          .update({ status: "paid" })
          .eq("reference", metadata.reference);

        if (updateError) {
          console.error("[WEBHOOK] Status update error:", updateError);
        } else {
          console.log(`[WEBHOOK] Reservation ${metadata.reference} marked as paid`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[WEBHOOK] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
});
