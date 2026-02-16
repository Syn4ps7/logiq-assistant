import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="py-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Contact</h1>
        <p className="text-muted-foreground mb-10">Une question ? Nous sommes à votre disposition.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-lg font-semibold mb-4">Nos coordonnées</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">Route de la Riviera 12, 1800 Vevey, Suisse</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+41 21 123 45 67</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">info@logiq-transport.ch</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Horaires</p>
                  <p className="text-sm text-muted-foreground">Lun-Ven: 07h00-18h30</p>
                  <p className="text-sm text-muted-foreground">Sam: 08h00-12h00</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Formulaire de contact</h2>
            {submitted ? (
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
                <p className="font-medium text-primary">Merci pour votre message !</p>
                <p className="text-sm text-muted-foreground mt-1">Nous vous répondrons dans les meilleurs délais.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Nom complet</label>
                  <input required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input required type="email" maxLength={255} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea required rows={4} maxLength={1000} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
                </div>
                <Button variant="petrol" type="submit">Envoyer</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
