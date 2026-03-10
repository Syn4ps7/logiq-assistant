

const Legal = () => {
  return (
    <main className="py-12">
      <Helmet>
        <title>Mentions légales — LogIQ Transport</title>
        <meta name="description" content="Mentions légales de LogIQ Transport Sàrl, entreprise de location d'utilitaires sur la Riviera Vaudoise, Suisse." />
      </Helmet>

      <div className="container max-w-3xl prose prose-sm">
        <h1 className="text-3xl font-bold mb-2">Mentions légales</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 01/01/2026</p>

        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground">1. Éditeur du site</h2>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Raison sociale :</strong> LogIQ Transport Sàrl</li>
              <li><strong>Forme juridique :</strong> Société à responsabilité limitée (Sàrl) de droit suisse</li>
              <li><strong>Siège social :</strong> Vevey (VD), Suisse</li>
              <li><strong>E-mail :</strong> contact@logiq-transport.ch</li>
              <li><strong>Téléphone :</strong> 078 200 69 58</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">2. Hébergement</h2>
            <p>Le site est hébergé par Lovable (lovable.dev). Les données sont stockées sur des serveurs sécurisés.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">3. Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes, structure) est la propriété exclusive de LogIQ Transport Sàrl ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, est strictement interdite sans autorisation écrite préalable, conformément aux articles 2 et suivants de la Loi fédérale sur le droit d'auteur (LDA, RS 231.1).</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">4. Protection des données</h2>
            <p>LogIQ Transport Sàrl s'engage à respecter la Loi fédérale sur la protection des données (nLPD, RS 235.1) entrée en vigueur le 1er septembre 2023. Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter notre <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">5. Responsabilité</h2>
            <p>LogIQ Transport Sàrl s'efforce de fournir des informations exactes et à jour sur ce site. Toutefois, des erreurs ou omissions peuvent survenir. LogIQ Transport Sàrl ne saurait être tenue responsable de l'utilisation qui pourrait être faite des informations publiées, ni des dommages directs ou indirects en résultant.</p>
            <p className="mt-2">Les liens hypertextes vers des sites tiers sont fournis à titre informatif. LogIQ Transport Sàrl n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">6. Conditions générales de location</h2>
            <p>Les conditions régissant la location de véhicules sont détaillées dans nos <a href="/cgl" className="text-primary hover:underline">Conditions Générales de Location (CGL)</a>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">7. Droit applicable et for juridique</h2>
            <p>Le présent site et ses mentions légales sont régis par le droit suisse. Tout litige sera soumis aux tribunaux compétents du canton de Vaud, Suisse.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p>Pour toute question relative à ces mentions légales, vous pouvez nous contacter par e-mail à <a href="mailto:contact@logiq-transport.ch" className="text-primary hover:underline">contact@logiq-transport.ch</a> ou via notre <a href="/contact" className="text-primary hover:underline">formulaire de contact</a>.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Legal;
