import { useEffect } from "react";
import { SiteProvider } from "@/context/SiteContext";
import LandingSite from "@/LandingSite";

export default function Landing() {
  // Apply cursor:none to body while on the landing page; restore on unmount.
  // Also marks the document for the .landing-root scoped CSS overrides.
  useEffect(() => {
    document.body.classList.add("landing-cursor");
    return () => {
      document.body.classList.remove("landing-cursor");
    };
  }, []);

  return (
    <div className="landing-root min-h-screen bg-bg text-off">
      <SiteProvider>
        <LandingSite />
      </SiteProvider>
    </div>
  );
}
