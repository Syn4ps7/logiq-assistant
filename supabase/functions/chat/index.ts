import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_BASE = `Tu es l'assistant virtuel de LogIQ Transport, une entreprise de location d'utilitaires sur la Riviera Vaudoise (Suisse).

## Style de communication
- Réponds en **2-3 phrases maximum** par message. Jamais de gros paragraphes.
- Pose **une question précise** à la fin de chaque réponse pour guider le client.
- Utilise des listes à puces courtes quand tu compares des options.
- Sois chaleureux, direct et professionnel. **Vouvoie toujours le client.**
- Utilise le gras (**texte**) pour les infos clés (prix, specs).

## Informations clés

### Flotte
- 2 utilitaires de 13 m³ disponibles
- Specs : 1.90 m hauteur, 3.27 m longueur, 1'200 kg charge utile
- Transmission automatique, diesel
- Équipements : GPS intégré, caméra de recul, régulateur de vitesse, Bluetooth

### Conditions
- Les CGL complètes sont disponibles sur /cgl
- La réservation est confirmée une fois validée par LogIQ Transport

## Règles
- Ne jamais inventer d'informations. Si tu ne sais pas, dis-le.
- Toujours citer les prix en CHF.
- Pour les questions juridiques complexes, renvoyer vers les CGL (/cgl) ou le contact.
- Ne pas traiter de sujets hors du périmètre de LogIQ Transport.`;

const PARTICULIER_CONTEXT = `
## Contexte : Client Particulier
Tu parles à un particulier. Concentre-toi sur les tarifs standard TTC et les packs week-end.

### Tarifs Particulier (TVA 8.1% incluse)
- **Semaine** (Lundi → Jeudi) : 120 CHF / jour, 100 km inclus / jour
- **Week-End** (Vendredi → Dimanche) : 140 CHF / jour, 100 km inclus / jour
- **Pack 48h** : 340 CHF forfait, 200 km inclus (total) — formule la plus populaire
- Km supplémentaires : 0.70 CHF/km, calculé automatiquement au retour

### Options (par location)
- **Sérénité** : 49 CHF — Franchise réduite de 2'000 CHF à 500 CHF (recommandé)
- **Diable de transport** : 10 CHF — Chariot de transport inclus
- **Sangles & Couverture** : 5 CHF — Sangles d'arrimage et couvertures de protection

### Inclus dans chaque location
- Assurance RC standard, Assistance routière 24/7, État des lieux numérique, TVA 8.1% incluse

### Questions types à poser
- "C'est pour un déménagement ou du transport de matériel ?"
- "Avez-vous une idée des dates ?"
- "Préférez-vous le Pack 48h ou une location à la journée ?"`;

const PRO_CONTEXT = `
## Contexte : Client Professionnel (B2B)
Tu parles à un professionnel / une entreprise. Concentre-toi sur les tarifs Pro HT, les Carnets et la facturation.

### Tarifs Pro Flex (HT, TVA 8.1% en sus)
- **Semaine** (Lun–Jeu) : 149 CHF HT / jour, 200 km inclus / jour
- **Week-End** (Ven–Dim) : 179 CHF HT / jour, 200 km inclus / jour
- **Pack 48h Pro** : 360 CHF HT forfait, 200 km inclus (total)
- Km supplémentaires : 0.60 CHF HT/km

### Carnets Pro Semaine (Lun–Jeu, prépayés, non remboursables)
- **Carnet 10 jours** : 1'290 CHF HT (129 CHF HT/jour)
- **Carnet 20 jours** : 2'440 CHF HT (122 CHF HT/jour)
- **Carnet 40 jours** : 4'600 CHF HT (115 CHF HT/jour)

### Facturation & Paiement B2B
- Prix affichés **HT**. TVA 8.1% ajoutée sur facture.
- Paiement immédiat par défaut (carte / lien de paiement).
- Facturation à **30 jours** possible après validation (contrat cadre, 3 locations sans incident, plafond d'encours 1'500–2'500 CHF).
- **Retard** : intérêt moratoire **5% l'an** + frais de rappel/recouvrement.
- Contestation : sous **5 jours ouvrables** après réception de la facture.
- Le Client Pro est responsable de ses conducteurs (âge, permis) et de tous frais liés.
- CGL B2B détaillées : /cgl#article-14

### Options Pro (par location)
- **Sérénité** : 49 CHF HT — Franchise réduite de 2'000 CHF à 500 CHF
- **Diable de transport** : 10 CHF HT
- **Sangles & Couverture** : 5 CHF HT

### Questions types à poser
- "Quel est votre besoin : location ponctuelle ou récurrente ?"
- "Souhaitez-vous un devis pour un Carnet Pro ?"
- "Avez-vous besoin d'une facturation à 30 jours ?"
- Page Pro : /pro — Formulaire compte Pro : /pro#form`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, clientType } = await req.json();
    const contextBlock = clientType === "pro" ? PRO_CONTEXT : PARTICULIER_CONTEXT;
    const systemPrompt = SYSTEM_PROMPT_BASE + "\n" + contextBlock;
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
            { role: "system", content: systemPrompt },
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
