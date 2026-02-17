import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LogOut, RefreshCw, Trash2, Building2, Mail, Phone, MapPin, Calendar, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const Admin = () => {
  const [leads, setLeads] = useState<ProLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Check admin role
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
      fetchLeads();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pro_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("pro_leads").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Lead supprimé" });
    }
  };

  const exportCsv = () => {
    const headers = ["Date", "Entreprise", "Contact", "Téléphone", "Email", "Ville", "Volume estimé", "Besoin"];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString("fr-CH"),
      l.company_name,
      l.contact_name,
      l.phone,
      l.email,
      l.city || "",
      l.estimated_volume || "",
      `"${l.need.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-pro-${new Date().toISOString().slice(0, 10)}.csv`;
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

  return (
    <main className="py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Leads Pro</h1>
            <p className="text-muted-foreground text-sm">{leads.length} demande{leads.length !== 1 ? "s" : ""} reçue{leads.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            {leads.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Déconnexion
            </Button>
          </div>
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
            {/* Desktop table */}
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
                    <TableHead>Besoin</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        <br />
                        <span className="opacity-60">
                          {new Date(lead.created_at).toLocaleTimeString("fr-CH", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{lead.company_name}</TableCell>
                      <TableCell>{lead.contact_name}</TableCell>
                      <TableCell className="text-sm">{lead.phone}</TableCell>
                      <TableCell className="text-sm">{lead.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{lead.city || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{lead.estimated_volume || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{lead.need}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-xl bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{lead.company_name}</p>
                      <p className="text-sm text-muted-foreground">{lead.contact_name}</p>
                    </div>
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {lead.email}
                    </div>
                    {lead.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {lead.city}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(lead.created_at).toLocaleDateString("fr-CH")}
                    </div>
                  </div>
                  <p className="text-sm bg-muted/50 p-2 rounded-md">{lead.need}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Admin;
