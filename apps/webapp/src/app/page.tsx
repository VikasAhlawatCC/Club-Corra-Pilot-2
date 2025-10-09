import { Footer } from "@/components/footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SelectedBrands from "@/components/SelectedBrands";

export default function Home() {
  return (
    <div className="font-sans">
      <main className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Hero />
        <SelectedBrands />
        <HowItWorks />
        <Footer />
      </main>
    </div>
  );
}
