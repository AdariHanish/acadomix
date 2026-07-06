import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import ProjectsShowcase from '../components/ProjectsShowcase';
import WhyUs from '../components/WhyUs';
import TechStack from '../components/TechStack';
import Pricing from '../components/Pricing';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useScrollHoverFix } from '../hooks/useScrollHoverFix';

export default function HomePage() {
  useScrollHoverFix();

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <Hero />
      <Services />
      <ProjectsShowcase />
      <WhyUs />
      <TechStack />
      <Pricing />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
