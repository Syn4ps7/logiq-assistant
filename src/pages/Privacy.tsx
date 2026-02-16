const Privacy = () => {
  return (
    <main className="py-12">
      <div className="container max-w-3xl prose prose-sm">
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité & Cookies</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 01/01/2026</p>

        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground">1. Responsable du traitement</h2>
            <p>LogIQ Transport Sàrl, Route de la Riviera 12, 1800 Vevey, Suisse. Contact : privacy@logiq-transport.ch</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">2. Données collectées</h2>
            <p>Nous collectons les données strictement nécessaires à l'exécution du contrat de location : nom, prénom, adresse, date de naissance, numéro de téléphone, adresse e-mail, numéro de permis de conduire. Les données de carte de crédit sont traitées de manière sécurisée par notre prestataire certifié PCI DSS.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">3. Base légale</h2>
            <p>Le traitement est fondé sur l'exécution du contrat (art. 31 al. 2 let. a nLPD) et, pour les cookies non essentiels et la géolocalisation, sur votre consentement explicite.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">4. Cookies</h2>
            <p>Nous utilisons des cookies essentiels (fonctionnement du site) et des cookies analytiques (GA4, uniquement avec votre consentement). Vous pouvez modifier vos préférences à tout moment.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">5. Géolocalisation & Télématique</h2>
            <p>Nos véhicules peuvent être équipés de systèmes de géolocalisation. L'activation est soumise à votre consentement explicite. Les données ne sont utilisées qu'en cas de vol, de non-restitution ou d'assistance routière à votre demande.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">6. Chatbot & Intelligence artificielle</h2>
            <p>L'utilisation du chatbot est facultative. Aucune donnée personnelle n'est transmise à des fournisseurs d'IA tiers sans consentement explicite. Les conversations sont conservées 90 jours maximum.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">7. Vos droits</h2>
            <p>Conformément à la nLPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité. Adressez vos demandes à privacy@logiq-transport.ch. Délai de réponse : 30 jours.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">8. Durée de conservation</h2>
            <p>Les données liées aux contrats de location sont conservées 10 ans conformément aux obligations légales suisses (CO art. 958f). Les données de navigation sont conservées 13 mois maximum.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Privacy;
