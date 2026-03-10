import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Truck, Users, Clock, Star } from "lucide-react";

const icons = [Truck, Users, Clock, Star];

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

interface StatItem {
  value: number;
  suffix: string;
  labelKey: string;
}

const CounterStats = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const stats: StatItem[] = [
    { value: 10, suffix: "+", labelKey: "stats.vehicles" },
    { value: 100, suffix: "%", labelKey: "stats.satisfaction" },
    { value: 24, suffix: "/7", labelKey: "stats.availability" },
    { value: 5, suffix: "min", labelKey: "stats.booking" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
      {stats.map((stat, i) => {
        const Icon = icons[i];
        const count = useCountUp(stat.value, 1800, inView);
        return (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-card"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums">
              {count}
              <span className="text-primary">{stat.suffix}</span>
            </span>
            <span className="text-sm text-muted-foreground mt-1 font-medium">{t(stat.labelKey)}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CounterStats;
