import Nav from "./components/landing/Nav";
import Services from "./components/landing/Services";
import Footer from "./components/landing/Footer";

export default function LandingSite() {
  return (
    <>
      <Nav />

      <main>
        {/* Unified pillar stack — Hero, services, and Contact all live inside */}
        <Services />
      </main>

      <Footer />
    </>
  );
}
