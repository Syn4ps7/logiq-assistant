import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-lg font-extrabold mb-3">
              <span className="text-primary">LogIQ</span>{" "}
              <span className="text-muted-foreground">Transport</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.description")}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vehicles" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.ourVehicles")}</Link></li>
              <li><Link to="/rates" className="text-muted-foreground hover:text-foreground transition-colors">{t("nav.rates")}</Link></li>
              <li><Link to="/reservation" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.booking")}</Link></li>
              <li><Link to="/pro" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.pro")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary">{t("footer.information")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">{t("nav.faq")}</Link></li>
              <li><Link to="/cgl" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.conditions")}</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.legal")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-primary">{t("nav.contact")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@logiq-transport.ch</li>
              <li>Tel: 078 200 69 58</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.location")}</p>
        </div>
      </div>
    </footer>
  );
}
