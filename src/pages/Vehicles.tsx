import { useRef, useEffect, useState } from "react";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/hooks/use-seo";

function FadeInOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const Vehicles = () => {
  const { t } = useTranslation();

  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t("vehicles.title")}</h1>
          <p className="text-muted-foreground max-w-2xl">{t("vehicles.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v, i) => (
            <FadeInOnScroll key={v.id} delay={(i % 2) * 120}>
              <VehicleCard vehicle={v} />
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Vehicles;
