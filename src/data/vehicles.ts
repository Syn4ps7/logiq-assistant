export interface Vehicle {
  id: string;
  name: string;
  priceDay: number; // base daily rate (Week rate)
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
  images: {
    exterior: string;
    interior: string;
  };
  availability: boolean;
}

import van1Exterior from "@/assets/van1-exterior.jpg";
import van1Interior from "@/assets/van1-interior.jpg";
import van2Exterior from "@/assets/van2-exterior.jpg";
import van2Interior from "@/assets/van2-interior.jpg";

export const vehicles: Vehicle[] = [
  {
    id: "utilitaire-1",
    name: "Utilitaire 1 — 13 m³",
    priceDay: 120,
    specs: {
      volume: "13 m³",
      height: "1.90 m",
      length: "3.27 m",
      payload: "1'200 kg",
      seats: 3,
      transmission: "Automatique",
      fuel: "Diesel",
    },
    features: ["GPS intégré", "Caméra de recul", "Régulateur de vitesse", "Bluetooth"],
    images: { exterior: van1Exterior, interior: van1Interior },
    availability: true,
  },
  {
    id: "utilitaire-2",
    name: "Utilitaire 2 — 13 m³",
    priceDay: 120,
    specs: {
      volume: "13 m³",
      height: "1.90 m",
      length: "3.27 m",
      payload: "1'200 kg",
      seats: 3,
      transmission: "Automatique",
      fuel: "Diesel",
    },
    features: ["GPS intégré", "Caméra de recul", "Régulateur de vitesse", "Bluetooth"],
    images: { exterior: van2Exterior, interior: van2Interior },
    availability: true,
  },
];

export interface VehicleOption {
  id: string;
  name: string;
  price: number;
  priceType: "flat" | "per-day";
  description: string;
}

export const vehicleOptions: VehicleOption[] = [
  {
    id: "serenite",
    name: "Sérénité",
    price: 49,
    priceType: "flat",
    description: "Franchise réduite de 2'000 CHF à 500 CHF",
  },
  {
    id: "diable",
    name: "Diable de transport",
    price: 10,
    priceType: "flat",
    description: "Chariot de transport inclus",
  },
  {
    id: "sangles-couverture",
    name: "Sangles & Couverture",
    price: 5,
    priceType: "flat",
    description: "Sangles d'arrimage et couvertures de protection",
  },
];

export interface RatePlan {
  id: string;
  name: string;
  subtitle: string;
  priceDisplay: string;
  priceValue: number;
  isFlat: boolean;
  includedKmPerDay: number;
  totalIncludedKm?: number;
  features: string[];
  popular?: boolean;
}

export const ratePlans: RatePlan[] = [
  {
    id: "week",
    name: "Semaine",
    subtitle: "Lundi → Jeudi",
    priceDisplay: "120 CHF / jour",
    priceValue: 120,
    isFlat: false,
    includedKmPerDay: 100,
    features: [
      "120 CHF / jour",
      "100 km inclus / jour",
      "Assurance standard",
      "Assistance 24/7",
    ],
  },
  {
    id: "weekend",
    name: "Week‑End",
    subtitle: "Vendredi → Dimanche",
    priceDisplay: "140 CHF / jour",
    priceValue: 140,
    isFlat: false,
    includedKmPerDay: 100,
    features: [
      "140 CHF / jour",
      "100 km inclus / jour",
      "Assurance standard",
      "Assistance 24/7",
    ],
  },
  {
    id: "pack-48h",
    name: "Pack 48h Déménagement",
    subtitle: "Idéal pour vos projets",
    priceDisplay: "340 CHF",
    priceValue: 340,
    isFlat: true,
    includedKmPerDay: 0,
    totalIncludedKm: 200,
    features: [
      "340 CHF forfait",
      "200 km inclus (total)",
      "Assurance standard",
      "Flexibilité",
    ],
    popular: true,
  },
];

export const EXTRA_KM_RATE = 0.70;
