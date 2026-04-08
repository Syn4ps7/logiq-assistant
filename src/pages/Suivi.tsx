import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSeo } from "@/hooks/use-seo";
import { motion } from "framer-motion";
import { Search, Truck, CalendarDays, MapPin, Phone, Mail, Package, AlertCircle, CheckCircle2, Clock, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const fmtCHF = (v: number) => Number(v).toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800 border-amber-300", icon: <Clock className="w-3.5 h-3.5" /> },
  paid: { label: "Confirmée", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  canceled: { label: "Annulée", color: "bg-destructive/10 text-destructive border-destructive/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

interface Reservation {
  reference: string;
  vehicle_name: string;
  vehicle_id: string;
  plan: string;
  pack: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  days: number;
  est_km: number;
  options: string | null;
  total_chf: number;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_npa: string | null;
  source: string;
  created_at: string;
  discount_percent: number | null;
  discount_amount: number | null;
  promo_code: string | null;
}

const Suivi = () => {
  useSeo("Suivi de réservation | Ütiboo", "Consultez les détails de votre réservation et demandez une modification.");

  const [searchParams] = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") || "");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Modification request
  const [showModForm, setShowModForm] = useState(false);
  const [modMessage, setModMessage] = useState("");
  const [modSending, setModSending] = useState(false);
  const [modSent, setModSent] = useState(false);

  const lookup = async (refCode?: string) => {
    const code = (refCode || ref).trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setNotFound(false);
    setReservation(null);
    setShowModForm(false);
    setModSent(false);

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("reference", code)
      .maybeSingle();

    setLoading(false);
    if (error || !data) {
      setNotFound(true);
      return;
    }
    setReservation(data as Reservation);
  };

  // Auto-lookup if ref in URL
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    if (urlRef) lookup(urlRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModRequest = async () => {
    if (!reservation || !modMessage.trim()) return;
    setModSending(true);
    try {
      await emailjs.send(
        "service_g37dgi8",
        "template_51gqxra",
        {
          from_name: reservation.contact_name,
          from_email: reservation.contact_email,
          message: `[DEMANDE DE MODIFICATION - ${reservation.reference}]\n\nClient: ${reservation.contact_name}\nEmail: ${reservation.contact_email}\nTéléphone: ${reservation.contact_phone}\nVéhicule: ${reservation.vehicle_name}\nDates: ${reservation.start_date} → ${reservation.end_date}\n\nDemande:\n${modMessage}`,
        },
        "txxckOr0_mZu2OaXQ"
      );
      setModSent(true);
      toast.success("Votre demande de modification a été envoyée !");
    } catch {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setModSending(false);
    }
  };

  const status = reservation ? STATUS_MAP[reservation.status] || STATUS_MAP.pending : null;

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Suivi de réservation</h1>
          <p className="text-muted-foreground mb-8">Entrez votre numéro de référence pour consulter votre réservation.</p>

          {/* Search */}
          <div className="flex gap-2 mb-8">
            <Input
              placeholder="Ex : UTI-20250408-ABCD"
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              className="font-mono text-sm"
            />
            <Button onClick={() => lookup()} disabled={loading || !ref.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">Rechercher</span>
            </Button>
          </div>

          {/* Not found */}
          {notFound && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <p className="font-medium text-foreground">Aucune réservation trouvée</p>
                <p className="text-sm text-muted-foreground mt-1">Vérifiez votre numéro de référence et réessayez.</p>
              </CardContent>
            </Card>
          )}

          {/* Reservation details */}
          {reservation && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Status header */}
              <Card>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Référence</p>
                      <p className="font-mono font-bold text-lg text-foreground">{reservation.reference}</p>
                    </div>
                    {status && (
                      <Badge variant="outline" className={`${status.color} flex items-center gap-1.5 px-3 py-1 text-sm`}>
                        {status.icon} {status.label}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle & dates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" /> Détails de la location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Véhicule</p>
                      <p className="font-medium">{reservation.vehicle_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Formule</p>
                      <p className="font-medium capitalize">{reservation.pack || reservation.plan}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Début</p>
                      <p className="font-medium">{reservation.start_date || "—"} {reservation.start_time && `à ${reservation.start_time}`}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Fin</p>
                      <p className="font-medium">{reservation.end_date || "—"} {reservation.end_time && `à ${reservation.end_time}`}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Durée</p>
                      <p className="font-medium">{reservation.days} jour{reservation.days > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Km estimés</p>
                      <p className="font-medium">{reservation.est_km} km</p>
                    </div>
                  </div>
                  {reservation.options && (
                    <div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1"><Package className="w-3 h-3" /> Options</p>
                      <p className="font-medium">{reservation.options}</p>
                    </div>
                  )}
                  {reservation.delivery_address && (
                    <div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Livraison</p>
                      <p className="font-medium">{reservation.delivery_address}, {reservation.delivery_npa} {reservation.delivery_city}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price */}
              <Card>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-xl font-bold text-foreground">CHF {fmtCHF(reservation.total_chf)}</span>
                  </div>
                  {reservation.promo_code && (
                    <p className="text-xs text-primary mt-1 text-right">Code promo {reservation.promo_code} appliqué (-{reservation.discount_percent}%)</p>
                  )}
                </CardContent>
              </Card>

              {/* Contact info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {reservation.contact_email}</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {reservation.contact_phone}</p>
                </CardContent>
              </Card>

              {/* Modification request */}
              {reservation.status !== "canceled" && (
                <Card className="border-primary/20">
                  <CardContent className="py-5">
                    {modSent ? (
                      <div className="text-center py-4">
                        <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="font-medium text-foreground">Demande envoyée !</p>
                        <p className="text-sm text-muted-foreground mt-1">Nous reviendrons vers vous rapidement.</p>
                      </div>
                    ) : !showModForm ? (
                      <Button variant="outline" className="w-full" onClick={() => setShowModForm(true)}>
                        Demander une modification
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">Décrivez la modification souhaitée :</p>
                        <p className="text-xs text-muted-foreground">Changement de dates, ajout/suppression d'options, annulation, etc.</p>
                        <Textarea
                          placeholder="Ex : Je souhaite décaler ma réservation du 15 au 17 avril..."
                          value={modMessage}
                          onChange={(e) => setModMessage(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => setShowModForm(false)} className="flex-1">Annuler</Button>
                          <Button onClick={handleModRequest} disabled={modSending || !modMessage.trim()} className="flex-1">
                            {modSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Envoyer
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground text-center mt-6">
                Besoin d'aide ? <Link to="/contact" className="underline text-primary">Contactez-nous</Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default Suivi;
