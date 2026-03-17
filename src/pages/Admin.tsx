import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, RefreshCw, Trash2, Building2, Mail, Phone, MapPin, Calendar, Download, User, ShoppingCart, Filter, Tag, Pencil, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface ProLead {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string | null;
  estimated_volume: string | null;
  need: string;
  created_at: string;
}

interface ContactLead {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface Reservation {
  id: string;
  reference: string;
  source: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  plan: string;
  pack: string | null;
  vehicle_name: string;
  vehicle_id: string;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  days: number;
  options: string | null;
  est_km: number;
  total_chf: number;
  delivery_address: string | null;
  delivery_npa: string | null;
  delivery_city: string | null;
  delivery_phone: string | null;
  delivery_instructions: string | null;
  created_at: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromoUsage {
  id: string;
  promo_code_id: string;
  customer_email: string;
  reservation_reference: string;
  discount_amount: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700" },
  paid: { label: "Payé", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" },
  canceled: { label: "Annulé", className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>{config.label}</Badge>;
};

const Admin = () => {
  const [leads, setLeads] = useState<ProLead[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoUsage, setPromoUsage] = useState<PromoUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statusFilterB2c, setStatusFilterB2c] = useState<string>("all");
  const [statusFilterB2b, setStatusFilterB2b] = useState<string>("all");
  const [editingPromo, setEditingPromo] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      fetchAll();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const [proRes, contactRes, reservationRes, promoRes, usageRes] = await Promise.all([
      supabase.from("pro_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_usage").select("*").order("created_at", { ascending: false }),
    ]);
    if (proRes.error) toast({ title: "Erreur", description: proRes.error.message, variant: "destructive" });
    else setLeads(proRes.data || []);
    if (contactRes.error) toast({ title: "Erreur", description: contactRes.error.message, variant: "destructive" });
    else setContactLeads(contactRes.data || []);
    if (reservationRes.error) toast({ title: "Erreur", description: reservationRes.error.message, variant: "destructive" });
    else setReservations(reservationRes.data || []);
    setPromoCodes(promoRes.data || []);
    setPromoUsage(usageRes.data || []);
    setLoading(false);
  };

  const updatePromoCode = async (id: string) => {
    if (!editCode.trim()) return;
    const { error } = await supabase.from("promo_codes").update({
      code: editCode.trim().toUpperCase(),
      discount_percent: Number(editDiscount) || 15,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Code promo mis à jour" });
      setEditingPromo(null);
      fetchAll();
    }
  };

  const togglePromoActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else fetchAll();
  };

  const deleteProLead = async (id: string) => {
    const { error } = await supabase.from("pro_leads").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { setLeads((p) => p.filter((l) => l.id !== id)); toast({ title: "Lead supprimé" }); }
  };

  const deleteContactLead = async (id: string) => {
    const { error } = await supabase.from("contact_leads").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { setContactLeads((p) => p.filter((l) => l.id !== id)); toast({ title: "Message supprimé" }); }
  };

  const deleteReservation = async (id: string) => {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { setReservations((p) => p.filter((r) => r.id !== id)); toast({ title: "Réservation supprimée" }); }
  };

  const exportProCsv = () => {
    const headers = ["Date", "Entreprise", "Contact", "Téléphone", "Email", "Ville", "Volume estimé", "Besoin"];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString("fr-CH"), l.company_name, l.contact_name, l.phone, l.email,
      l.city || "", l.estimated_volume || "", `"${l.need.replace(/"/g, '""')}"`,
    ]);
    downloadCsv(headers, rows, "leads-pro");
  };

  const exportContactCsv = () => {
    const headers = ["Date", "Nom", "Email", "Message"];
    const rows = contactLeads.map((l) => [
      new Date(l.created_at).toLocaleString("fr-CH"), l.name, l.email, `"${l.message.replace(/"/g, '""')}"`,
    ]);
    downloadCsv(headers, rows, "leads-particuliers");
  };

  const exportReservationsCsv = (source: "b2c" | "b2b") => {
    const filtered = reservations.filter((r) => r.source === source);
    const headers = ["Date", "Référence", "Nom", "Email", "Téléphone", "Formule", "Pack", "Véhicule", "Début", "Heure début", "Fin", "Heure fin", "Jours", "Options", "Km estimés", "Total CHF"];
    const rows = filtered.map((r) => [
      new Date(r.created_at).toLocaleString("fr-CH"), r.reference, r.contact_name, r.contact_email, r.contact_phone,
      r.plan, r.pack || "", r.vehicle_name, r.start_date || "Pack", r.start_time || "", r.end_date || "Pack", r.end_time || "",
      String(r.days), r.options || "Aucune", String(r.est_km), String(r.total_chf),
    ]);
    downloadCsv(headers, rows, `reservations-${source}`);
  };

