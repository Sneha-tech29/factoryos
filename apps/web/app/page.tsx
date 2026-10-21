import { Navbar } from "@/components/hero/Navbar";
import { Hero } from "@/components/hero/Hero";
import { AboutSection } from "@/components/sections/AboutSection";
import { WorkflowScrollytelling } from "@/components/sections/WorkflowScrollytelling";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SolutionsSection } from "@/components/sections/SolutionsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-primary selection:bg-cyan/30 flex flex-col justify-between overflow-x-hidden">
      <Navbar />
      <Hero />
      <AboutSection />
      <WorkflowScrollytelling />
      <FeaturesSection />
      <SolutionsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
