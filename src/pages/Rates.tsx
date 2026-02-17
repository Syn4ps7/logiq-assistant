import { vehicles, vehicleOptions, EXTRA_KM_RATE } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, MapPin, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const Rates = () => {
  const { t } = useTranslation();

  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t("rates.title")}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {t("rates.subtitle", { rate: EXTRA_KM_RATE.toFixed(2) })}
          </p>
        </div>

        {/* ── Section 1 : Tarifs normaux ── */}
        <section className="mb-14" aria-label={t("rates.normalTitle")}>
          <h2 className="text-xl font-semibold mb-6">{t("rates.normalTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semaine */}
            <div className="p-6 bg-card rounded-lg border-2 border-border">
              <h3 className="text-lg font-bold mb-1">{t("rates.weekday")}</h3>
              <p className="text-3xl font-bold text-primary mb-2">{t("rates.weekdayPrice")}</p>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" /> {t("rates.hubText")}
              </p>
              <ul className="space-y-2 mb-5">
                {(t("rates.normalIncludes", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/reservation">
                <Button variant="petrol" className="w-full">{t("nav.book")}</Button>
              </Link>
            </div>
            {/* Week-end */}
            <div className="p-6 bg-card rounded-lg border-2 border-border">
              <h3 className="text-lg font-bold mb-1">{t("rates.weekend")}</h3>
              <p className="text-3xl font-bold text-primary mb-2">{t("rates.weekendPrice")}</p>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" /> {t("rates.hubText")}
              </p>
              <ul className="space-y-2 mb-5">
                {(t("rates.normalIncludes", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/reservation">
                <Button variant="petrol" className="w-full">{t("nav.book")}</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Section 2 : Packs Week-end+ ── */}
        <section className="mb-14" aria-label={t("rates.packsTitle")}>
          <h2 className="text-xl font-semibold mb-1">{t("rates.packsTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("rates.packsSubtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Standard */}
            <div className="relative p-6 bg-card rounded-lg border-2 border-border">
              <h3 className="text-lg font-bold mb-1">{t("rates.standardName")}</h3>
              <p className="text-sm text-muted-foreground italic mb-3">{t("rates.standardHook")}</p>
              <p className="text-3xl font-bold text-primary mb-4">{t("rates.standardPrice")}</p>
              <ul className="space-y-2 mb-5">
                {(t("rates.standardIncludes", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/reservation?pack=standard">
                <Button variant="petrol" className="w-full">{t("rates.standardCta")}</Button>
              </Link>
            </div>

            {/* Confort — mis en avant */}
            <div className="relative p-6 bg-card rounded-lg border-2 border-accent shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" /> {t("rates.confortBadge")}
              </div>
              <h3 className="text-lg font-bold mb-1">{t("rates.confortName")}</h3>
              <p className="text-sm text-muted-foreground italic mb-3">{t("rates.confortHook")}</p>
              <p className="text-3xl font-bold text-primary mb-4">{t("rates.confortPrice")}</p>
              <ul className="space-y-2 mb-5">
                {(t("rates.confortIncludes", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/reservation?pack=confort">
                <Button variant="hero" className="w-full">{t("rates.confortCta")}</Button>
              </Link>
            </div>

            {/* Premium Livré */}
            <div className="relative p-6 bg-card rounded-lg border-2 border-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Crown className="h-3 w-3" /> {t("rates.premiumBadge")}
              </div>
              <h3 className="text-lg font-bold mb-1">{t("rates.premiumName")}</h3>
              <p className="text-sm text-muted-foreground italic mb-3">{t("rates.premiumHook")}</p>
              <p className="text-3xl font-bold text-primary mb-4">{t("rates.premiumPrice")}</p>
              <ul className="space-y-2 mb-5">
                {(t("rates.premiumIncludes", { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/reservation?pack=premium">
                <Button variant="petrol" className="w-full flex items-center gap-2">
                  <Truck className="h-4 w-4" /> {t("rates.premiumCta")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Reassurance line */}
          <p className="text-center text-sm text-muted-foreground mb-8">{t("rates.reassuranceLine")}</p>

          {/* Tableau comparatif */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <h3 className="text-lg font-semibold p-4 pb-2">{t("rates.compareTitle")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]"></TableHead>
                  <TableHead className="text-center">{t("rates.standardName")}</TableHead>
                  <TableHead className="text-center font-bold text-accent">{t("rates.confortName")}</TableHead>
                  <TableHead className="text-center">{t("rates.premiumName")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.comparePriceTTC")}</TableCell>
                  <TableCell className="text-center">280 CHF</TableCell>
                  <TableCell className="text-center font-semibold">340 CHF</TableCell>
                  <TableCell className="text-center">380 CHF</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.compareRetrait")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareHubVevey")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareHubVevey")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareLivraison")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.compareRetour")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareHubVevey")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareHubVevey")}</TableCell>
                  <TableCell className="text-center">{t("rates.compareHubVevey")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.compareDuree")}</TableCell>
                  <TableCell className="text-center text-sm">{t("rates.compareDureeStandard")}</TableCell>
                  <TableCell className="text-center text-sm">{t("rates.compareDureeConfort")}</TableCell>
                  <TableCell className="text-center text-sm">{t("rates.compareDureeConfort")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.compareSerenite")}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{t("rates.compareOption")}</TableCell>
                  <TableCell className="text-center font-semibold text-primary">{t("rates.compareIncluse")}</TableCell>
                  <TableCell className="text-center font-semibold text-primary">{t("rates.compareIncluse")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("rates.compareDiable")}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{t("rates.compareOption")}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{t("rates.compareOption")}</TableCell>
                  <TableCell className="text-center font-semibold text-primary">{t("rates.compareInclus")}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ── Section 3 : Options ── */}
        <section className="mb-12" aria-label="Options">
          <h2 className="text-xl font-semibold mb-4">{t("rates.options")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 bg-card rounded-lg border ${opt.id === "serenite" ? "border-accent border-2 relative" : ""}`}
              >
                {opt.id === "serenite" && (
                  <span className="absolute -top-2.5 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {t("rates.recommended")}
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{opt.name}</h3>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">{opt.price} {t("rates.perRental")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4 : Km supplémentaires ── */}
        <section className="mb-12" aria-label="Km supplémentaires">
          <h2 className="text-xl font-semibold mb-4">{t("rates.extraKm")}</h2>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              {t("rates.extraKmDesc")} <strong className="text-foreground">{EXTRA_KM_RATE.toFixed(2)} {t("rates.extraKmRate")}</strong>{t("rates.extraKmAuto")}
            </p>
          </div>
        </section>

        {/* ── Section 5 : Véhicules disponibles ── */}
        <section className="mb-12" aria-label="Véhicules disponibles">
          <h2 className="text-xl font-semibold mb-4">{t("rates.availableVehicles")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground">{v.specs.volume} · {v.specs.payload} · {v.specs.transmission}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 6 : Inclus ── */}
        <section className="mb-12" aria-label="Inclus dans le tarif">
          <h2 className="text-xl font-semibold mb-4">{t("rates.included")}</h2>
          <div className="bg-card rounded-lg border p-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(t("rates.includedItems", { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Section 7 : Encadré Pro ── */}
        <section className="mb-12" aria-label="Pro">
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">{t("rates.proCalloutTitle")}</h2>
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">{t("rates.proCalloutText")}</p>
            <Link to="/pro">
              <Button variant="petrol">{t("rates.proCalloutCta")}</Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Rates;
