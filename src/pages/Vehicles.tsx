import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";

const Vehicles = () => {
  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Nos véhicules</h1>
          <p className="text-muted-foreground max-w-2xl">
            Découvrez notre flotte de véhicules utilitaires connectés. Tous nos utilitaires sont récents, bien entretenus et équipés pour vos besoins professionnels.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Vehicles;
