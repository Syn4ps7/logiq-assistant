import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AboutSection from "@/components/about/AboutSection";

const About = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("about.title")} | LogIQ Transport`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = t("about.metaDescription");

    return () => {
      document.title = "LogIQ Transport";
    };
  }, [t]);

  return (
    <main>
      <AboutSection />
    </main>
  );
};

export default About;
