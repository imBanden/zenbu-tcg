import Header from "@/components/Header";
import HeroWall from "@/components/intro/HeroWall";
import SetsGrid from "@/components/SetsGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import PackIntro from "@/components/intro/PackIntro";
import { packCards } from "@/components/intro/lib/packCards";
import { sets } from "@/lib/sets";

export default function Home() {
  return (
    <>
      <PackIntro cards={packCards} />
      <Header />
      <main id="top">
        <HeroWall />
        <SetsGrid sets={sets} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
