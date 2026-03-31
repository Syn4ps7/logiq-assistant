import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, Globe, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { labelKey: "nav.vehicles", href: "/vehicles" },
  { labelKey: "nav.howItWorks", href: "/#comment-ca-marche" },
  { labelKey: "nav.rates", href: "/rates" },
  { labelKey: "nav.pro", href: "/pro", highlight: true },
  { labelKey: "nav.faq", href: "/faq" },
];

const LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
] as const;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [proName, setProName] = useState<string | null>(null);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("company_name, contact_name")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setProName(data.company_name || data.contact_name || null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) fetchProfile(session.user.id);
      else setProName(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const setLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("logiq-lang", code);
  };

  const currentLang = LANGS.find((l) => l.code === i18n.language) || LANGS[0];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border" role="banner">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" aria-label="LogIQ Transport - Accueil">
          <span className="text-xl font-extrabold text-primary tracking-tight">LogIQ</span>
          <span className="text-sm font-medium text-muted-foreground">Transport</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm transition-colors hover:text-primary ${
                link.highlight
                  ? "font-bold border border-foreground rounded-full px-3 py-1 text-foreground hover:bg-foreground/5"
                  : "font-medium"
              } ${
                (link.href.startsWith("/#") ? location.pathname === "/" && location.hash === link.href.slice(1) : location.pathname === link.href) ? (link.highlight ? "text-foreground" : "text-primary") : link.highlight ? "" : "text-muted-foreground"
              }`}
            >
              {link.highlight ? "Espace Pro" : t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn && proName && (
            <Link to="/pro-portal" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              {proName}
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors outline-none">
              <Globe className="h-3.5 w-3.5" />
              {currentLang.flag} {currentLang.code.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLang(lang.code)}
                  className={i18n.language === lang.code ? "bg-secondary" : ""}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/reservation">
            <Button variant="default" size="sm">{t("nav.book")}</Button>
          </Link>
          <button
            className="ml-2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-logiq-yellow-dark transition-colors"
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors outline-none">
              <Globe className="h-3.5 w-3.5" />
              {currentLang.flag}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLang(lang.code)}
                  className={i18n.language === lang.code ? "bg-secondary" : ""}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <nav className="md:hidden border-t border-border bg-background p-4" role="navigation" aria-label="Navigation mobile">
          <div className="flex flex-col gap-3">
            {isLoggedIn && proName && (
              <Link to="/pro-portal" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                {proName}
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  link.highlight
                    ? "border border-foreground text-foreground font-bold"
                    : ""
                } ${
                  (link.href.startsWith("/#") ? location.pathname === "/" && location.hash === link.href.slice(1) : location.pathname === link.href)
                    ? "bg-primary text-primary-foreground"
                    : link.highlight ? "" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.highlight ? "Espace Pro" : t(link.labelKey)}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Link to="/reservation" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="default" className="w-full" size="sm">{t("nav.book")}</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
