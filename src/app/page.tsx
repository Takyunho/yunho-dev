import CustomCursor from "@/components/layout/CustomCursor";
import Header from "@/components/layout/Header";
import SceneStateSync from "@/components/layout/SceneStateSync";
import SmoothScroll from "@/components/layout/SmoothScroll";
import SceneLoader from "@/components/scene/SceneLoader";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import HeroSection from "@/components/sections/HeroSection";
import LabSection from "@/components/sections/LabSection";
import StackSection from "@/components/sections/StackSection";
import WorkSection from "@/components/sections/WorkSection";

export default function Home() {
  return (
    <div className="relative">
      <SmoothScroll />
      <SceneStateSync />
      <SceneLoader />
      <Header />

      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <StackSection />
        <WorkSection />
        <LabSection />
        <ContactSection />
      </main>

      <CustomCursor />
    </div>
  );
}
