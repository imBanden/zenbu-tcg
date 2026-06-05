import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SetsGrid from "@/components/SetsGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { sets } from "@/lib/sets";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <SetsGrid sets={sets} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
