import BackgroundField from "./components/landing/BackgroundField";
import Grain from "./components/landing/Grain";
import Nav from "./components/landing/Nav";
import Hero from "./components/landing/Hero";
import Services from "./components/landing/Services";
import Contact from "./components/landing/Contact";
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
        <Hero />
        <Services />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