  const downloadCsv = (headers: string[], rows: string[][], prefix: string) => {
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isAdmin === false) {
    return (
      <main className="py-20">
        <div className="container max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Vous n'avez pas les droits administrateur.</p>
          <Button variant="outline" onClick={handleLogout}>Se déconnecter</Button>
        </div>
      </main>
    );
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" });

  const b2cReservations = reservations.filter((r) => r.source === "b2c");
  const b2bReservations = reservations.filter((r) => r.source === "b2b");

  const planLabel = (r: Reservation) => {
    if (r.pack) {
      const packLabels: Record<string, string> = {
        standard: "Week-end Standard",
        confort: "Pack Déménagement 48h",
        premium: "Pack Premium 48h",
      };
      return packLabels[r.pack] || r.pack;
    }
    const planLabels: Record<string, string> = { week: "Semaine", weekend: "Week-End", "pack-48h": "Pack 48h" };
    return planLabels[r.plan] || r.plan;
  };

  const ReservationTable = ({ items, source, statusFilter, onStatusFilterChange }: { items: Reservation[]; source: "b2c" | "b2b"; statusFilter: string; onStatusFilterChange: (v: string) => void }) => {
    const filtered = statusFilter === "all" ? items : items.filter((r) => r.status === statusFilter);
    return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">{filtered.length} réservation{filtered.length !== 1 ? "s" : ""}</p>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="canceled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtered.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportReservationsCsv(source)}><Download className="h-4 w-4 mr-1" /> CSV</Button>
        )}
      </div>

      {loading && filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune réservation {source === "b2b" ? "pro" : "particulier"} {statusFilter !== "all" ? "avec ce statut" : "pour le moment"}.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Réf.</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Formule</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Km</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(r.created_at)}<br /><span className="opacity-60">{fmtTime(r.created_at)}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{r.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{r.contact_email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.contact_phone}</TableCell>
                    <TableCell className="text-sm font-medium">{planLabel(r)}</TableCell>
                    <TableCell className="text-sm">{r.vehicle_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {r.start_date && r.end_date
                        ? <>{r.start_date}{r.start_time ? ` ${r.start_time}` : ""} → {r.end_date}{r.end_time ? ` ${r.end_time}` : ""}</>
                        : `${r.days}j (Pack)`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{r.options || "—"}</TableCell>
                    <TableCell className="text-sm">{r.est_km}</TableCell>
                    <TableCell className="text-sm font-bold text-primary whitespace-nowrap">{Number(r.total_chf).toFixed(2)} CHF</TableCell>
                    <TableCell>
                      <button onClick={() => deleteReservation(r.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl bg-card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{r.contact_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{r.reference}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-sm font-bold text-primary">{Number(r.total_chf).toFixed(2)} CHF</span>
                    <button onClick={() => deleteReservation(r.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {r.contact_phone}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {r.contact_email}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {fmtDate(r.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{planLabel(r)}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.vehicle_name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.est_km} km</span>
                </div>
                {r.options && <p className="text-xs text-muted-foreground">Options : {r.options}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  };

  return (
    <main className="py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Administration</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Déconnexion
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reservations-b2c" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="reservations-b2c" className="gap-1.5">
              <ShoppingCart className="h-4 w-4" /> Réservations B2C
              {b2cReservations.length > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{b2cReservations.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="reservations-b2b" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Réservations B2B
              {b2bReservations.length > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{b2bReservations.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="pro" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Leads Pro
              {leads.length > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{leads.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5">
              <User className="h-4 w-4" /> Leads Particuliers
              {contactLeads.length > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{contactLeads.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-1.5">
              <Tag className="h-4 w-4" /> Promotions
              {promoCodes.length > 0 && <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{promoCodes.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* ========== RESERVATIONS B2C ========== */}
          <TabsContent value="reservations-b2c">
            <ReservationTable items={b2cReservations} source="b2c" statusFilter={statusFilterB2c} onStatusFilterChange={setStatusFilterB2c} />
          </TabsContent>

          {/* ========== RESERVATIONS B2B ========== */}
          <TabsContent value="reservations-b2b">
            <ReservationTable items={b2bReservations} source="b2b" statusFilter={statusFilterB2b} onStatusFilterChange={setStatusFilterB2b} />
          </TabsContent>

          {/* ========== PRO LEADS TAB ========== */}
          <TabsContent value="pro" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">{leads.length} demande{leads.length !== 1 ? "s" : ""} reçue{leads.length !== 1 ? "s" : ""}</p>
              {leads.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportProCsv}><Download className="h-4 w-4 mr-1" /> CSV</Button>
              )}
            </div>

            {loading && leads.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Chargement…</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun lead Pro pour le moment.</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead className="min-w-[250px]">Besoin</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(lead.created_at)}<br /><span className="opacity-60">{fmtTime(lead.created_at)}</span>
                          </TableCell>
                          <TableCell className="font-medium">{lead.company_name}</TableCell>
                          <TableCell>{lead.contact_name}</TableCell>
                          <TableCell className="text-sm">{lead.phone}</TableCell>
                          <TableCell className="text-sm">{lead.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.city || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lead.estimated_volume || "—"}</TableCell>
                          <TableCell className="text-sm max-w-[400px] whitespace-pre-wrap">{lead.need}</TableCell>
                          <TableCell>
                            <button onClick={() => deleteProLead(lead.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile */}
                <div className="md:hidden space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="p-4 border rounded-xl bg-card space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{lead.company_name}</p>
                          <p className="text-sm text-muted-foreground">{lead.contact_name}</p>
                        </div>
                        <button onClick={() => deleteProLead(lead.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {lead.phone}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {lead.email}</div>
                        {lead.city && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {lead.city}</div>}
                        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {fmtDate(lead.created_at)}</div>
                      </div>
                      <p className="text-sm bg-muted/50 p-2 rounded-md">{lead.need}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ========== CONTACT LEADS TAB ========== */}
          <TabsContent value="contact" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">{contactLeads.length} message{contactLeads.length !== 1 ? "s" : ""} reçu{contactLeads.length !== 1 ? "s" : ""}</p>
              {contactLeads.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportContactCsv}><Download className="h-4 w-4 mr-1" /> CSV</Button>
              )}
            </div>

            {loading && contactLeads.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Chargement…</div>
            ) : contactLeads.length === 0 ? (
              <div className="text-center py-20">
                <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun message de particulier pour le moment.</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="min-w-[300px]">Message</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(lead.created_at)}<br /><span className="opacity-60">{fmtTime(lead.created_at)}</span>
                          </TableCell>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="text-sm">{lead.email}</TableCell>
                          <TableCell className="text-sm whitespace-pre-wrap">{lead.message}</TableCell>
                          <TableCell>
                            <button onClick={() => deleteContactLead(lead.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile */}
                <div className="md:hidden space-y-4">
                  {contactLeads.map((lead) => (
                    <div key={lead.id} className="p-4 border rounded-xl bg-card space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                        </div>
                        <button onClick={() => deleteContactLead(lead.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> {fmtDate(lead.created_at)}
                      </div>
                      <p className="text-sm bg-muted/50 p-2 rounded-md whitespace-pre-wrap">{lead.message}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ========== PROMOTIONS TAB ========== */}
          <TabsContent value="promotions" className="space-y-6">
            {/* Promo codes management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Codes promo</h3>
              {promoCodes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun code promo configuré.</p>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((promo) => (
                    <div key={promo.id} className="p-4 border rounded-xl bg-card space-y-3">
                      {editingPromo === promo.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Code</label>
                              <Input value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} className="uppercase" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Réduction (%)</label>
                              <Input type="number" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} min={1} max={100} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updatePromoCode(promo.id)}>
                              <Save className="h-4 w-4 mr-1" /> Enregistrer
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingPromo(null)}>
                              <X className="h-4 w-4 mr-1" /> Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-mono text-lg font-bold">{promo.code}</span>
                              <p className="text-sm text-muted-foreground">-{promo.discount_percent}% de réduction</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={promo.is_active} onCheckedChange={() => togglePromoActive(promo.id, promo.is_active)} />
                              <span className="text-sm">{promo.is_active ? "Actif" : "Inactif"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {promoUsage.filter((u) => u.promo_code_id === promo.id).length} utilisation(s)
                            </span>
                            <Button variant="outline" size="sm" onClick={() => { setEditingPromo(promo.id); setEditCode(promo.code); setEditDiscount(String(promo.discount_percent)); }}>
                              <Pencil className="h-4 w-4 mr-1" /> Modifier
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Promo usage history */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Historique des utilisations</h3>
              {promoUsage.length === 0 ? (
                <div className="text-center py-10">
                  <Tag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune utilisation de code promo pour le moment.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Date</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Email client</TableHead>
                          <TableHead>Réf. réservation</TableHead>
                          <TableHead>Réduction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoUsage.map((usage) => {
                          const code = promoCodes.find((p) => p.id === usage.promo_code_id);
                          return (
                            <TableRow key={usage.id}>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {fmtDate(usage.created_at)}<br /><span className="opacity-60">{fmtTime(usage.created_at)}</span>
                              </TableCell>
                              <TableCell className="font-mono font-bold">{code?.code || "—"}</TableCell>
                              <TableCell className="text-sm">{usage.customer_email}</TableCell>
                              <TableCell className="font-mono text-xs">{usage.reservation_reference}</TableCell>
                              <TableCell className="text-sm font-medium text-primary">-{Number(usage.discount_amount).toFixed(2)} CHF</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="md:hidden space-y-3">
                    {promoUsage.map((usage) => {
                      const code = promoCodes.find((p) => p.id === usage.promo_code_id);
                      return (
                        <div key={usage.id} className="p-4 border rounded-xl bg-card space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono font-bold">{code?.code || "—"}</span>
                              <p className="text-xs text-muted-foreground">{usage.customer_email}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">-{Number(usage.discount_amount).toFixed(2)} CHF</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" /> {fmtDate(usage.created_at)}
                            <span className="font-mono">{usage.reservation_reference}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
