import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

const ProLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: "Erreur", description: "Veuillez entrer votre email.", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://logiq-transport.ch/reset-password",
    });
    setResetLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
      setResetMode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    // Check if user is admin — redirect to admin dashboard
    if (data.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        navigate("/admin");
        return;
      }
    }

    navigate("/pro-portal");
  };

  return (
    <main className="py-20">
      <div className="container max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Espace Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">Connectez-vous à votre portail</p>
        </div>

        {resetMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button variant="petrol" className="w-full" onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? "Envoi…" : "Envoyer le lien de réinitialisation"}
            </Button>
            <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button variant="petrol" type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
            <button type="button" onClick={() => setResetMode(true)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mot de passe oublié ?
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/pro-register" className="text-primary hover:underline font-medium">
                Créer un compte Pro
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default ProLogin;
