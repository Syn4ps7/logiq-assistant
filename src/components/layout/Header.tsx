import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const navLinks = [
  { labelKey: "nav.vehicles", href: "/vehicles" },
  { labelKey: "nav.rates", href: "/rates" },
  { labelKey: "nav.cgl", href: "/cgl" },
  { labelKey: "nav.faq", href: "/faq" },
  { labelKey: "nav.contact", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("logiq-lang", next);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b" role="banner">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" aria-label="LogIQ Transport - Accueil">
          <span className="text-xl font-bold text-primary tracking-tight">LogIQ</span>
          <span className="text-sm font-medium text-muted-foreground">Transport</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
          <Link to="/rates">
            <Button variant="outline" size="sm">{t("nav.viewRates")}</Button>
          </Link>
          <Link to="/reservation">
            <Button variant="petrol" size="sm">{t("nav.book")}</Button>
          </Link>
          <button
            className="ml-2 p-2 rounded-full bg-accent text-accent-foreground hover:bg-orange-light transition-colors"
            aria-label={t("nav.openChat")}
            onClick={() => {
              const el = document.getElementById("logiq-chatbot");
              if (el) el.classList.toggle("logiq-chatbot--active");
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
          <button
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden border-t bg-card p-4" role="navigation" aria-label="Navigation mobile">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t">
              <Link to="/rates" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">{t("nav.rates")}</Button>
              </Link>
              <Link to="/reservation" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="petrol" className="w-full" size="sm">{t("nav.book")}</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
