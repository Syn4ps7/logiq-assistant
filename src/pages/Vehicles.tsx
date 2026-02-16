import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { useTranslation } from "react-i18next";

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
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Vehicles;
