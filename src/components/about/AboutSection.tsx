import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Warehouse, Lightbulb, ShieldCheck, Target } from "lucide-react";
import aboutHub from "@/assets/about-hub.webp";

const hubIcons = [Check, Check, Check, Check];

const philoIcons = [Lightbulb, ShieldCheck, Target];

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

        {/* Intro text + image */}
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

        {/* Solution — scannable */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">{t("about.solutionTitle")}</h3>
          <p className="text-muted-foreground text-center mb-2">{t("about.solutionIntro")}</p>
          <p className="text-muted-foreground text-center mb-6">{t("about.solutionNeed")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
            {(t("about.solutionList", { returnObjects: true }) as string[]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center font-semibold text-foreground">{t("about.solutionConclusion")}</p>
        </motion.div>

        {/* Hub concept */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">{t("about.hubTitle")}</h3>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-8 whitespace-pre-line">
            {t("about.hubIntro")}
          </p>

          {/* Hub diagram */}
          <div className="relative max-w-3xl mx-auto">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(t("about.hubList", { returnObjects: true }) as string[]).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mt-6 font-semibold text-foreground">
            {t("about.hubConclusion")}
          </p>
        </motion.div>

        {/* Philosophie */}
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
              const PhiloIcon = philoIcons[i] ?? ShieldCheck;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <PhiloIcon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center overflow-hidden"
        >
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
