import { Phone, Mail, Clock, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await emailjs.send(
        "service_g37dgi8",
        "template_51gqxra",
        {
          from_name: name,
          from_email: email,
          message: message,
        },
        "txxckOr0_mZu2OaXQ"
      );
      setSubmitted(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      toast.error(t("contact.sendError", "Erreur lors de l'envoi. Veuillez réessayer."));
    } finally {
      setSending(false);
    }
  };

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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-3"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <p className="font-semibold text-primary text-lg">{t("contact.thanks")}</p>
                <p className="text-sm text-muted-foreground">{t("contact.thanksDesc")}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.name")}</label>
                  <input required type="text" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.emailLabel")}</label>
                  <input required type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("contact.message")}</label>
                  <textarea required rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
                </div>
                <Button variant="petrol" type="submit" disabled={sending}>
                  {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("contact.send")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
