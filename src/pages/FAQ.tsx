import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const faqs = [
  { q: "Quels documents dois-je présenter ?", a: "Un document d'identité valide, votre permis de conduire (catégorie B, 2 ans minimum) et une carte de crédit à votre nom pour le dépôt de garantie." },
  { q: "Quelle est la franchise en cas de sinistre ?", a: "La franchise standard est de 2'000 CHF par événement. Avec l'option Sérénité+ (49 CHF/location), elle est réduite à 500 CHF." },
  { q: "Combien de kilomètres sont inclus ?", a: "150 km par jour de location sont inclus. Chaque km supplémentaire est facturé 0.45 CHF. L'option Km illimités (15 CHF/jour) supprime ce surcoût." },
  { q: "Puis-je circuler à l'étranger ?", a: "Oui, dans les pays limitrophes (France, Allemagne, Italie, Autriche, Liechtenstein) sans supplément. D'autres pays peuvent être ajoutés sur demande (30 CHF/pays/jour)." },
  { q: "Quelles sont les conditions d'annulation ?", a: "Annulation gratuite jusqu'à 72h avant. Entre 72h et 24h : 50% du montant. Moins de 24h : 100% du montant." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Visa, Mastercard, American Express et TWINT. Le virement bancaire est accepté pour les réservations de plus de 7 jours. Le paiement en espèces n'est pas accepté." },
  { q: "Le véhicule est-il assuré ?", a: "Oui, tous nos véhicules disposent d'une assurance RC et casco complète. Voir les détails dans nos Conditions Générales (Article 7)." },
  { q: "Comment fonctionne le chatbot ?", a: "Notre assistant en ligne peut vérifier la disponibilité, estimer des prix et répondre à vos questions sur les CGL. Aucune donnée personnelle n'est partagée sans votre consentement explicite (LPD)." },
];

const faqsEn = [
  { q: "What documents do I need?", a: "A valid ID, your driving license (category B, minimum 2 years) and a credit card in your name for the security deposit." },
  { q: "What is the deductible in case of damage?", a: "The standard deductible is CHF 2,000 per event. With the Serenity+ option (CHF 49/rental), it is reduced to CHF 500." },
  { q: "How many kilometres are included?", a: "150 km per rental day are included. Each extra km is charged at CHF 0.45. The Unlimited km option (CHF 15/day) removes this surcharge." },
  { q: "Can I drive abroad?", a: "Yes, in neighbouring countries (France, Germany, Italy, Austria, Liechtenstein) at no extra charge. Other countries can be added on request (CHF 30/country/day)." },
  { q: "What are the cancellation conditions?", a: "Free cancellation up to 72h before. Between 72h and 24h: 50% of the amount. Less than 24h: 100% of the amount." },
  { q: "What payment methods do you accept?", a: "Visa, Mastercard, American Express and TWINT. Bank transfer is accepted for bookings over 7 days. Cash payments are not accepted." },
  { q: "Is the vehicle insured?", a: "Yes, all our vehicles have full liability and comprehensive insurance. See details in our Terms & Conditions (Article 7)." },
  { q: "How does the chatbot work?", a: "Our online assistant can check availability, estimate prices, or explain our T&Cs. No personal data is shared without your explicit consent (nFADP)." },
];

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
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
};

export default FAQ;
