import BackgroundField from "./components/landing/BackgroundField";
import Grain from "./components/landing/Grain";
import Nav from "./components/landing/Nav";
import Services from "./components/landing/Services";
import Footer from "./components/landing/Footer";
import { useLenis } from "./hooks/useLenis";

export default function LandingSite() {
  useLenis();

  return (
    <>
      <BackgroundField />
      <Grain />
      <Nav />

      <main>
        {/* Unified pillar stack — Hero, services, and Contact all live inside */}
        <Services />
      </main>

      <Footer />
    </>
  );
}
