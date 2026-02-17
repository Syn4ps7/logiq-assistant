import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Fragment } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  { q: "Quels documents dois-je présenter ?", a: "Un document d'identité valide, votre permis de conduire (catégorie B, 2 ans minimum), et un moyen de paiement valide au nom du conducteur principal. Le conducteur doit être âgé d'au moins 21 ans (CGL, {Art. 2.1|article-2.1})." },
  { q: "Quelle est la franchise en cas de sinistre ?", a: "La franchise standard est de 2'000 CHF par sinistre responsable ou sans tiers identifié. Avec l'option Sérénité (49 CHF/location), elle est réduite à 500 CHF (CGL, {Art. 7.1|article-7.1} & {7.2|article-7.2}). Attention : certains dommages sont exclus de toute garantie (CGL, {Art. 7.3|article-7.3})." },
  { q: "Combien de kilomètres sont inclus ?", a: "100 km par jour de location sont inclus. Chaque km supplémentaire est facturé 0.70 CHF, calculé automatiquement au retour du véhicule (CGL, {Art. 5.2|article-5.2})." },
  { q: "Puis-je circuler à l'étranger ?", a: "Non. Le véhicule est strictement autorisé à circuler en Suisse et au Liechtenstein. Toute sortie du territoire sans accord écrit préalable entraîne l'annulation des garanties d'assurance, la responsabilité intégrale du locataire et une pénalité forfaitaire de 500 CHF (CGL, {Art. 2.2|article-2.2})." },
  { q: "Quelles sont les conditions d'annulation ?", a: "Plus de 48h avant le début : remboursement à 100 %. Entre 48h et 24h : remboursement à 50 %. Moins de 24h : aucun remboursement. Les frais de paiement ne sont pas remboursables. Délai bancaire de 5 à 10 jours ouvrés (CGL, {Art. 3.2|article-3.2})." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Visa, Mastercard, American Express et TWINT. Une empreinte bancaire (pré-autorisation) est requise avant le départ en guise de caution (CGL, {Art. 11|article-11}). Le paiement en espèces n'est pas accepté." },
  { q: "Le véhicule est-il assuré ?", a: "Oui, tous nos véhicules incluent l'assurance responsabilité civile (RC). La franchise standard est de 2'000 CHF, réductible à 500 CHF avec l'option Sérénité (49 CHF/location). Certaines situations sont exclues de toute garantie (CGL, {Art. 7|article-7})." },
  { q: "Comment fonctionne le chatbot ?", a: "Notre assistant en ligne peut vérifier la disponibilité, estimer des prix et répondre à vos questions sur les CGL. Aucune donnée personnelle n'est partagée sans votre consentement explicite (LPD, CGL {Art. 12|article-12})." },
];

const faqsEn: FaqItem[] = [
  { q: "What documents do I need?", a: "A valid ID, your driving licence (category B, minimum 2 years), and a valid payment method in the main driver's name. The driver must be at least 21 years old (T&Cs, {Art. 2.1|article-2.1})." },
  { q: "What is the deductible in case of damage?", a: "The standard deductible is CHF 2,000 per at-fault claim or claim without an identified third party. With the Serenity option (CHF 49/rental), it is reduced to CHF 500 (T&Cs, {Art. 7.1|article-7.1} & {7.2|article-7.2}). Note: certain damages are excluded from all coverage (T&Cs, {Art. 7.3|article-7.3})." },
  { q: "How many kilometres are included?", a: "100 km per rental day are included. Each extra km is charged at CHF 0.70, calculated automatically upon vehicle return (T&Cs, {Art. 5.2|article-5.2})." },
  { q: "Can I drive abroad?", a: "No. The vehicle is strictly authorised to circulate in Switzerland and Liechtenstein. Any cross-border travel without prior written agreement voids insurance coverage, makes the renter fully liable, and incurs a CHF 500 penalty (T&Cs, {Art. 2.2|article-2.2})." },
  { q: "What are the cancellation conditions?", a: "More than 48h before start: 100% refund. Between 48h and 24h: 50% refund. Less than 24h: no refund. Payment processing fees are non-refundable. Bank processing takes 5–10 business days (T&Cs, {Art. 3.2|article-3.2})." },
  { q: "What payment methods do you accept?", a: "Visa, Mastercard, American Express and TWINT. A card hold (pre-authorisation) is required before departure as a security deposit (T&Cs, {Art. 11|article-11}). Cash payments are not accepted." },
  { q: "Is the vehicle insured?", a: "Yes, all our vehicles include liability insurance (RC). The standard deductible is CHF 2,000, reducible to CHF 500 with the Serenity option (CHF 49/rental). Certain situations are excluded from all coverage (T&Cs, {Art. 7|article-7})." },
  { q: "How does the chatbot work?", a: "Our online assistant can check availability, estimate prices, or explain our T&Cs. No personal data is shared without your explicit consent (nFADP, T&Cs {Art. 12|article-12})." },
];

/** Parse `{label|anchor}` tokens into text + Link elements */
const renderAnswer = (text: string) => {
  const parts = text.split(/\{([^}]+)\}/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const [label, anchor] = part.split("|");
      if (anchor) {
        return (
          <Link
            key={i}
            to={`/cgl#${anchor}`}
            className="underline text-primary hover:text-primary/80 transition-colors"
          >
            {label}
          </Link>
        );
      }
      return <Fragment key={i}>{part}</Fragment>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const currentFaqs = i18n.language === "en" ? faqsEn : faqs;

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t("faq.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("faq.subtitle")}</p>

        <Accordion type="single" collapsible className="space-y-2">
          {currentFaqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium text-sm hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{renderAnswer(faq.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
};

export default FAQ;
