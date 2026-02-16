import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateUserConsent } from "@/lib/logiq";
import { useTranslation } from "react-i18next";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem("logiq-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("logiq-cookie-consent", "accepted");
    updateUserConsent({ cookies: true });
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("logiq-cookie-consent", "declined");
    updateUserConsent({ cookies: false });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-lg animate-fade-in-up" role="dialog" aria-label="Consentement aux cookies">
      <div className="container py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          {t("cookies.message")}{" "}
          <a href="/privacy" className="text-primary underline">{t("cookies.learnMore")}</a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>{t("cookies.decline")}</Button>
          <Button variant="petrol" size="sm" onClick={handleAccept}>{t("cookies.accept")}</Button>
        </div>
      </div>
    </div>
  );
}
