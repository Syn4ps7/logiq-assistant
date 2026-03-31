import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { CookieBanner } from "@/components/CookieBanner";
import { initLogiq } from "@/lib/logiq";
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
import ProLogin from "./pages/ProLogin";
import ProRegister from "./pages/ProRegister";
import ProPortal from "./pages/ProPortal";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname.startsWith("/pro-");

  useEffect(() => {
    initLogiq();
  }, []);

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {!isAdmin && <Footer />}
      </div>
      {!isAdmin && <ChatbotWidget />}
      <CookieBanner />
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
