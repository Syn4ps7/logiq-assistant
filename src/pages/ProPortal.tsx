import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShoppingCart, ClipboardList, User, Building2, ArrowRight, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateProInvoice } from "@/lib/invoice";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  paid: { label: "Payé", className: "bg-green-100 text-green-800 border-green-300" },
  canceled: { label: "Annulé", className: "bg-red-100 text-red-800 border-red-300" },
};

const ProPortal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);

  // Show confirmation toast when arriving from email validation
  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      toast({
        title: "✅ Email confirmé !",
        description: "Votre compte pro est activé. Bienvenue dans votre espace.",
      });
      // Clean URL
      window.history.replaceState({}, "", "/pro-portal");
    }
  }, [searchParams]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/pro-login");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      // Fetch reservations by email
      const email = profileData?.email || session.user.email;
      if (email) {
        const { data: resData } = await supabase
          .from("reservations")
          .select("*")
          .eq("contact_email", email)
          .order("created_at", { ascending: false });

        if (resData) setReservations(resData);
      }

      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/pro-login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/pro-login");
  };

  if (loading) {
    return (
      <main className="py-20 text-center text-muted-foreground">
        Chargement de votre espace…
      </main>
    );
  }

  const totalSpent = reservations
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.total_chf), 0);

  const totalDays = reservations
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.days, 0);

  return (
    <main className="py-10">
      <div className="container max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {profile?.company_name || "Mon espace Pro"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bienvenue, {profile?.contact_name || ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Déconnexion
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Réservations</p>
            <p className="text-xl font-bold">{reservations.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Jours loués</p>
            <p className="text-xl font-bold">{totalDays}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total dépensé</p>
            <p className="text-xl font-bold">{totalSpent.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">CHF</span></p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList className="h-auto flex-wrap gap-1">
            <TabsTrigger value="reservations" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <ClipboardList className="h-3.5 w-3.5" /> Mes réservations
            </TabsTrigger>
            <TabsTrigger value="book" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <ShoppingCart className="h-3.5 w-3.5" /> Réserver
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <User className="h-3.5 w-3.5" /> Mon profil
            </TabsTrigger>
          </TabsList>

          {/* Reservations tab */}
          <TabsContent value="reservations" className="space-y-4">
            {reservations.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
                <Link to="/reservation">
                  <Button variant="petrol" className="mt-4">
                    Réserver un véhicule <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Véhicule</TableHead>
                      <TableHead>Jours</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((r) => {
                      const config = statusConfig[r.status] || statusConfig.pending;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {r.start_date || new Date(r.created_at).toLocaleDateString("fr-CH")}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{r.vehicle_name}</TableCell>
                          <TableCell className="text-sm">{r.days}j</TableCell>
                          <TableCell className="text-sm font-semibold text-primary">{Number(r.total_chf).toFixed(0)} CHF</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {r.status === "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => generateProInvoice({
                                  reference: r.reference,
                                  date: new Date(r.created_at).toLocaleDateString("fr-CH"),
                                  companyName: profile?.company_name || "",
                                  contactName: profile?.contact_name || "",
                                  email: profile?.email || "",
                                  phone: profile?.phone || "",
                                  ideTva: (profile as any)?.ide_tva || undefined,
                                  vehicleName: r.vehicle_name,
                                  plan: r.plan,
                                  days: r.days,
                                  startDate: r.start_date || undefined,
                                  endDate: r.end_date || undefined,
                                  options: r.options || undefined,
                                  estKm: r.est_km,
                                  totalTTC: Number(r.total_chf),
                                  discountPercent: Number(r.discount_percent) || undefined,
                                  discountAmount: Number(r.discount_amount) || undefined,
                                  promoCode: r.promo_code || undefined,
                                })}
                              >
                                <FileText className="h-3.5 w-3.5" /> Facture
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Booking tab */}
          <TabsContent value="book" className="space-y-4">
            <div className="text-center py-16">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Réservez directement un véhicule avec vos informations pré-remplies.</p>
              <Link to="/reservation">
                <Button variant="petrol">
                  Accéder à la réservation <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Profile tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-lg">Informations du compte</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Entreprise</p>
                  <p className="font-medium">{profile?.company_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="font-medium">{profile?.contact_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ville</p>
                  <p className="font-medium">{profile?.city || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type de compte</p>
                  <p className="font-medium capitalize">{profile?.account_type || "pro"}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default ProPortal;
