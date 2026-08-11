import Hero from "@/src/features/landing/components/Hero";
import About from "@/src/features/landing/components/About";
import CoreValues from "@/src/features/landing/components/CoreValues";
import Products from "@/src/features/landing/components/Products";
import Careers from "@/src/features/landing/components/Careers";
import News from "@/src/features/landing/components/News";

export default function Home() {
  return (
    <>
      {/* Hero section with branding, intro & dynamic background */}
      <Hero />

      {/* About TalentCore stats & brief intro */}
      <About />

      {/* Core Values defining the business culture */}
      <CoreValues />

      {/* Products & Solutions showcase */}
      <Products />

      {/* Career paths and cultural fit highlights */}
      <Careers />

      {/* News updates & Newsletter subscription block */}
      <News />
    </>
  );
}

