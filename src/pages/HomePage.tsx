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
    <div className="bg-black min-h-screen text-white gold-line-wrapper gold-accent-right">
      <Navbar />
      <Hero />
      <div className="gold-divider" />
      <Services />
      <div className="gold-divider" />
      <ProjectsShowcase />
      <div className="gold-divider" />
      <WhyUs />
      <TechStack />
      <div className="gold-divider" />
      <Pricing />
      <div className="gold-divider" />
      <HowItWorks />
      <div className="gold-divider" />
      <Testimonials />
      <CTA />
      <div className="gold-divider" />
      <Contact />
      <div className="gold-divider" />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
