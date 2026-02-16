export const CGL_VERSION = "01/01/2026";
export const CGL_HASH = "sha256-logiq-cgl-v20260101-v2";

export interface CGLArticle {
  id: string;
  title: string;
  content: string;
  subsections?: { id: string; title: string; content: string }[];
}

export const cglArticles: CGLArticle[] = [
  {
    id: "article-1",
    title: "Article 1 — Mentions Légales & Objet",
    content:
      "Les présentes Conditions Générales de Location (ci-après « CGL ») régissent les modalités de location de véhicules utilitaires proposés par LogIQ Transport Brissot (ci-après « Le Loueur »), service de location autonome accessible via plateforme numérique.",
    subsections: [
      {
        id: "article-1.1",
        title: "1.1 — Le Loueur",
        content:
          "LogIQ Transport Brissot, siège social à Vevey (1800), Suisse.",
      },
      {
        id: "article-1.2",
        title: "1.2 — Acceptation",
        content:
          "Toute réservation implique l'acceptation sans réserve des présentes CGL.",
      },
    ],
  },
  {
    id: "article-2",
    title: "Article 2 — Éligibilité & Conducteur",
    content:
      "Le locataire et tout conducteur supplémentaire doivent remplir les conditions suivantes :",
    subsections: [
      {
        id: "article-2.1",
        title: "2.1 — Conditions",
        content:
          "Être âgé d'au moins 21 ans. Être titulaires d'un permis de conduire valide (Catégorie B) depuis plus de 2 ans. Les permis étrangers hors UE/AELE doivent être accompagnés d'un permis international si rédigés dans une autre langue. Disposer d'un moyen de paiement valide au nom du conducteur principal.",
      },
      {
        id: "article-2.2",
        title: "2.2 — Périmètre de circulation & Territorialité",
        content:
          "Le véhicule est strictement autorisé à circuler sur le territoire de la Suisse et de la Principauté du Liechtenstein. Toute sortie du territoire national est formellement interdite, sauf accord écrit préalable et spécifique du Loueur. En cas de circulation hors des frontières autorisées sans accord préalable : (1) Les garanties d'assurance (Casco) et les services d'assistance sont de plein droit caducs. (2) Le Locataire devient intégralement responsable de l'ensemble des frais de remise en état, de rapatriement ou de remplacement du véhicule, quelle que soit la nature du sinistre. (3) Une pénalité forfaitaire de 500 CHF sera appliquée, sans préjudice des autres dommages et intérêts.",
      },
    ],
  },
  {
    id: "article-3",
    title: "Article 3 — Réservation, Modification & Annulation",
    content:
      "La réservation s'effectue exclusivement en ligne via l'application ou le site web dédié.",
    subsections: [
      {
        id: "article-3.1",
        title: "3.1 — Réservation",
        content:
          "Elle devient ferme après validation du paiement.",
      },
      {
        id: "article-3.2",
        title: "3.2 — Annulation",
        content:
          "Plus de 48h avant le début : Remboursement à 100 %. Entre 48h et 24h avant : Remboursement à 50 %. Moins de 24h avant : Aucun remboursement. Note : Les éventuels frais de paiement ou de plateforme (ex: Stripe) ne sont pas remboursables. Les remboursements validés sont effectués sous un délai bancaire de 5 à 10 jours ouvrés.",
      },
    ],
  },
  {
    id: "article-4",
    title: "Article 4 — Prise en charge & Restitution (Processus Autonome)",
    content: "",
    subsections: [
      {
        id: "article-4.1",
        title: "4.1 — État des lieux de départ",
        content:
          "Le locataire doit effectuer l'état des lieux numérique (photos via l'application) avant de déplacer le véhicule. ⚠ Important : À défaut de déclaration préalable via l'application, tout dommage constaté au retour sera réputé être survenu pendant la période de location et imputable au locataire.",
      },
      {
        id: "article-4.2",
        title: "4.2 — Restitution",
        content:
          "Le véhicule doit être restitué à l'emplacement exact de prise en charge, verrouillé, clés et boîtiers sécurisés. La location prend fin une fois l'état des lieux de retour validé numériquement.",
      },
    ],
  },
  {
    id: "article-5",
    title: "Article 5 — Tarifs & Kilométrage",
    content: "",
    subsections: [
      {
        id: "article-5.1",
        title: "5.1 — Tarifs",
        content:
          "Les tarifs appliqués sont ceux affichés lors de la réservation (Semaine / Week-end / Packs). Ils incluent l'assurance responsabilité civile (RC) obligatoire.",
      },
      {
        id: "article-5.2",
        title: "5.2 — Kilométrage",
        content:
          "Inclus : 100 km par jour de location. Supplément : 0.70 CHF / km excédentaire (facturé automatiquement au retour). Le tarif kilométrique correspond au coût réel d'usure, d'entretien et de décote du véhicule.",
      },
    ],
  },
  {
    id: "article-6",
    title: "Article 6 — Carburant & Énergie",
    content:
      "Le véhicule est fourni avec un niveau de carburant (généralement plein).",
    subsections: [
      {
        id: "article-6.1",
        title: "6.1 — Règle",
        content:
          "Le véhicule doit être restitué avec le même niveau de carburant qu'au départ.",
      },
      {
        id: "article-6.2",
        title: "6.2 — Défaut de niveau",
        content:
          "En cas de manquement, le carburant manquant sera facturé, majoré de frais de service de 30 CHF pour le déplacement. Le montant total sera débité automatiquement sur le moyen de paiement utilisé lors de la réservation.",
      },
    ],
  },
  {
    id: "article-7",
    title: "Article 7 — Assurance, Franchises & Exclusions",
    content: "",
    subsections: [
      {
        id: "article-7.1",
        title: "7.1 — Assurance Standard",
        content:
          "Incluse. Franchise (quote-part) : 2'000 CHF par sinistre responsable ou sans tiers identifié.",
      },
      {
        id: "article-7.2",
        title: "7.2 — Option « Sérénité » (Rachat partiel)",
        content:
          "Réduit la franchise à 500 CHF. Coût : 49 CHF par location (forfait).",
      },
      {
        id: "article-7.3",
        title: "7.3 — Exclusions Totales de Garantie",
        content:
          "L'assurance (même avec option Sérénité) ne couvre JAMAIS et laisse le locataire seul responsable des frais dans les cas suivants : Les dommages aux parties hautes (au-dessus du pare-brise) et basses (bas de caisse). Le locataire reconnaît avoir pris connaissance de la hauteur maximale affichée sur le tableau de bord et/ou dans l'application. Les dommages survenus lors d'une utilisation hors voirie publique (chantiers, terrains non stabilisés, chemins forestiers) sans accord préalable. Les dommages intérieurs (déchirures, taches). Le dépassement du Poids Total Autorisé (surcharge) du véhicule. L'erreur de carburant. La conduite sous emprise (alcool, drogues) ou la négligence grave.",
      },
    ],
  },
  {
    id: "article-8",
    title: "Article 8 — Accessoires & Matériel",
    content:
      "Les accessoires (Diable, Sangles, Couvertures) sont mis à disposition selon l'option choisie.",
    subsections: [
      {
        id: "article-8.1",
        title: "8.1 — Restitution",
        content:
          "Les accessoires sont réputés restitués conformes uniquement s'ils sont présents, non endommagés et rangés à leur emplacement d'origine. En cas de manquement, le matériel sera facturé au prix du neuf + frais de gestion. L'utilisation d'accessoires présents dans le véhicule mais non souscrits sera facturée a posteriori.",
      },
    ],
  },
  {
    id: "article-9",
    title: "Article 9 — Amendes & Contraventions",
    content:
      "Le locataire est seul responsable des infractions au Code de la route commises pendant la location. Le Loueur communiquera systématiquement l'identité du conducteur aux autorités.",
    subsections: [
      {
        id: "article-9.1",
        title: "9.1 — Frais de traitement",
        content:
          "Chaque amende traitée par LogIQ Transport (dénonciation) entraînera la facturation de 30 CHF de frais administratifs au locataire. Ces frais sont indépendants du montant de l'amende elle-même (qui reste due par le locataire).",
      },
    ],
  },
  {
    id: "article-10",
    title: "Article 10 — Pénalités & Frais Divers",
    content:
      "Le Loueur se réserve le droit de prélever sur la caution ou la carte bancaire :",
    subsections: [
      {
        id: "article-10.1",
        title: "10.1 — Barème",
        content:
          "Véhicule sale (intérieur/extérieur) : Forfait de 80 CHF à 150 CHF. Odeur de tabac / Animaux : 150 CHF (Désinfection). Retard de restitution : 50 CHF + coût de la location supplémentaire entamée. Perte de clés / Boîtier : 500 CHF. Intervention technique pour panne sèche ou perte de clés : Refacturation réelle + 100 CHF.",
      },
    ],
  },
  {
    id: "article-11",
    title: "Article 11 — Caution (Dépôt de garantie)",
    content:
      "Une empreinte bancaire (pré-autorisation non débitée) est requise avant le départ. Elle sert à garantir le paiement des éventuels dommages, suppléments kilométriques, carburant manquant ou pénalités.",
    subsections: [
      {
        id: "article-11.1",
        title: "11.1 — Rétention",
        content:
          "LogIQ Transport se réserve le droit de conserver tout ou partie de la caution jusqu'à résolution complète d'un sinistre ou litige en cours (ex: attente devis réparation). Sinon, elle est libérée automatiquement après la clôture conforme du dossier.",
      },
    ],
  },
  {
    id: "article-12",
    title: "Article 12 — Protection des Données (Géolocalisation & nLPD)",
    content:
      "Le locataire accepte que le véhicule soit équipé d'un boîtier télématique transmettant des données de position et d'état véhicule. Ces données sont utilisées pour la gestion du contrat, la facturation, et la récupération du véhicule en cas de vol ou de non-restitution. Elles ne sont conservées que pour la durée strictement nécessaire à l'exécution du contrat et aux obligations légales, conformément à la Loi fédérale sur la protection des données (LPD).",
  },
  {
    id: "article-13",
    title: "Article 13 — Droit Applicable & For Juridique",
    content:
      "Les présentes CGL sont soumises au droit suisse. En cas de litige, et à défaut d'accord amiable, le for juridique exclusif est situé à Vevey, en Suisse.",
  },
];
