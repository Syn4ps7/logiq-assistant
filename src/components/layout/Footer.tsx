import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">LogIQ Transport</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Location de véhicules utilitaires connectés sur la Riviera Vaudoise. Service professionnel et fiable.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-70">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vehicles" className="opacity-80 hover:opacity-100 transition-opacity">Nos véhicules</Link></li>
              <li><Link to="/rates" className="opacity-80 hover:opacity-100 transition-opacity">Tarifs</Link></li>
              <li><Link to="/reservation" className="opacity-80 hover:opacity-100 transition-opacity">Réservation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-70">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="opacity-80 hover:opacity-100 transition-opacity">FAQ</Link></li>
              <li><Link to="/cgl" className="opacity-80 hover:opacity-100 transition-opacity">Conditions générales</Link></li>
              <li><Link to="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">Confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider opacity-70">Contact</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>contact@logiq-transport.ch</li>
              <li>Tel: 078 200 69 58</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">© 2026 LogIQ Transport Sàrl — Tous droits réservés</p>
          <p className="text-xs opacity-60">Riviera Vaudoise, Suisse</p>
        </div>
      </div>
    </footer>
  );
}
