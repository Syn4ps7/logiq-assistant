import { useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { CookieBanner } from "@/components/CookieBanner";
import { LogiqDebugPanel } from "@/components/dev/LogiqDebugPanel";
import { initLogiq } from "@/lib/logiq";
import { supabase } from "@/integrations/supabase/client";
import "@/i18n/config";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Rates from "./pages/Rates";
import Reservation from "./pages/Reservation";
import CGL from "./pages/CGL";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Pro from "./pages/Pro";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import ProLogin from "./pages/ProLogin";
import ProRegister from "./pages/ProRegister";
import ProPortal from "./pages/ProPortal";
import AuthCallback from "./pages/AuthCallback";
import Suivi from "./pages/Suivi";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname.startsWith("/pro-") || location.pathname.startsWith("/auth/");

  useEffect(() => {
    initLogiq();
  }, []);

  // Handle auth callback tokens in URL hash (email confirmation redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=recovery"))) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          const isSignup = hash.includes("type=signup");
          supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle().then(({ data: roleData }) => {
            if (isSignup) {
              navigate("/pro-portal?confirmed=true", { replace: true });
            } else {
              navigate(roleData ? "/admin" : "/pro-portal", { replace: true });
            }
          });
        }
      });
    }
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/rates" element={<Rates />} />
            <Route path="/about" element={<About />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/cgl" element={<CGL />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pro" element={<Pro />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pro-login" element={<ProLogin />} />
            <Route path="/pro-register" element={<ProRegister />} />
            <Route path="/pro-portal" element={<ProPortal />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/suivi" element={<Suivi />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {!isAdmin && <Footer />}
      </div>
      {!isAdmin && <ChatbotWidget />}
      <CookieBanner />
      <LogiqDebugPanel />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
