import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles auth callbacks (email confirmation, magic links, etc.)
 * Supabase appends tokens to the URL hash after email confirmation.
 * This component detects them and redirects appropriately.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase puts tokens in the URL hash after email confirmation
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        navigate("/pro-login");
        return;
      }

      if (session) {
        // Check if admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/pro-portal", { replace: true });
        }
      } else {
        navigate("/pro-login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <main className="py-20 text-center text-muted-foreground">
      Vérification en cours…
    </main>
  );
};

export default AuthCallback;
