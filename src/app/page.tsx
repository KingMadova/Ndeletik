import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { KineticBand } from "@/components/sections/KineticBand";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaJoin } from "@/components/sections/CtaJoin";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <KineticBand />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <CtaJoin />
      <Footer />
    </main>
  );
}