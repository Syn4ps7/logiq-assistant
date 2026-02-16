export interface Vehicle {
  id: string;
  name: string;
  priceDay: number;
  specs: {
    volume: string;
    height: string;
    length: string;
    payload: string;
    seats: number;
    transmission: string;
    fuel: string;
  };
  features: string[];
  image: string;
  availability: boolean;
}

export const vehicles: Vehicle[] = [
  {
    id: "sprinter-l2h2",
    name: "Mercedes Sprinter L2H2",
    priceDay: 120,
    specs: {
      volume: "14 m³",
      height: "1.90 m",
      length: "3.27 m",
      payload: "1'200 kg",
      seats: 3,
      transmission: "Automatique",
      fuel: "Diesel",
    },
    features: ["GPS intégré", "Caméra de recul", "Régulateur de vitesse", "Bluetooth", "Hayon élévateur disponible"],
    image: "/placeholder.svg",
    availability: true,
  },
  {
    id: "master-l2h2",
    name: "Renault Master L2H2",
    priceDay: 95,
    specs: {
      volume: "12 m³",
      height: "1.85 m",
      length: "3.08 m",
      payload: "1'100 kg",
      seats: 3,
      transmission: "Manuelle",
      fuel: "Diesel",
    },
    features: ["GPS intégré", "Caméra de recul", "Bluetooth", "Barres d'arrimage"],
    image: "/placeholder.svg",
    availability: true,
  },
  {
    id: "sprinter-l3h2",
    name: "Mercedes Sprinter L3H2",
    priceDay: 145,
    specs: {
      volume: "17 m³",
      height: "1.90 m",
      length: "3.94 m",
      payload: "1'300 kg",
      seats: 3,
      transmission: "Automatique",
      fuel: "Diesel",
    },
    features: ["GPS intégré", "Caméra de recul", "Régulateur adaptatif", "Bluetooth", "Hayon élévateur", "Cloison de séparation"],
    image: "/placeholder.svg",
    availability: true,
  },
];

export const vehicleOptions = [
  { id: "serenite", name: "Sérénité+", priceDay: 25, description: "Franchise réduite de 2'000 CHF à 500 CHF" },
  { id: "km-unlimited", name: "Km illimités", priceDay: 15, description: "Pas de surcoût kilométrique" },
  { id: "gps-ext", name: "GPS Europe", priceDay: 5, description: "Navigation GPS étendue Europe" },
  { id: "hayon", name: "Hayon élévateur", priceDay: 30, description: "Hayon élévateur 500 kg" },
  { id: "diable", name: "Diable de transport", priceDay: 5, description: "Chariot de transport inclus" },
  { id: "couvertures", name: "Kit de protection", priceDay: 10, description: "Couvertures + sangles d'arrimage" },
];
