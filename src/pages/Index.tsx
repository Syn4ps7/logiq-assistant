import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { Shield, Clock, MapPin, Headphones, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-van.jpg";

const features = [
  { icon: Shield, title: "Assurance complète", description: "RC et casco incluses. Franchise réduite disponible avec Sérénité+." },
  { icon: Clock, title: "Réservation rapide", description: "Réservez en ligne en 3 étapes. Prise en charge dès 07h00." },
  { icon: MapPin, title: "Riviera Vaudoise", description: "Basés à Vevey, nous couvrons toute la Riviera et au-delà." },
  { icon: Headphones, title: "Support 7j/7", description: "Assistance routière et support client disponible en permanence." },
];

const Index = () => {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden" aria-label="Présentation">
        <img
          src={heroImage}
          alt="Véhicule utilitaire LogIQ Transport sur les routes de la Riviera Vaudoise"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative container py-20">
          <div className="max-w-xl animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Location utilitaire<br />
              <span className="text-accent">connectée</span> & fiable
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
              Véhicules utilitaires modernes sur la Riviera Vaudoise. Réservation en ligne, tarifs transparents, support professionnel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/reservation">
                <Button variant="hero" size="lg">
                  Réserver maintenant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/rates">
                <Button variant="hero-outline" size="lg">Voir les tarifs</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card" aria-label="Nos avantages">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-lg border bg-background hover:shadow-sm transition-shadow">
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles preview */}
      <section className="py-16" aria-label="Nos véhicules">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Notre flotte</h2>
              <p className="text-muted-foreground">Véhicules utilitaires L2H2 et L3H2 récents et bien entretenus.</p>
            </div>
            <Link to="/vehicles" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/vehicles">
              <Button variant="outline">Voir tous les véhicules</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground" aria-label="Appel à l'action">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Prêt à démarrer ?</h2>
          <p className="text-lg opacity-80 mb-8">
            Réservez votre utilitaire en quelques clics. Prise en charge à Vevey, Riviera Vaudoise.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/reservation">
              <Button variant="hero" size="lg">Réserver</Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg">Nous contacter</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
