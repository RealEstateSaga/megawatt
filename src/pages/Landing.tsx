import { SiteProvider } from "@/context/SiteContext";
import LandingSite from "@/LandingSite";

export default function Landing() {
  return (
    <div className="landing-root min-h-screen bg-bg text-off">
      <SiteProvider>
        <LandingSite />
      </SiteProvider>
    </div>
  );
}
