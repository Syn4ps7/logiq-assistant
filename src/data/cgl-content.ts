export const CGL_VERSION = "01/01/2026";
export const CGL_HASH = "sha256-logiq-cgl-v20260101";

export interface CGLArticle {
  id: string;
  title: string;
  content: string;
  subsections?: { id: string; title: string; content: string }[];
}

export const cglArticles: CGLArticle[] = [
  {
    id: "article-1",
    title: "Article 1 — Objet et champ d'application",
    content: "Les présentes Conditions Générales de Location (ci-après « CGL ») régissent l'ensemble des relations contractuelles entre LogIQ Transport Sàrl, sise Route de la Riviera 12, 1800 Vevey (ci-après « le Loueur ») et toute personne physique ou morale procédant à la location d'un véhicule utilitaire (ci-après « le Locataire »).",
    subsections: [
      { id: "article-1.1", title: "1.1 — Acceptation", content: "La signature du contrat de location ou la validation d'une réservation en ligne emporte acceptation pleine et entière des présentes CGL. Toute clause contraire proposée par le Locataire est inopposable au Loueur, sauf accord écrit exprès." },
      { id: "article-1.2", title: "1.2 — Modifications", content: "Le Loueur se réserve le droit de modifier les présentes CGL. La version applicable est celle en vigueur au jour de la conclusion du contrat. Toute modification sera publiée sur le site logiq-transport.ch/cgl." },
    ],
  },
  {
    id: "article-2",
    title: "Article 2 — Conditions de location",
    content: "La location est réservée aux personnes remplissant les conditions suivantes :",
    subsections: [
      { id: "article-2.1", title: "2.1 — Âge et permis", content: "Le Locataire doit être âgé de 21 ans révolus et être titulaire d'un permis de conduire valable de catégorie B depuis au moins 2 ans. Un permis de catégorie C peut être exigé pour certains véhicules de plus de 3.5 tonnes." },
      { id: "article-2.2", title: "2.2 — Documents requis", content: "Le Locataire devra présenter : un document d'identité en cours de validité (carte d'identité ou passeport), son permis de conduire original, une carte de crédit à son nom pour le dépôt de garantie." },
      { id: "article-2.3", title: "2.3 — Garantie", content: "Un dépôt de garantie de CHF 2'000.— est exigé à la prise en charge du véhicule, prélevé par empreinte de carte de crédit. Ce montant correspond à la franchise standard en cas de sinistre." },
    ],
  },
  {
    id: "article-3",
    title: "Article 3 — Réservation et prise en charge",
    content: "La réservation peut s'effectuer en ligne via le site logiq-transport.ch, par téléphone ou en agence.",
    subsections: [
      { id: "article-3.1", title: "3.1 — Confirmation", content: "Toute réservation est confirmée par l'envoi d'un e-mail de confirmation comprenant le numéro de réservation, les dates et horaires, le véhicule attribué et le prix total estimé. La réservation n'est définitive qu'après réception du paiement d'acompte de 30% du montant total." },
      { id: "article-3.2", title: "3.2 — Prise en charge", content: "La prise en charge s'effectue à l'adresse du Loueur aux heures d'ouverture (lundi-vendredi 07h00-18h30, samedi 08h00-12h00). Un état des lieux contradictoire est établi au départ et au retour. Le Locataire est tenu de signaler tout dommage ou anomalie non mentionné sur l'état des lieux au moment de la prise en charge." },
      { id: "article-3.3", title: "3.3 — Retard à la prise en charge", content: "En cas de retard de plus de 2 heures sans notification préalable, le Loueur se réserve le droit d'annuler la réservation sans remboursement de l'acompte." },
    ],
  },
  {
    id: "article-4",
    title: "Article 4 — Tarification et paiement",
    content: "Les tarifs sont indiqués en francs suisses (CHF), toutes taxes comprises (TVA 8.1% incluse).",
    subsections: [
      { id: "article-4.1", title: "4.1 — Tarif journalier", content: "Le tarif journalier est fixé selon le véhicule choisi et la durée de location. Des tarifs dégressifs s'appliquent à partir de 3 jours consécutifs : -10% de 3 à 6 jours, -15% de 7 à 13 jours, -20% à partir de 14 jours." },
      { id: "article-4.2", title: "4.2 — Kilomètres", content: "Le tarif journalier inclut 150 km par jour de location. Tout kilomètre supplémentaire est facturé CHF 0.45/km. L'option « Km illimités » (CHF 15.—/jour) supprime tout surcoût kilométrique." },
      { id: "article-4.3", title: "4.3 — Carburant", content: "Le véhicule est remis avec le plein de carburant. Le Locataire s'engage à le restituer avec le même niveau. À défaut, le carburant manquant sera facturé au tarif de CHF 2.80/litre, majoré de frais de service de CHF 25.—." },
      { id: "article-4.4", title: "4.4 — Modes de paiement", content: "Sont acceptés : carte de crédit (Visa, Mastercard, American Express), TWINT, virement bancaire (pour les réservations anticipées de plus de 7 jours). Le paiement en espèces n'est pas accepté." },
    ],
  },
  {
    id: "article-5",
    title: "Article 5 — Annulation",
    content: "Les conditions d'annulation suivantes s'appliquent :",
    subsections: [
      { id: "article-5.1", title: "5.1 — Annulation par le Locataire", content: "Annulation gratuite jusqu'à 72 heures avant le début de la location. Entre 72h et 24h : 50% du montant total est dû. Moins de 24h ou non-présentation : 100% du montant total est dû." },
      { id: "article-5.2", title: "5.2 — Annulation par le Loueur", content: "Le Loueur se réserve le droit d'annuler une réservation en cas de force majeure, de panne ou d'indisponibilité du véhicule. En cas d'annulation par le Loueur, le Locataire sera intégralement remboursé et, dans la mesure du possible, un véhicule de catégorie équivalente ou supérieure lui sera proposé sans supplément." },
    ],
  },
  {
    id: "article-6",
    title: "Article 6 — Obligations du Locataire",
    content: "Pendant toute la durée de la location, le Locataire s'engage à :",
    subsections: [
      { id: "article-6.1", title: "6.1 — Utilisation conforme", content: "Utiliser le véhicule en bon père de famille, conformément à sa destination (transport de marchandises, déménagement). L'utilisation pour des compétitions, des épreuves de vitesse, le transport de matières dangereuses, inflammables ou illicites est strictement interdite." },
      { id: "article-6.2", title: "6.2 — Conducteurs autorisés", content: "Seul le Locataire et les conducteurs supplémentaires déclarés et validés par le Loueur sont autorisés à conduire le véhicule. Tout conducteur non déclaré entraîne la déchéance automatique de toute couverture d'assurance." },
      { id: "article-6.3", title: "6.3 — Entretien courant", content: "Le Locataire est responsable de la vérification régulière des niveaux (huile, liquide de refroidissement, pression des pneus). En cas de voyant d'alerte, le Locataire doit immédiatement contacter le Loueur et ne pas poursuivre le trajet si le véhicule représente un danger." },
      { id: "article-6.4", title: "6.4 — Infractions", content: "Toute infraction au code de la route commise pendant la période de location est de la responsabilité exclusive du Locataire. Les amendes et frais de dossier (CHF 50.— par infraction) seront refacturés au Locataire." },
    ],
  },
  {
    id: "article-7",
    title: "Article 7 — Assurance et franchise",
    content: "Tous les véhicules sont assurés en responsabilité civile et casco complète.",
    subsections: [
      { id: "article-7.1", title: "7.1 — Couverture RC", content: "L'assurance responsabilité civile couvre les dommages corporels et matériels causés aux tiers, conformément à la Loi fédérale sur la circulation routière (LCR). La couverture maximale est de CHF 10'000'000.— par sinistre." },
      { id: "article-7.2", title: "7.2 — Franchise standard", content: "La franchise standard en cas de sinistre est de CHF 2'000.— par événement, que le Locataire soit responsable ou non. La franchise est réduite à CHF 500.— avec l'option Sérénité+ (CHF 25.—/jour)." },
      { id: "article-7.3", title: "7.3 — Exclusions de couverture", content: "Sont exclus de toute couverture d'assurance : les dommages résultant d'une conduite en état d'ébriété ou sous l'emprise de stupéfiants ; les dommages causés intentionnellement ; les dommages au chargement ; les dommages à la partie supérieure du véhicule (toit, galerie) résultant d'un passage sous un obstacle de hauteur insuffisante ; l'utilisation du véhicule en dehors du territoire autorisé ; les dommages résultant d'un conducteur non déclaré." },
      { id: "article-7.4", title: "7.4 — Déclaration de sinistre", content: "En cas d'accident, le Locataire doit : sécuriser les lieux et appeler les secours si nécessaire, contacter le Loueur dans les 2 heures suivant le sinistre, remplir un constat amiable, ne jamais reconnaître sa responsabilité sur les lieux. Le non-respect de cette procédure peut entraîner la prise en charge intégrale des dommages par le Locataire." },
    ],
  },
  {
    id: "article-8",
    title: "Article 8 — Territoire de circulation",
    content: "Sauf accord écrit préalable du Loueur, la circulation est limitée au territoire suisse et aux pays limitrophes (France, Allemagne, Italie, Autriche, Liechtenstein).",
    subsections: [
      { id: "article-8.1", title: "8.1 — Extension de territoire", content: "Toute extension de territoire doit être demandée au minimum 48 heures avant le départ et fait l'objet d'un supplément de CHF 30.— par pays additionnel et par jour." },
      { id: "article-8.2", title: "8.2 — Interdictions", content: "La circulation dans les pays suivants est strictement interdite : tous les pays hors UE/AELE non mentionnés ci-dessus. Toute infraction à cette clause entraîne la déchéance immédiate de l'assurance." },
    ],
  },
  {
    id: "article-9",
    title: "Article 9 — Restitution du véhicule",
    content: "Le véhicule doit être restitué à la date, à l'heure et au lieu convenus dans le contrat de location.",
    subsections: [
      { id: "article-9.1", title: "9.1 — État de restitution", content: "Le véhicule doit être restitué dans l'état où il a été pris en charge, propre intérieurement. Des frais de nettoyage de CHF 150.— seront facturés si le véhicule est restitué sale. En cas de dommages constatés au retour non déclarés, la franchise intégrale sera automatiquement débitée." },
      { id: "article-9.2", title: "9.2 — Retard de restitution", content: "Tout retard de restitution non signalé à l'avance sera facturé comme suit : jusqu'à 1 heure de retard : tolérance gratuite ; de 1h à 4h : CHF 50.— ; plus de 4h : facturation d'une journée supplémentaire complète. Au-delà de 24h de retard sans contact, le Loueur se réserve le droit de signaler le véhicule comme non restitué aux autorités." },
    ],
  },
  {
    id: "article-10",
    title: "Article 10 — Protection des données (LPD)",
    content: "Conformément à la Loi fédérale sur la protection des données (LPD, nLPD du 1er septembre 2023), le Loueur s'engage à protéger les données personnelles du Locataire.",
    subsections: [
      { id: "article-10.1", title: "10.1 — Données collectées", content: "Les données personnelles collectées sont : nom, prénom, adresse, date de naissance, numéro de téléphone, adresse e-mail, numéro de permis de conduire, données de carte de crédit (stockées de manière sécurisée par notre prestataire de paiement certifié PCI DSS). Ces données sont traitées uniquement pour l'exécution du contrat de location." },
      { id: "article-10.2", title: "10.2 — Télématique et géolocalisation", content: "Les véhicules peuvent être équipés de systèmes de géolocalisation. L'activation de ces systèmes est soumise au consentement explicite du Locataire. Les données de géolocalisation ne sont utilisées qu'en cas de vol déclaré, de non-restitution du véhicule, ou à des fins d'assistance routière sur demande du Locataire." },
      { id: "article-10.3", title: "10.3 — Droits du Locataire", content: "Le Locataire dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données. Toute demande doit être adressée par écrit à privacy@logiq-transport.ch. Le Loueur s'engage à répondre dans un délai de 30 jours." },
      { id: "article-10.4", title: "10.4 — Chatbot et IA", content: "L'utilisation du chatbot sur le site logiq-transport.ch est facultative. Aucune donnée personnelle n'est transmise à des fournisseurs d'IA tiers sans le consentement explicite et éclairé du Locataire. Les conversations avec le chatbot sont conservées pendant 90 jours maximum à des fins d'amélioration du service, sauf demande de suppression anticipée." },
    ],
  },
  {
    id: "article-11",
    title: "Article 11 — Responsabilité",
    content: "La responsabilité du Loueur se limite à la mise à disposition d'un véhicule conforme et en bon état de fonctionnement.",
    subsections: [
      { id: "article-11.1", title: "11.1 — Limitation", content: "Le Loueur décline toute responsabilité pour les dommages indirects, les pertes d'exploitation, les retards ou les dommages au chargement du Locataire. La responsabilité totale du Loueur est limitée au montant de la location." },
      { id: "article-11.2", title: "11.2 — Force majeure", content: "Le Loueur ne saurait être tenu responsable de l'inexécution de ses obligations en cas de force majeure (catastrophes naturelles, pandémie, grève, décision gouvernementale, etc.)." },
    ],
  },
  {
    id: "article-12",
    title: "Article 12 — Droit applicable et for juridique",
    content: "Les présentes CGL sont régies par le droit suisse. Tout litige relatif à l'interprétation ou à l'exécution des présentes CGL sera soumis à la compétence exclusive des tribunaux de l'arrondissement de la Riviera-Pays-d'Enhaut, canton de Vaud, Suisse.",
    subsections: [
      { id: "article-12.1", title: "12.1 — Médiation", content: "Avant toute action judiciaire, les parties s'engagent à tenter une médiation amiable. À défaut d'accord dans un délai de 30 jours à compter de la demande de médiation, chaque partie retrouve sa liberté d'action." },
    ],
  },
];
