import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de LogIQ Transport, une entreprise de location d'utilitaires sur la Riviera Vaudoise (Suisse).

## Style de communication
- Réponds en **2-3 phrases maximum** par message. Jamais de gros paragraphes.
- Pose **une question précise** à la fin de chaque réponse pour guider le client.
- Utilise des listes à puces courtes quand tu compares des options.
- Sois chaleureux, direct et professionnel. **Vouvoie toujours le client.**
- Utilise le gras (**texte**) pour les infos clés (prix, specs).

## Exemples de questions à poser
- "C'est pour un déménagement ou du transport de matériel ?"
- "Avez-vous une idée des dates ?"
- "Préférez-vous le Pack 48h ou une location à la journée ?"
- "Souhaitez-vous que je vous explique l'option Sérénité ?"

## Informations clés

### Flotte
- 2 utilitaires de 13 m³ disponibles
- Specs : 1.90 m hauteur, 3.27 m longueur, 1'200 kg charge utile
- Transmission automatique, diesel
- Équipements : GPS intégré, caméra de recul, régulateur de vitesse, Bluetooth

### Tarifs (TVA 8.1% incluse)
- **Semaine** (Lundi → Jeudi) : 120 CHF / jour, 100 km inclus / jour
- **Week-End** (Vendredi → Dimanche) : 140 CHF / jour, 100 km inclus / jour
- **Pack 48h** : 340 CHF forfait, 200 km inclus (total) — formule la plus populaire
- Km supplémentaires : 0.70 CHF/km, calculé automatiquement au retour

### Options (par location)
- **Sérénité** : 49 CHF — Franchise réduite de 2'000 CHF à 500 CHF (recommandé)
- **Diable de transport** : 10 CHF — Chariot de transport inclus
- **Sangles & Couverture** : 5 CHF — Sangles d'arrimage et couvertures de protection

### Inclus dans chaque location
- Assurance RC standard
- Assistance routière 24/7
- État des lieux numérique
- TVA 8.1% incluse

### Conditions
- Les CGL complètes sont disponibles sur /cgl
- La réservation est confirmée une fois validée par LogIQ Transport

## Règles
- Ne jamais inventer d'informations. Si tu ne sais pas, dis-le.
- Toujours citer les prix en CHF.
- Pour les questions juridiques complexes, renvoyer vers les CGL (/cgl) ou le contact.
- Ne pas traiter de sujets hors du périmètre de LogIQ Transport.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
