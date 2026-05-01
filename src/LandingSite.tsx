import BackgroundField from "./components/landing/BackgroundField";
import Grain from "./components/landing/Grain";
import Nav from "./components/landing/Nav";
import Hero from "./components/landing/Hero";

import Services from "./components/landing/Services";
import Work from "./components/landing/Work";
import Process from "./components/landing/Process";
// import Stats from "./components/landing/Stats";
// import Testimonials from "./components/landing/Testimonials";
import Contact from "./components/landing/Contact";
import Footer from "./components/landing/Footer";
import { useLenis } from "./hooks/useLenis";

export default function LandingSite() {
  useLenis();

  return (
    <>
      {/* ── Global layer stack (fixed, behind content) ─────────────────────── */}
      <BackgroundField />
      <Grain />

      {/* ── Chrome ─────────────────────────────────────────────────────────── */}
      <Nav />

      {/* ── Narrative state machine ─────────────────────────────────────────── */}
      <main>
        {/* STATE 1: ORIENTATION */}
        <Hero />

        {/* STATE 3: MECHANISM */}
        <Services />

        {/* Supporting detail within Mechanism state */}
        <Work />
        <Process />

        {/* STATE 4: VALIDATION — Stats and Testimonials hidden until updated figures and real client quotes are confirmed */}
        {/* <Stats /> */}
        {/* <Testimonials /> */}

        {/* STATE 5: CONVERSION */}
        <Contact />
      </main>

      <Footer />
    </>
  );
}
