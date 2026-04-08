import AboutSection from "@/components/about/AboutSection";
import { useSeo } from "@/hooks/use-seo";

const About = () => {
  useSeo("about.title", "about.metaDescription");

  return (
    <main>
      <AboutSection />
    </main>
  );
};

export default About;
