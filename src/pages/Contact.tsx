import { Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  return (
    <main className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">{t("contact.title")}</h1>
        <p className="text-muted-foreground mb-10">{t("contact.subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-lg font-semibold mb-4">{t("contact.coordinates")}</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t("contact.phone")}</p>
                  <p className="text-sm text-muted-foreground">078 200 69 58</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t("contact.email")}</p>
                  <p className="text-sm text-muted-foreground">contact@logiq-transport.ch</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{t("contact.availability")}</p>
                  <p className="text-sm text-muted-foreground">{t("contact.availabilityValue")}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">{t("contact.form")}</h2>
            {submitted ? (
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
                <p className="font-medium text-primary">{t("contact.thanks")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("contact.thanksDesc")}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.name")}</label>
                  <input required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.emailLabel")}</label>
                  <input required type="email" maxLength={255} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.message")}</label>
                  <textarea required rows={4} maxLength={1000} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
                </div>
                <Button variant="petrol" type="submit">{t("contact.send")}</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
