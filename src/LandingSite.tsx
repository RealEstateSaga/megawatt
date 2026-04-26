import Cursor from "./components/Cursor";
import CursorLighting from "./components/CursorLighting";
import BackgroundField from "./components/BackgroundField";
import Grain from "./components/Grain";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Services from "./components/Services";
import Work from "./components/Work";
import Process from "./components/Process";
import Stats from "./components/Stats";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { useLenis } from "./hooks/useLenis";

export default function LandingSite() {
  useLenis();

  return (
    <>
      {/* ── Global layer stack (fixed, behind content) ─────────────────────── */}
      <BackgroundField />
      <CursorLighting />
      <Grain />
      <Cursor />

      {/* ── Chrome ─────────────────────────────────────────────────────────── */}
      <Nav />

      {/* ── Narrative state machine ─────────────────────────────────────────── */}
      <main>
        {/* STATE 1: ORIENTATION */}
        <Hero />

        {/* Ambient divider between Orientation and Reframing */}
        <Marquee />

        {/* STATE 2: REFRAMING */}
        <About />

        {/* STATE 3: MECHANISM */}
        <Services />

        {/* Supporting detail within Mechanism state */}
        <Work />
        <Process />

        {/* STATE 4: VALIDATION */}
        <Stats />
        <Testimonials />

        {/* STATE 5: CONVERSION */}
        <Contact />
      </main>

      <Footer />
    </>
  );
}
