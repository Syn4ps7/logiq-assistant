import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Zap, MapPin, MousePointerClick, Truck, CreditCard, ShieldCheck, Warehouse, CheckCircle2, Target, Lightbulb, ArrowRight } from "lucide-react";
import aboutHub from "@/assets/about-hub.jpg";

const solutionSteps = [
  { icon: MousePointerClick, colorClass: "bg-primary/15 text-primary" },
  { icon: Truck, colorClass: "bg-primary/15 text-primary" },
  { icon: CreditCard, colorClass: "bg-primary/15 text-primary" },
  { icon: ShieldCheck, colorClass: "bg-primary/15 text-primary" },
];

const hubIcons = [
  CheckCircle2,
  Warehouse,
  ShieldCheck,
  MousePointerClick,
];

const philoIcons = [
  Lightbulb,
  ShieldCheck,
  Target,
];

const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-24" aria-label="À propos de LogIQ Transport">
      <div className="container max-w-5xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t("about.title")}</h2>
          <p className="text-lg font-semibold text-primary">{t("about.hook")}</p>
        </motion.div>

        {/* Intro text + image side by side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 text-muted-foreground leading-relaxed"
          >
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p className="font-semibold text-foreground">{t("about.p3")}</p>
            <p>{t("about.p4")}</p>
            <p>{t("about.p5")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl overflow-hidden border border-border shadow-lg"
          >
            <img
              src={aboutHub}
              alt="Hub LogIQ Transport — flotte utilitaires organisée"
              className="w-full h-auto object-cover"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </div>

        {/* Solution — interactive process steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-foreground mb-3 text-center">{t("about.solutionTitle")}</h3>
          <div className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-8">
            <p>{t("about.solution1")}</p>
            <p className="mt-2">{t("about.solution2")}</p>
            <p className="mt-2">{t("about.solution3")}</p>
            <p className="mt-2 font-semibold text-foreground">{t("about.solution4")}</p>
            <p className="mt-2">{t("about.solution5")}</p>
          </div>

          {/* Process flow cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(t("about.solutionList", { returnObjects: true }) as string[]).map((item, i) => {
              const StepIcon = solutionSteps[i]?.icon ?? Zap;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-yellow transition-all duration-300 cursor-default"
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-yellow">
                    {i + 1}
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <StepIcon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm leading-snug">{item}</p>
                  {/* Arrow connector (hidden on last) */}
                  {i < 3 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-primary/40" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-muted-foreground text-center mt-6"
          >
            {t("about.solution6")}
          </motion.p>
        </motion.div>

        {/* Hub concept — visual diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-foreground mb-3 text-center">{t("about.hubTitle")}</h3>
          <div className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-8">
            <p>{t("about.hub1")}</p>
            <p className="mt-2">{t("about.hub2")}</p>
          </div>

          {/* Hub diagram */}
          <div className="relative max-w-3xl mx-auto">
            {/* Center hub icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center justify-center mx-auto mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center shadow-yellow">
                <Warehouse className="h-10 w-10 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground mt-2">Hub LogIQ</span>
            </motion.div>

            {/* Hub features in a grid around */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(t("about.hubList", { returnObjects: true }) as string[]).map((item, i) => {
                const HubIcon = hubIcons[i] ?? MapPin;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-yellow transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <HubIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{item}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mt-6 space-y-2">
            <p>{t("about.hub3")}</p>
            <p className="font-semibold text-foreground">{t("about.hub4")}</p>
          </div>
        </motion.div>

        {/* Philosophie — interactive cards with icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-foreground mb-3 text-center">{t("about.philoTitle")}</h3>
          <p className="text-muted-foreground text-center mb-8">{t("about.philoIntro")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(t("about.philoItems", { returnObjects: true }) as { title: string; desc: string }[]).map((item, i) => {
              const PhiloIcon = philoIcons[i] ?? Zap;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-yellow transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <PhiloIcon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mission — highlight quote style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center overflow-hidden"
        >
          {/* Decorative accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary rounded-b-full" />

          <h3 className="text-2xl font-bold text-foreground mb-4 mt-2">{t("about.missionTitle")}</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("about.mission1")}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-xl font-bold text-primary"
          >
            {t("about.mission2")}
          </motion.p>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{t("about.mission3")}</p>
          <p className="mt-4 italic text-foreground font-medium">{t("about.mission4")}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
