import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

const ProRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    contact_name: "",
    phone: "",
    city: "",
    ide_tva: "",
  });

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          contact_name: form.contact_name,
          company_name: form.company_name,
        },
        emailRedirectTo: "https://logiq-transport.ch",
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    // Update profile with extra info
    if (data.user) {
      await supabase.from("profiles").update({
        company_name: form.company_name,
        contact_name: form.contact_name,
        phone: form.phone,
        city: form.city,
      }).eq("user_id", data.user.id);
    }

    setLoading(false);
    toast({
      title: "Compte créé !",
      description: "Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail pour activer votre compte.",
    });
    navigate("/pro-login");
  };

  return (
    <main className="py-16">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Créer un compte Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Accédez à votre espace de gestion de flotte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entreprise *</label>
              <Input required value={form.company_name} onChange={update("company_name")} placeholder="Ma Société SA" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom du contact *</label>
              <Input required value={form.contact_name} onChange={update("contact_name")} placeholder="Jean Dupont" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone *</label>
              <Input required type="tel" value={form.phone} onChange={update("phone")} placeholder="+41 79 000 00 00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <Input value={form.city} onChange={update("city")} placeholder="Lausanne" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email professionnel *</label>
            <Input required type="email" value={form.email} onChange={update("email")} placeholder="contact@entreprise.ch" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe *</label>
              <Input required type="password" value={form.password} onChange={update("password")} placeholder="Min. 8 caractères" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer *</label>
              <Input required type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Confirmer" />
            </div>
          </div>

          <Button variant="petrol" type="submit" className="w-full" disabled={loading}>
            {loading ? "Création…" : "Créer mon compte"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/pro-login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ProRegister;
